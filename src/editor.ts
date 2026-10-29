/**
 * The card's visual editor: the area, with a button that fills in its lights and scenes, the name and icon, the lights
 * and scenes themselves, Adaptive Lighting's switch, what turning the room on does, and the card's height.
 */
import { LitElement, css, html, nothing } from "lit";
import type { CSSResultGroup, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import type { HomeAssistant } from "./hass";
import { heightData, heightSchema, tidyHeight } from "./height";
import { areaLights, areaScenes, domainOf, isDimmable, lightName, lightsIn, lightsOf, scenesOf } from "./lights";
import type { ScriptTargets } from "./lights";
import { browserLanguage, translate } from "./localize/localize";
import type { LightConfig, RoomLightsCardConfig, SceneConfig } from "./types";

interface SchemaEntry {
    name: string;
}

/**
 * The area's lights and scenes in place of the card's, whatever those were. Without an area, no lights and the scenes
 * that span areas. Choosing an area changes neither list: only the editor's button does this.
 */
export function fromArea(hass: HomeAssistant, config: RoomLightsCardConfig, scripts: ScriptTargets = {}): RoomLightsCardConfig {
    const lights = areaLights(hass, config.area);
    return { ...config, lights, scenes: areaScenes(hass, config.area, lights, scripts) };
}

/** The lights each script's configuration names. One that can't be read, such as for a user who isn't an admin, is left out. */
export async function readScripts(hass: HomeAssistant): Promise<ScriptTargets> {
    const ids = Object.keys(hass.states).filter((id) => domainOf(id) === "script");
    if (!hass.callWS) {
        return {};
    }
    const read = await Promise.all(
        ids.map((id) =>
            hass.callWS!<{ config: unknown }>({ type: "script/config", entity_id: id }).then(
                (answer) => [id, lightsIn(answer.config)] as const,
                () => undefined,
            ),
        ),
    );
    return Object.fromEntries(read.filter((entry) => entry !== undefined));
}

/** The configuration as short as it reads the same: bare entity ids where nothing else is set, and no defaults or empty fields. */
export function compact(config: RoomLightsCardConfig): RoomLightsCardConfig {
    const result: RoomLightsCardConfig = { ...config };
    const lights = lightsOf(config).map((light) => (light.name ? { entity: light.entity, name: light.name } : light.entity));
    const scenes = scenesOf(config).map((scene) => {
        const entry: SceneConfig = { entity: scene.entity };
        if (scene.name) {
            entry.name = scene.name;
        }
        if (scene.icon) {
            entry.icon = scene.icon;
        }
        if (scene.position && scene.position !== "auto") {
            entry.position = scene.position;
        }
        return Object.keys(entry).length > 1 ? entry : entry.entity;
    });
    result.lights = lights;
    result.scenes = scenes;
    if (result.turn_on !== "lights" || !result.turn_on_lights?.length) {
        delete result.turn_on_lights;
    }
    if (result.turn_on !== "scene") {
        delete result.turn_on_scene;
    }
    if (result.turn_on === "all") {
        delete result.turn_on;
    }
    for (const key of ["area", "name", "icon", "adaptive_lighting", "turn_on", "turn_on_scene", "lights", "scenes"] as const) {
        const value = result[key];
        if (value === undefined || value === null || value === "" || (Array.isArray(value) && !value.length)) {
            delete result[key];
        }
    }
    return result;
}

@customElement("room-lights-card-editor")
export class RoomLightsCardEditor extends LitElement {
    @property({ attribute: false }) public hass?: HomeAssistant;
    @state() private config: RoomLightsCardConfig = { type: "custom:room-lights-card" };

    public setConfig(config: RoomLightsCardConfig): void {
        this.config = { ...config };
    }

    protected render(): TemplateResult | typeof nothing {
        if (!this.hass) {
            return nothing;
        }
        const hass = this.hass;
        const lights = lightsOf(this.config);
        const ids = lights.map((light) => light.entity);
        const area = this.config.area ? hass.areas?.[this.config.area] : undefined;
        // The forms edit every light and scene in its long form, with the defaults shown.
        const data = {
            turn_on: "all",
            ...this.config,
            lights,
            scenes: scenesOf(this.config).map((scene) => ({ position: "auto", ...scene })),
        };
        const turnOn = this.config.turn_on ?? "all";
        // Separate forms, so that each list's helper, which Home Assistant's list of objects doesn't show, sits under it.
        return html`
            ${this.form(data, [
                { name: "area", selector: { area: {} } },
                {
                    type: "grid",
                    name: "",
                    schema: [
                        { name: "name", selector: { text: {} } },
                        { name: "icon", selector: { icon: { placeholder: area?.icon ?? undefined } } },
                    ],
                },
            ])}
            <div class="fill">
                <ha-button appearance="filled" size="small" @click=${this.fill}>${this.text("editor.fill")}</ha-button>
                <p class="helper">${this.text("editor.fill_helper")}</p>
            </div>
            ${this.form(data, [this.lightsField()])}
            <p class="helper">${this.text("editor.lights_helper")}</p>
            ${this.form(data, [this.scenesField(lights, area?.name)])}
            <p class="helper">${this.text("editor.scenes_helper")}</p>
            ${this.form(data, [
                { name: "adaptive_lighting", selector: { entity: { filter: [{ domain: "switch", integration: "adaptive_lighting" }] } } },
                {
                    name: "turn_on",
                    selector: {
                        select: {
                            mode: "dropdown",
                            options: [
                                { value: "all", label: this.text("editor.turn_on_all") },
                                { value: "lights", label: this.text("editor.turn_on_lights_option") },
                                { value: "scene", label: this.text("editor.turn_on_scene_option") },
                            ],
                        },
                    },
                },
                ...(turnOn === "lights"
                    ? [{ name: "turn_on_lights", selector: { entity: { multiple: true, include_entities: ids } } }]
                    : []),
                ...(turnOn === "scene"
                    ? [{ name: "turn_on_scene", selector: { entity: { filter: [{ domain: ["scene", "script"] }] } } }]
                    : []),
            ])}
            ${this.form(
                heightData(this.config),
                heightSchema(this.config, (key) => this.text(key)),
            )}
        `;
    }

    private form(data: Record<string, unknown>, schema: unknown[]): TemplateResult {
        return html`<ha-form
            .hass=${this.hass}
            .data=${data}
            .schema=${schema}
            .computeLabel=${(entry: SchemaEntry) => this.text(`editor.${entry.name}`)}
            .computeHelper=${(entry: SchemaEntry) => this.helper(entry.name)}
            @value-changed=${this.valueChanged}
        ></ha-form>`;
    }

    /** A field inside the object selector takes its helper from `description`, as ha-form's computeHelper doesn't reach it. */
    private lightsField(): Record<string, unknown> {
        return {
            name: "lights",
            selector: {
                object: {
                    multiple: true,
                    label_field: "entity",
                    description_field: "name",
                    fields: {
                        entity: {
                            label: this.text("editor.light_entity"),
                            required: true,
                            selector: { entity: { filter: [{ domain: ["light", "switch"] }] } },
                        },
                        name: {
                            label: this.text("editor.light_name"),
                            description: this.text("editor.light_name_helper"),
                            selector: { text: {} },
                        },
                    },
                },
            },
        };
    }

    /** A scene's place is offered among the card's dimmable lights, as only they have a row of their own. */
    private scenesField(lights: LightConfig[], areaName: string | undefined): Record<string, unknown> {
        const hass = this.hass!;
        const ids = lights.map((light) => light.entity);
        const rows = lights
            .filter((light) => isDimmable(hass.states[light.entity]))
            .map((light) => ({ value: light.entity, label: light.name || lightName(hass, light.entity, ids, areaName) }));
        return {
            name: "scenes",
            selector: {
                object: {
                    multiple: true,
                    label_field: "entity",
                    description_field: "name",
                    fields: {
                        entity: {
                            label: this.text("editor.scene_entity"),
                            required: true,
                            selector: { entity: { filter: [{ domain: ["scene", "script"] }] } },
                        },
                        name: { label: this.text("editor.scene_name"), selector: { text: {} } },
                        icon: { label: this.text("editor.scene_icon"), selector: { icon: {} } },
                        position: {
                            label: this.text("editor.position"),
                            selector: {
                                select: {
                                    mode: "dropdown",
                                    options: [
                                        { value: "auto", label: this.text("editor.position_auto") },
                                        { value: "room", label: this.text("editor.position_room") },
                                        ...rows,
                                    ],
                                },
                            },
                        },
                    },
                },
            },
        };
    }

    static get styles(): CSSResultGroup {
        return css`
            ha-form {
                display: block;
                margin-bottom: 8px;
            }

            .fill {
                margin: 0 0 16px;
                padding: 0 16px;
            }

            .fill .helper {
                margin: 6px 0 0;
                padding: 0;
            }

            .helper {
                margin: 0 0 16px;
                padding: 0 16px;
                font-size: 12px;
                line-height: 1.4;
                color: var(--secondary-text-color);
            }
        `;
    }

    private valueChanged(event: CustomEvent<{ value: RoomLightsCardConfig }>): void {
        this.changed(tidyHeight({ ...this.config, ...event.detail.value }));
    }

    private async fill(): Promise<void> {
        if (this.hass) {
            this.changed(fromArea(this.hass, this.config, await readScripts(this.hass)));
        }
    }

    private changed(config: RoomLightsCardConfig): void {
        this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: compact(config) }, bubbles: true, composed: true }));
    }

    private text(key: string): string {
        return translate(this.language(), key);
    }

    private helper(name: string): string | undefined {
        const key = `editor.${name}_helper`;
        const helper = translate(this.language(), key);
        return helper === key ? undefined : helper;
    }

    private language(): string {
        return this.hass?.locale?.language ?? this.hass?.language ?? browserLanguage();
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "room-lights-card-editor": RoomLightsCardEditor;
    }
}
