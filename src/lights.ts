/**
 * What the card knows about lights and scenes: which area an entity is in, a group's members, where a scene sits on
 * the card, the room's state, and what the editor fills in for an area.
 */
import type { HassEntity, HomeAssistant } from "./hass";
import type { LightConfig, RoomLightsCardConfig, SceneConfig } from "./types";

export const domainOf = (entityId: string): string => entityId.split(".")[0];

/** Lights may be written as a bare entity id. The card works on the long form. */
export function lightsOf(config: RoomLightsCardConfig): LightConfig[] {
    return longForm(config.lights) as LightConfig[];
}

export function scenesOf(config: RoomLightsCardConfig): SceneConfig[] {
    return longForm(config.scenes) as SceneConfig[];
}

function longForm(list: unknown): Array<{ entity: string }> {
    if (!Array.isArray(list)) {
        return [];
    }
    return list
        .map((item) => (typeof item === "string" ? { entity: item } : item))
        .filter(
            (item): item is { entity: string } => !!item && typeof item === "object" && typeof item.entity === "string" && !!item.entity,
        );
}

/** The area an entity is in: its own, or its device's. */
export function areaOf(hass: HomeAssistant, entityId: string): string | undefined {
    const entry = hass.entities?.[entityId];
    if (!entry) {
        return undefined;
    }
    return entry.area_id ?? (entry.device_id ? (hass.devices?.[entry.device_id]?.area_id ?? undefined) : undefined);
}

/** A light group's members. Home Assistant's groups list them in `entity_id`, Zigbee groups in `group_entities`. */
export function membersOf(entity: HassEntity | undefined): string[] {
    if (!entity || domainOf(entity.entity_id) !== "light") {
        return [];
    }
    return stringList(entity.attributes.entity_id ?? entity.attributes.group_entities);
}

/** The entities a scene sets. A script says nothing about what it does, so it has none. */
export function targetsOf(entity: HassEntity | undefined): string[] {
    return entity && domainOf(entity.entity_id) === "scene" ? stringList(entity.attributes.entity_id) : [];
}

