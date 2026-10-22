/**
 * A dashboard card for the lights of one room: a header with the room's toggle, a brightness bar for each dimmable
 * light, the other lights and switches as buttons, and the room's scenes, each placed by the lights it sets.
 */
import { LitElement, css, html, nothing } from "lit";
import type { CSSResultGroup, PropertyValues, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { CARD_VERSION, DEFAULT_ICON, KEY_DELAY_MS, KEY_STEP, PAGE_STEP } from "./const";
import "./editor";
import type { HassEntity, HomeAssistant } from "./hass";
import {
    areaLights,
    areaScenes,
    brightnessPct,
    domainOf,
    firstArea,
    friendlyName,
    isDimmable,
    isOn,
    isUnavailable,
    lightColor,
    lightName,
    lightsOf,
    placeOf,
    roomState,
    scenesOf,
} from "./lights";
import type { RoomState } from "./lights";
import { browserLanguage, translate } from "./localize/localize";
import type { LightConfig, RoomLightsCardConfig, SceneConfig } from "./types";

console.info(
    `%c  ROOM-LIGHTS-CARD \n%c  ${CARD_VERSION}     `,
    "color: orange; font-weight: bold; background: black",
    "color: white; font-weight: bold; background: dimgray",
);

interface CardRegistration {
    type: string;
    name: string;
    description: string;
    documentationURL?: string;
    preview?: boolean;
}

const registry = window as unknown as { customCards?: CardRegistration[] };
registry.customCards = registry.customCards ?? [];
registry.customCards.push({
    type: "room-lights-card",
    name: translate(browserLanguage(), "common.name"),
    description: translate(browserLanguage(), "common.description"),
    documentationURL: "https://github.com/jesmak/room-lights-card",
    preview: true,
});

/** A brightness set on the card that Home Assistant hasn't reported back yet, kept so the bar doesn't jump back meanwhile. */
interface Pending {
    pct: number;
    /** The light's state when it was set. Once the value is sent, a new state ends the wait, whatever it says. */
    state: HassEntity | undefined;
}

/** Where on a bar the pointer is, 0 to 100. Past either end counts as the end. */
function pctAt(event: PointerEvent, bar: HTMLElement): number {
    const box = bar.getBoundingClientRect();
    const share = box.width > 0 ? (event.clientX - box.left) / box.width : 0;
    return Math.round(Math.min(1, Math.max(0, share)) * 100);
}

@customElement("room-lights-card")
export class RoomLightsCard extends LitElement {
    @property({ attribute: false }) public hass?: HomeAssistant;
    @state() private config?: RoomLightsCardConfig;
    @state() private drag?: { entity: string; pct: number };
    @state() private pending = new Map<string, Pending>();
    @state() private flashed?: string;
    /** Key presses waiting to be sent, per light, as each light's keys are sent on their own. */
    private keyTimers = new Map<string, { timer: ReturnType<typeof setTimeout>; pct: number }>();

    public static getConfigElement(): HTMLElement {
        return document.createElement("room-lights-card-editor");
    }

    /** Added from the picker, the card shows the first area, by name, that has lights. */
    public static getStubConfig(hass?: HomeAssistant): Record<string, unknown> {
        const area = hass ? firstArea(hass) : undefined;
        if (!hass || !area) {
            return {};
        }
        const lights = areaLights(hass, area);
        return { area, lights, scenes: areaScenes(hass, area, lights) };
    }

    public setConfig(config: RoomLightsCardConfig): void {
        if (
            !config ||
            (config.lights !== undefined && !Array.isArray(config.lights)) ||
            (config.scenes !== undefined && !Array.isArray(config.scenes))
        ) {
            throw new Error(translate(browserLanguage(), "common.invalid_configuration"));
        }
        this.config = { ...config };
    }

    public getCardSize(): number {
        const lights = this.config ? lightsOf(this.config) : [];
        const bars = lights.filter((light) => isDimmable(this.hass?.states[light.entity])).length;
        return 2 + bars;
    }

    /** In a sections view the card takes a whole section by default and is never narrower than half of one. */
    public getGridOptions(): Record<string, unknown> {
        return { columns: 12, min_columns: 6, rows: "auto" };
    }

    /**
     * A change still waiting for its keys to stop is sent at once, not lost, when the card leaves the page. A drag still
     * under way is forgotten, as its release never comes, such as when a popup closes under the finger.
     */
    public disconnectedCallback(): void {
        super.disconnectedCallback();
        this.drag = undefined;
        for (const [entity, { timer, pct }] of this.keyTimers) {
            clearTimeout(timer);
            this.sendKeys(entity, pct);
        }
    }

    protected shouldUpdate(changed: PropertyValues): boolean {
        const previous = changed.get("hass") as HomeAssistant | undefined;
        if (!this.config || !this.hass || changed.size > 1 || !changed.has("hass") || !previous) {
            return true;
        }
        // The names come from the areas, the entities and their devices, the texts from the locale.
        if (
            previous.areas !== this.hass.areas ||
            previous.entities !== this.hass.entities ||
            previous.devices !== this.hass.devices ||
            previous.locale !== this.hass.locale
        ) {
            return true;
        }
        // Home Assistant hands the card every state change in the house. Only its own entities matter.
        return this.watched().some((id) => previous.states[id] !== this.hass?.states[id]);
    }

    protected willUpdate(changed: PropertyValues): void {
        if (changed.has("hass") && this.pending.size) {
            // A value whose keys are still waiting to be sent stays, whatever Home Assistant says about an earlier one.
            const waiting = new Map(
                [...this.pending].filter(([id, pending]) => this.keyTimers.has(id) || this.hass?.states[id] === pending.state),
            );
            if (waiting.size !== this.pending.size) {
                this.pending = waiting;
            }
        }
    }

    private watched(): string[] {
        const config = this.config!;
        return [
            ...lightsOf(config).map((light) => light.entity),
            ...scenesOf(config).map((scene) => scene.entity),
            ...[config.adaptive_lighting, config.turn_on_scene].filter((id): id is string => !!id),
        ];
    }

    protected render(): TemplateResult | typeof nothing {
        if (!this.hass || !this.config) {
            return nothing;
        }
        const hass = this.hass;
        const lights = lightsOf(this.config);
        const ids = lights.map((light) => light.entity);
        const scenes = scenesOf(this.config);
        const area = this.config.area ? hass.areas?.[this.config.area] : undefined;
        const names = new Map(lights.map((light) => [light.entity, light.name || lightName(hass, light.entity, ids, area?.name)]));
        const bars = lights.filter((light) => isDimmable(hass.states[light.entity]));
        const pills = lights.filter((light) => !isDimmable(hass.states[light.entity]));
        // A scene can only sit on a bar's row. One that sets an on/off light alone goes with the room's buttons.
        const places = new Map(
            scenes.map((scene) => {
                const place = placeOf(hass, scene, ids);
                return [scene, bars.some((light) => light.entity === place) ? place : "room"];
            }),
        );
        const roomScenes = scenes.filter((scene) => places.get(scene) === "room");
        const rowScenes = new Map(bars.map((light) => [light.entity, scenes.filter((scene) => places.get(scene) === light.entity)]));
        // Every row keeps room for as many scene buttons as the busiest one has, so the bars all end at the same line.
        const slots = Math.max(0, ...[...rowScenes.values()].map((list) => list.length));
        const labelled = lights.length > 1;
        return html`
            <ha-card>
                ${this.header(ids, area?.name, area?.icon ?? undefined, roomState(hass, ids))}
                ${
                    bars.length
                        ? html`<div class="bars" style="--rlc-slots: ${slots}">
                              ${bars.map((light) => this.bar(light, names.get(light.entity)!, labelled, rowScenes.get(light.entity)!, slots > 0))}
                          </div>`
                        : nothing
                }
                ${pills.length ? html`<div class="pills">${pills.map((light) => this.pill(light, names.get(light.entity)!))}</div>` : nothing}
                ${roomScenes.length ? html`<div class="chips">${roomScenes.map((scene) => this.sceneButton(scene, true))}</div>` : nothing}
                ${!lights.length && !scenes.length ? html`<div class="message">${this.text("common.empty")}</div>` : nothing}
            </ha-card>
        `;
    }

    /** The room's icon, which turns its lights on and off, its name and state, and Adaptive Lighting's switch. */
    private header(ids: string[], areaName: string | undefined, areaIcon: string | undefined, room: RoomState): TemplateResult {
        const config = this.config!;
        const name = config.name || areaName || this.text("common.lights");
        const icon = config.icon || areaIcon || DEFAULT_ICON;
        const on = room.on > 0;
        const adaptive = config.adaptive_lighting ? this.hass?.states[config.adaptive_lighting] : undefined;
        // With a single light, the name opens that light's dialog, as a light's label does on a card of several.
        const single = ids.length === 1 ? ids[0] : undefined;
        return html`
            <div class="header">
                ${
                    ids.length
                        ? html`<button
                              class="room-icon ${on ? "on" : ""}"
                              style=${room.color ? `--light-color: ${room.color}` : ""}
                              title=${this.text(on ? "common.turn_off" : "common.turn_on")}
                              aria-label=${this.text(on ? "common.turn_off" : "common.turn_on")}
                              @click=${() => this.toggleRoom(ids, on)}
                          >
                              <ha-icon .icon=${icon}></ha-icon>
                          </button>`
                        : html`<span class="room-icon"><ha-icon .icon=${icon}></ha-icon></span>`
                }
                <div class="title">
                    ${single ? html`<button class="name" @click=${() => this.moreInfo(single)}>${name}</button>` : html`<div class="name">${name}</div>`}
                    ${ids.length ? html`<div class="status">${this.status(ids, room)}</div>` : nothing}
                </div>
                ${
                    config.adaptive_lighting
                        ? html`<button
                              class="icon-button adaptive ${isOn(adaptive) ? "on" : ""}"
                              title=${this.text("common.adaptive_lighting")}
                              aria-label=${this.text("common.adaptive_lighting")}
                              aria-pressed=${isOn(adaptive) ? "true" : "false"}
                              ?disabled=${isUnavailable(adaptive)}
                              @click=${() => this.call("switch", "toggle", config.adaptive_lighting!)}
                          >
                              <ha-icon icon="mdi:theme-light-dark"></ha-icon>
                          </button>`
                        : nothing
                }
            </div>
        `;
    }

    /** "60 % · 2/3 on". The brightness is the average of the dimmable lights that are on. */
    private status(ids: string[], room: RoomState): string {
        if (ids.every((id) => isUnavailable(this.hass?.states[id]))) {
            return this.text("common.unavailable");
        }
        if (room.on === 0) {
            return this.text("common.off");
        }
        const parts = [room.brightness !== undefined ? this.percent(room.brightness) : this.text("common.on")];
        if (room.total > 1) {
            parts.push(this.text("common.lights_on", { on: String(room.on), total: String(room.total) }));
        }
        return parts.join(" · ");
    }

    private bar(light: LightConfig, name: string, labelled: boolean, scenes: SceneConfig[], reserve: boolean): TemplateResult {
        const entity = this.hass?.states[light.entity];
        const unavailable = isUnavailable(entity);
        const actual = brightnessPct(entity) ?? (isOn(entity) ? 100 : 0);
        // An unavailable light shows nothing set, whatever was waiting for it.
        const shown = unavailable
            ? 0
            : this.drag?.entity === light.entity
              ? this.drag.pct
              : (this.pending.get(light.entity)?.pct ?? actual);
        const value = unavailable ? this.text("common.unavailable") : shown > 0 ? this.percent(shown) : this.text("common.off");
        return html`
            <div class="row">
                ${labelled ? html`<button class="label" @click=${() => this.moreInfo(light.entity)}>${name}</button>` : nothing}
                <div
                    class="bar ${shown > 0 ? "on" : ""} ${unavailable ? "unavailable" : ""}"
                    style="--light-color: ${lightColor(entity) ?? "var(--state-light-active-color, #ff9800)"}"
                    role="slider"
                    tabindex=${unavailable ? "-1" : "0"}
                    aria-label=${this.text("common.brightness", { name })}
                    aria-valuemin="0"
                    aria-valuemax="100"
                    aria-valuenow=${shown}
                    aria-valuetext=${value}
                    aria-disabled=${unavailable ? "true" : "false"}
                    @pointerdown=${(event: PointerEvent) => this.dragStart(event, light.entity)}
                    @pointermove=${this.dragMove}
                    @pointerup=${this.dragEnd}
                    @pointercancel=${this.dragCancel}
                    @keydown=${(event: KeyboardEvent) => this.key(event, light.entity, shown)}
                >
                    <div class="fill" style="width: ${shown}%"></div>
                    <span class="value">${value}</span>
                </div>
                ${reserve ? html`<div class="row-scenes">${scenes.map((scene) => this.sceneButton(scene, false))}</div>` : nothing}
            </div>
        `;
    }

    private pill(light: LightConfig, name: string): TemplateResult {
        const entity = this.hass?.states[light.entity];
        return html`
            <button
                class="pill ${isOn(entity) ? "on" : ""}"
                ?disabled=${isUnavailable(entity)}
                aria-pressed=${isOn(entity) ? "true" : "false"}
                @click=${() => this.call("homeassistant", "toggle", light.entity)}
            >
                ${entity ? html`<ha-state-icon .hass=${this.hass} .stateObj=${entity}></ha-state-icon>` : html`<ha-icon icon="mdi:help-circle-outline"></ha-icon>`}
                <span>${name}</span>
            </button>
        `;
    }

    /** A scene as a named button with the room's, or as an icon on a light's row. */
    private sceneButton(scene: SceneConfig, named: boolean): TemplateResult {
        const entity = this.hass?.states[scene.entity];
        const name = scene.name || (this.hass ? friendlyName(this.hass, scene.entity) : scene.entity);
        const icon = scene.icon
            ? html`<ha-icon .icon=${scene.icon}></ha-icon>`
            : entity
              ? html`<ha-state-icon .hass=${this.hass} .stateObj=${entity}></ha-state-icon>`
              : html`<ha-icon icon="mdi:palette"></ha-icon>`;
        const flashed = this.flashed === scene.entity ? "flash" : "";
        const activate = (): void => this.activate(scene.entity);
        return named
            ? html`<button class="chip ${flashed}" ?disabled=${isUnavailable(entity)} @click=${activate}>
                  ${icon}<span>${name}</span>
              </button>`
            : html`<button
                  class="icon-button scene ${flashed}"
                  title=${name}
                  aria-label=${name}
                  ?disabled=${isUnavailable(entity)}
                  @click=${activate}
              >
                  ${icon}
              </button>`;
    }

    private dragStart(event: PointerEvent, entity: string): void {
        if (event.button > 0 || isUnavailable(this.hass?.states[entity])) {
            return;
        }
        const bar = event.currentTarget as HTMLElement;
        bar.setPointerCapture?.(event.pointerId);
        this.drag = { entity, pct: pctAt(event, bar) };
    }

    private dragMove = (event: PointerEvent): void => {
        if (this.drag) {
            this.drag = { ...this.drag, pct: pctAt(event, event.currentTarget as HTMLElement) };
        }
    };

    /** The change is sent when the bar is let go, not while it moves, so a light gets one command per drag. */
    private dragEnd = (event: PointerEvent): void => {
        if (!this.drag) {
            return;
        }
        const { entity } = this.drag;
        const pct = pctAt(event, event.currentTarget as HTMLElement);
        this.drag = undefined;
        // A light that went unavailable during the drag can't be set, as with keys waiting on it.
        if (!isUnavailable(this.hass?.states[entity])) {
            this.setBrightness(entity, pct);
        }
    };

    /** The browser took the pointer for scrolling: nothing is sent. */
    private dragCancel = (): void => {
        this.drag = undefined;
    };

    private key(event: KeyboardEvent, entity: string, current: number): void {
        const steps: Record<string, number> = {
            ArrowRight: KEY_STEP,
            ArrowUp: KEY_STEP,
            ArrowLeft: -KEY_STEP,
            ArrowDown: -KEY_STEP,
            PageUp: PAGE_STEP,
            PageDown: -PAGE_STEP,
        };
        const target = event.key === "Home" ? 0 : event.key === "End" ? 100 : event.key in steps ? current + steps[event.key] : undefined;
        if (target === undefined || isUnavailable(this.hass?.states[entity])) {
            return;
        }
        event.preventDefault();
        const pct = Math.min(100, Math.max(0, target));
        this.pending = new Map(this.pending).set(entity, { pct, state: this.hass?.states[entity] });
        clearTimeout(this.keyTimers.get(entity)?.timer);
        const timer = setTimeout(() => this.sendKeys(entity, pct), KEY_DELAY_MS);
        this.keyTimers.set(entity, { timer, pct });
    }

    /** A light that went unavailable while its keys waited can't be set, so its value is dropped instead. */
    private sendKeys(entity: string, pct: number): void {
        this.keyTimers.delete(entity);
        if (isUnavailable(this.hass?.states[entity])) {
            this.dropPending(entity);
        } else {
            this.setBrightness(entity, pct);
        }
    }

    /** 0 turns the light off. A value sent replaces any key presses still waiting on the light, as a drag's does. */
    private setBrightness(entity: string, pct: number): void {
        clearTimeout(this.keyTimers.get(entity)?.timer);
        this.keyTimers.delete(entity);
        const sent: Pending = { pct, state: this.hass?.states[entity] };
        this.pending = new Map(this.pending).set(entity, sent);
        const call =
            pct > 0
                ? this.hass?.callService("light", "turn_on", { entity_id: entity, brightness_pct: pct })
                : this.hass?.callService("light", "turn_off", { entity_id: entity });
        // A refused command leaves the light as it was, so the bar goes back to saying so, unless a newer value, such as
        // a key press, has taken this one's place meanwhile.
        call?.catch(() => {
            if (this.pending.get(entity) === sent) {
                this.dropPending(entity);
            }
        });
    }

    private dropPending(entity: string): void {
        const pending = new Map(this.pending);
        pending.delete(entity);
        this.pending = pending;
    }

    /** Off when any light is on. On is the card's choice: all its lights, some of them, or a scene or script. */
    private toggleRoom(ids: string[], on: boolean): void {
        const config = this.config!;
        if (on) {
            this.call("homeassistant", "turn_off", ids);
        } else if (config.turn_on === "scene" && config.turn_on_scene) {
            this.activate(config.turn_on_scene);
        } else {
            const chosen = config.turn_on === "lights" ? (config.turn_on_lights ?? []).filter((id) => ids.includes(id)) : [];
            this.call("homeassistant", "turn_on", chosen.length ? chosen : ids);
        }
    }

    /** A scene has no state to show it ran, so its button flashes instead. */
    private activate(entityId: string): void {
        this.call(domainOf(entityId), "turn_on", entityId);
        this.flashed = entityId;
        setTimeout(() => {
            if (this.flashed === entityId) {
                this.flashed = undefined;
            }
        }, 600);
    }

    private call(domain: string, service: string, entityId: string | string[]): void {
        void this.hass?.callService(domain, service, { entity_id: entityId });
    }

    private moreInfo(entityId: string): void {
        this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId }, bubbles: true, composed: true }));
    }

    private percent(pct: number): string {
        return new Intl.NumberFormat(this.language(), { style: "percent" }).format(pct / 100);
    }

    /** A text in the viewer's language, with `{name}` in it replaced, so a translation can put the value where it reads right. */
    private text(key: string, values: Record<string, string> = {}): string {
        return translate(this.language(), key).replace(/\{(\w+)\}/g, (match, name: string) => values[name] ?? match);
    }

    private language(): string {
        return this.hass?.locale?.language ?? this.hass?.language ?? browserLanguage();
    }

    static get styles(): CSSResultGroup {
        return css`
            ha-card {
                container-type: inline-size;
                padding: 12px;
                --rlc-quiet: color-mix(in srgb, var(--primary-text-color) 8%, transparent);
            }

            button {
                padding: 0;
                border: none;
                background: none;
                color: inherit;
                font: inherit;
                text-align: left;
                cursor: pointer;
            }

            button:disabled {
                opacity: 0.5;
                cursor: default;
            }

            .header {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .room-icon {
                flex: none;
                display: grid;
                place-items: center;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: var(--rlc-quiet);
                color: var(--state-icon-color, var(--secondary-text-color));
                --mdc-icon-size: 22px;
            }

            span.room-icon {
                cursor: default;
            }

            .room-icon.on {
                color: var(--light-color, var(--state-light-active-color, #ff9800));
                background: color-mix(in srgb, var(--light-color, var(--state-light-active-color, #ff9800)) 25%, transparent);
            }

            .title {
                flex: 1;
                min-width: 0;
            }

            .name {
                font-size: 16px;
                font-weight: var(--ha-font-weight-medium, 500);
                line-height: 1.3;
                overflow-wrap: anywhere;
            }

            .status {
                font-size: 12px;
                color: var(--secondary-text-color);
                font-variant-numeric: tabular-nums;
            }

            .icon-button {
                flex: none;
                display: grid;
                place-items: center;
                width: 36px;
                height: 36px;
                border-radius: 50%;
                color: var(--secondary-text-color);
                --mdc-icon-size: 20px;
            }

            .icon-button:hover:not(:disabled) {
                background: var(--rlc-quiet);
            }

            .adaptive {
                opacity: 0.45;
            }

            .adaptive.on {
                opacity: 1;
                color: var(--primary-color);
            }

            .bars {
                display: flex;
                flex-direction: column;
                gap: 8px;
                margin-top: 10px;
            }

            .row {
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .label {
                flex: 0 0 clamp(64px, 28%, 128px);
                font-size: 13px;
                line-height: 1.25;
                overflow-wrap: anywhere;
            }

            .bar {
                position: relative;
                flex: 1;
                min-width: 0;
                height: 32px;
                border-radius: 8px;
                overflow: hidden;
                background: var(--rlc-quiet);
                cursor: pointer;
                touch-action: pan-y;
                user-select: none;
            }

            .bar:focus-visible {
                outline: 2px solid var(--primary-color);
                outline-offset: 2px;
            }

            .bar.unavailable {
                opacity: 0.5;
                cursor: default;
            }

            .fill {
                position: absolute;
                inset: 0 auto 0 0;
                background: var(--light-color);
                opacity: 0.6;
                pointer-events: none;
            }

            .row-scenes {
                flex: none;
                display: flex;
                justify-content: flex-end;
                width: calc(var(--rlc-slots) * 36px);
            }

            .value {
                position: absolute;
                top: 50%;
                right: 10px;
                transform: translateY(-50%);
                font-size: 12px;
                white-space: nowrap;
                font-variant-numeric: tabular-nums;
                pointer-events: none;
            }

            .pills,
            .chips {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
                margin-top: 10px;
            }

            .pill,
            .chip {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                box-sizing: border-box;
                max-width: 100%;
                min-height: 32px;
                padding: 4px 12px 4px 8px;
                border-radius: 16px;
                background: var(--rlc-quiet);
                font-size: 13px;
                --mdc-icon-size: 18px;
            }

            /* A light is filled, as a thing with a state, and a scene is outlined, as an action, so the two never look alike. */
            .chip {
                border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
                background: none;
            }

            .pill span,
            .chip span {
                overflow-wrap: anywhere;
            }

            .pill ha-state-icon,
            .chip ha-state-icon,
            .chip ha-icon {
                flex: none;
                color: var(--secondary-text-color);
            }

            .pill.on {
                background: color-mix(in srgb, var(--state-light-active-color, #ff9800) 22%, transparent);
            }

            .pill.on ha-state-icon {
                color: var(--state-light-active-color, #ff9800);
            }

            .flash {
                animation: flash 0.6s;
            }

            @keyframes flash {
                50% {
                    background: color-mix(in srgb, var(--primary-text-color) 30%, transparent);
                }
            }

            .message {
                padding-top: 8px;
                color: var(--secondary-text-color);
            }

            /* At half a section a light's name takes a line of its own above its bar. */
            @container (max-width: 279px) {
                .row {
                    flex-wrap: wrap;
                }

                .label {
                    flex-basis: 100%;
                }
            }
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "room-lights-card": RoomLightsCard;
    }
}
