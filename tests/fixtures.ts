import { vi } from "vitest";

import type { EntityEntry, HassEntity, HomeAssistant, NamePart } from "../src/hass";

/** A made-up house: an office whose ceiling light has a white and a ring part, a living room, a garden. */
interface Made {
    state?: string;
    attributes?: Record<string, unknown>;
    entry?: Partial<EntityEntry>;
    /** The device's name, for formatEntityName. */
    device?: string;
    /** The entity's own part of its name. */
    own?: string;
}

const CT = { supported_color_modes: ["color_temp", "xy"] };
const ONOFF = { supported_color_modes: ["onoff"] };

export const ENTITIES: Record<string, Made> = {
    "light.ceiling_office_white": {
        state: "on",
        attributes: { ...CT, brightness: 255, rgb_color: [255, 240, 220] },
        entry: { device_id: "ceiling_office" },
        device: "Ceiling office",
        own: "Light",
    },
    "light.ceiling_office_ring": {
        state: "off",
        attributes: CT,
        entry: { device_id: "ceiling_office" },
        device: "Ceiling office",
        own: "Ring",
    },
    "light.led_strip_office": {
        state: "on",
        attributes: { supported_color_modes: ["rgbw"], brightness: 102, rgb_color: [0, 120, 255] },
        entry: { device_id: "led_strip" },
        device: "LED strip office",
        own: "Light",
    },
    "light.desk_lamp": { state: "on", attributes: ONOFF, entry: { area_id: "office" } },
    "light.clock_indicator": { attributes: { supported_color_modes: ["rgb"] }, entry: { area_id: "office", entity_category: "config" } },
    "light.hidden_light": { attributes: CT, entry: { area_id: "office", hidden: true } },
    "light.office_lights": {
        attributes: { ...CT, entity_id: ["light.ceiling_office_white", "light.ceiling_office_ring", "light.led_strip_office"] },
        entry: { area_id: "office", platform: "group" },
    },
    // A controller's main light, listing the strip's segments on its own device, as WLED's does.
    "light.strip_main": {
        state: "on",
        attributes: {
            supported_color_modes: ["brightness"],
            brightness: 128,
            group_entities: ["light.led_strip_office", "light.strip_segment"],
        },
        entry: { device_id: "led_strip" },
    },
    "light.strip_segment": { attributes: { supported_color_modes: ["rgbw"] }, entry: { device_id: "led_strip" } },
    "light.everything": {
        attributes: { ...CT, entity_id: ["light.downlight_living_1", "light.ceiling_office_white"] },
        entry: { platform: "group" },
    },
    "light.downlights_living": {
        attributes: { ...CT, group_entities: ["light.downlight_living_1", "light.downlight_living_2"] },
        entry: { device_id: "downlight_group", platform: "mqtt" },
    },
    "light.downlight_living_1": { attributes: CT, entry: { area_id: "living_room" } },
    "light.downlight_living_2": { attributes: CT, entry: { area_id: "living_room" } },
    "light.bar_strip": { state: "unavailable", attributes: { supported_color_modes: ["rgbw"] }, entry: { area_id: "living_room" } },
    "light.lanterns": {
        attributes: { ...CT, entity_id: ["light.lantern_left", "light.lantern_right"] },
        entry: { area_id: "garden", platform: "group" },
    },
    "light.lantern_left": { attributes: CT, entry: { area_id: "garden" } },
    "light.lantern_right": { attributes: CT, entry: { area_id: "garden" } },
    "light.floodlight": { attributes: ONOFF, entry: { area_id: "garden" } },
    "switch.terrace_socket": { state: "on", entry: { area_id: "garden" } },
    "switch.adaptive_living": { state: "on", entry: { area_id: "living_room" } },
    "scene.office_bright": {
        attributes: { entity_id: ["switch.wall_relay", "light.ceiling_office_white", "light.ceiling_office_ring"] },
        entry: { area_id: "office" },
    },
    "scene.office_music": {
        attributes: { entity_id: ["select.strip_palette", "light.led_strip_office", "light.ceiling_office_ring"] },
        entry: { area_id: "office" },
    },
    "scene.office_strip_night": { attributes: { entity_id: ["light.led_strip_office"] }, entry: {} },
    "scene.office_group": { attributes: { entity_id: ["light.office_lights"] }, entry: {} },
    "scene.living_bright": { attributes: { entity_id: ["light.downlights_living"] }, entry: { area_id: "living_room" } },
    "scene.living_one": { attributes: { entity_id: ["light.downlight_living_1"] }, entry: { area_id: "living_room" } },
    "scene.bar_party": { attributes: { entity_id: ["light.bar_strip", "select.bar_palette"] }, entry: { area_id: "living_room" } },
    "scene.both_rooms": {
        attributes: { entity_id: ["light.downlight_living_1", "light.ceiling_office_white"] },
        entry: { area_id: "living_room" },
    },
    "scene.strip_with_relay": {
        attributes: { entity_id: ["switch.wall_relay", "select.strip_palette", "light.led_strip_office"] },
        entry: {},
    },
    "scene.garden_evening": { attributes: { entity_id: ["light.lanterns", "switch.terrace_socket"] }, entry: { area_id: "garden" } },
    "scene.floodlight_on": { attributes: { entity_id: ["light.floodlight"] }, entry: {} },
    "scene.everything": { attributes: { entity_id: ["light.everything"] }, entry: {} },
    "scene.terrace_only": { attributes: { entity_id: ["switch.terrace_socket"] }, entry: { area_id: "garden" } },
    "script.disco": { entry: {} },
    "script.office_script": { entry: { area_id: "office" } },
    "script.strip_party": { entry: {} },
    "script.office_and_living": { entry: { area_id: "office" } },
};

export const AREAS = {
    office: { area_id: "office", name: "Office", icon: "mdi:desk" },
    living_room: { area_id: "living_room", name: "Living room", icon: "mdi:sofa" },
    garden: { area_id: "garden", name: "Garden", icon: "mdi:tree" },
    attic: { area_id: "attic", name: "Attic", icon: "mdi:home-roof" },
};

/** The house in Home Assistant's shape, with `callService` recorded. States can be replaced per test. */
export function makeHass(states: Record<string, Partial<HassEntity>> = {}, language = "en"): HomeAssistant {
    const full: Record<string, HassEntity> = {};
    const entities: Record<string, EntityEntry> = {};
    for (const [id, made] of Object.entries(ENTITIES)) {
        const name = [made.device, made.own].filter(Boolean).join(" ") || id.split(".")[1].replace(/_/g, " ");
        full[id] = {
            entity_id: id,
            state: made.state ?? "off",
            attributes: { friendly_name: name.charAt(0).toUpperCase() + name.slice(1), ...made.attributes },
            ...states[id],
        };
        entities[id] = { entity_id: id, ...made.entry };
    }
    return {
        states: full,
        entities,
        devices: { ceiling_office: { area_id: "office" }, led_strip: { area_id: "office" }, downlight_group: { area_id: "living_room" } },
        areas: AREAS,
        locale: { language },
        callService: vi.fn(() => Promise.resolve()),
        formatEntityName: (state: HassEntity, parts: NamePart[]) => {
            const made = ENTITIES[state.entity_id];
            return parts
                .map((part) =>
                    part.type === "device" ? made?.device : part.type === "entity" ? (made?.own ?? state.attributes.friendly_name) : "",
                )
                .filter(Boolean)
                .join(" ");
        },
    };
}