function stringList(value: unknown): string[] {
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

/** A dimmable light is a bar. An on/off light or a switch is a pill. */
export function isDimmable(entity: HassEntity | undefined): boolean {
    const modes = entity?.attributes.supported_color_modes;
    return !!entity && domainOf(entity.entity_id) === "light" && Array.isArray(modes) && modes.some((mode) => mode !== "onoff");
}

export const isOn = (entity: HassEntity | undefined): boolean => entity?.state === "on";

export const isUnavailable = (entity: HassEntity | undefined): boolean => !entity || entity.state === "unavailable";

/** The brightness of a light that is on, 1 to 100. */
export function brightnessPct(entity: HassEntity | undefined): number | undefined {
    const brightness = entity?.attributes.brightness;
    return isOn(entity) && typeof brightness === "number" ? Math.max(1, Math.round((brightness / 255) * 100)) : undefined;
}

/**
 * The colour a light is shining in. Home Assistant gives every colour mode an `rgb_color`, white light included, and
 * white would vanish against a light theme, so a colour that close to white is left to the theme's, as Mushroom does.
 */
export function lightColor(entity: HassEntity | undefined): string | undefined {
    const rgb = entity?.attributes.rgb_color;
    if (!isOn(entity) || !Array.isArray(rgb) || rgb.length !== 3 || luminance(rgb as number[]) > WHITE_LUMINANCE) {
        return undefined;
    }
    return `rgb(${rgb.join(", ")})`;
}

/** Above this a colour reads as white. Mushroom's limit. */
const WHITE_LUMINANCE = 0.8;

/** WCAG's relative luminance, 0 for black and 1 for white. */
function luminance(rgb: number[]): number {
    const [r, g, b] = rgb.map((value) => {
        const share = value / 255;
        return share <= 0.04045 ? share / 12.92 : ((share + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Whether a scene's target is the card's light, directly or through a group, whichever of the two is the group. */
function touches(hass: HomeAssistant, light: string, target: string): boolean {
    return light === target || membersOf(hass.states[light]).includes(target) || membersOf(hass.states[target]).includes(light);
}

/**
 * Where a scene sits: the one light or switch of the card it touches, or the room's buttons when it touches several,
 * none, or can't say (a script). A place set by hand wins, if it names a light still on the card. Only a dimmable
 * light has a row, so the card puts a scene placed on anything else with the room's buttons.
 */
export function placeOf(hass: HomeAssistant, scene: SceneConfig, lights: string[]): string {
    if (scene.position && scene.position !== "auto") {
        return lights.includes(scene.position) ? scene.position : "room";
    }
    const targets = targetsOf(hass.states[scene.entity]);
    const touched = lights.filter((light) => targets.some((target) => touches(hass, light, target)));
    return touched.length === 1 ? touched[0] : "room";
}

/** The areas whose lights a scene sets. A group with no area of its own counts by its members'. */
export function sceneAreas(hass: HomeAssistant, sceneId: string): Set<string> {
    const areas = new Set<string>();
    for (const target of targetsOf(hass.states[sceneId])) {
        if (domainOf(target) !== "light") {
            continue;
        }
        const own = areaOf(hass, target);
        for (const area of own ? [own] : membersOf(hass.states[target]).map((member) => areaOf(hass, member))) {
            if (area) {
                areas.add(area);
            }
        }
    }
    return areas;
}

export interface RoomState {
    on: number;
    total: number;
    /** The average brightness of the dimmable lights that are on. */
    brightness?: number;
    /** The colour of the first light that is on, if it has one to show. */
    color?: string;
}

export function roomState(hass: HomeAssistant, lights: string[]): RoomState {
    const on = lights.map((id) => hass.states[id]).filter(isOn);
    const levels = on.map(brightnessPct).filter((level): level is number => level !== undefined);
    return {
        on: on.length,
        total: lights.length,
        brightness: levels.length ? Math.round(levels.reduce((sum, level) => sum + level, 0) / levels.length) : undefined,
        color: lightColor(on[0]),
    };
}

/**
 * What a light that lists members is. A Zigbee group is a device of its own whose bulbs are switched together, so it
 * stands in for them. A Home Assistant light group is someone's grouping of different lights, and a light whose
 * members are on its own device is a controller's main switch (WLED's), which can be on while its segments are dark.
 * Those two are left out, and their members offered instead.
 */
function groupKind(hass: HomeAssistant, entityId: string): "none" | "stands-in" | "left-out" {
    const members = membersOf(hass.states[entityId]);
    if (!members.length) {
        return "none";
    }
    const entry = hass.entities?.[entityId];
    if (entry?.platform === "group") {
        return "left-out";
    }
    const device = entry?.device_id;
    return device && members.some((member) => hass.entities?.[member]?.device_id === device) ? "left-out" : "stands-in";
}

/**
 * The lights the editor fills in for an area: the visible ones there, with a Zigbee group in place of its bulbs, in
 * name order. A card with no area gets none, as the lights with no area are usually groups of lights on other cards.
 */
export function areaLights(hass: HomeAssistant, area: string | undefined): string[] {
    if (!area) {
        return [];
    }
    const lights = Object.values(hass.entities ?? {})
        .filter((entry) => !!entry && domainOf(entry.entity_id) === "light" && !entry.hidden && !entry.entity_category)
        .map((entry) => entry!.entity_id)
        .filter((id) => hass.states[id] && areaOf(hass, id) === area);
    const replaced = new Set(lights.filter((id) => groupKind(hass, id) === "stands-in").flatMap((id) => membersOf(hass.states[id])));
    return lights
        .filter((id) => !replaced.has(id) && groupKind(hass, id) !== "left-out")
        .sort((a, b) => friendlyName(hass, a).localeCompare(friendlyName(hass, b)));
}

/**
 * The scenes and scripts the editor fills in. For an area, its own and any scene elsewhere that sets one of the
 * card's lights, unless the scene also sets another area's lights. Without an area, the scenes that span areas.
 */
export function areaScenes(hass: HomeAssistant, area: string | undefined, lights: string[]): string[] {
    const scenes = Object.keys(hass.states).filter((id) => ["scene", "script"].includes(domainOf(id)));
    const chosen = area
        ? scenes.filter((id) => {
              const areas = sceneAreas(hass, id);
              if ([...areas].some((other) => other !== area)) {
                  return false;
              }
              return (
                  areaOf(hass, id) === area ||
                  targetsOf(hass.states[id]).some((target) => lights.some((light) => touches(hass, light, target)))
              );
          })
        : scenes.filter((id) => sceneAreas(hass, id).size >= 2);
    return chosen.sort((a, b) => friendlyName(hass, a).localeCompare(friendlyName(hass, b)));
}

export function friendlyName(hass: HomeAssistant, entityId: string): string {
    const name = hass.states[entityId]?.attributes.friendly_name;
    return typeof name === "string" && name ? name : entityId;
}

/**
 * A light's name on the card when none is set: its device's name when the card has no other light of that device,
 * otherwise the device's and its own, and the area's name taken out, as the card already says it.
 */
export function lightName(hass: HomeAssistant, entityId: string, lights: string[], areaName: string | undefined): string {
    const state = hass.states[entityId];
    if (!state) {
        return entityId;
    }
    const device = hass.entities?.[entityId]?.device_id;
    const alone = !!device && lights.filter((id) => hass.entities?.[id]?.device_id === device).length === 1;
    let name = "";
    if (hass.formatEntityName) {
        name =
            (alone ? hass.formatEntityName(state, [{ type: "device" }]) : "") ||
            hass.formatEntityName(state, [{ type: "device" }, { type: "entity" }]);
    }
    name = name || friendlyName(hass, entityId);
    return withoutArea(name, areaName);
}

/** What may stand between the words of a device's name, as in "Hue - Office lamp" or "Lamp, Office". */
const SEPARATORS = "\\s,|/\\-–—";

/**
 * "Alasvalot keittiö" in Keittiö is "Alasvalot", and "Hue - Office lamp" in Office is "Hue lamp": the area's name goes
 * with the separators before it, or after it at the start. A name without the area's in it, or with nothing else, stays
 * as it is, and only a name that started with the area's gets a capital letter where the area was.
 */
export function withoutArea(name: string, areaName: string | undefined): string {
    if (!areaName) {
        return name;
    }
    const area = areaName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const first = new RegExp(`^${area}[${SEPARATORS}]+`, "iu");
    const started = first.test(name);
    const shorter = name
        .replace(first, "")
        .replace(new RegExp(`[${SEPARATORS}]+${area}(?=[${SEPARATORS}]|$)`, "giu"), "")
        .trim();
    if (!shorter || shorter === name.trim()) {
        return name;
    }
    return started ? shorter.charAt(0).toLocaleUpperCase() + shorter.slice(1) : shorter;
}

/** The first area, by name, that has lights to fill in, for a card added from the picker. */
export function firstArea(hass: HomeAssistant): string | undefined {
    return Object.values(hass.areas ?? {})
        .filter((area) => !!area)
        .sort((a, b) => a!.name.localeCompare(b!.name))
        .map((area) => area!.area_id)
        .find((area) => areaLights(hass, area).length > 0);
}
