import { describe, expect, it } from "vitest";

import {
    areaLights,
    areaScenes,
    brightnessPct,
    firstArea,
    isDimmable,
    lightColor,
    lightsIn,
    lightName,
    lightsOf,
    placeOf,
    roomState,
    sceneAreas,
    withoutArea,
} from "../src/lights";
import { makeHass } from "./fixtures";

const OFFICE = ["light.ceiling_office_white", "light.ceiling_office_ring", "light.led_strip_office", "light.desk_lamp"];
const LIVING = ["light.downlights_living", "light.bar_strip"];

describe("placeOf", () => {
    const hass = makeHass();

    it.each([
        ["one light of the card", "scene.office_strip_night", OFFICE, "light.led_strip_office"],
        ["two lights of the card", "scene.office_bright", OFFICE, "room"],
        ["two lights and a palette", "scene.office_music", OFFICE, "room"],
        ["one light, with a relay and a palette that aren't on the card", "scene.strip_with_relay", OFFICE, "light.led_strip_office"],
        ["a light and a switch of the card", "scene.garden_evening", ["light.lanterns", "switch.terrace_socket"], "room"],
        [
            "one on/off light, named though the card has no row for it",
            "scene.floodlight_on",
            ["light.lanterns", "light.floodlight"],
            "light.floodlight",
        ],
        ["the card's group, set directly", "scene.living_bright", LIVING, "light.downlights_living"],
        ["a member of the card's group", "scene.living_one", LIVING, "light.downlights_living"],
        ["a group of the card's lights", "scene.office_group", OFFICE, "room"],
        [
            "a group with one of the card's lights",
            "scene.office_group",
            ["light.led_strip_office", "light.desk_lamp"],
            "light.led_strip_office",
        ],
        ["none of the card's lights", "scene.living_bright", OFFICE, "room"],
        ["a script, which tells nothing", "script.disco", OFFICE, "room"],
        ["an entity that doesn't exist", "scene.gone", OFFICE, "room"],
    ])("%s", (_case, entity, lights, place) => {
        expect(placeOf(hass, { entity }, lights)).toBe(place);
    });

    it.each([
        ["the room, set by hand", "room", "room"],
        ["a light of the card, set by hand", "light.ceiling_office_white", "light.ceiling_office_white"],
        ["an on/off light of the card, set by hand", "light.desk_lamp", "light.desk_lamp"],
        ["a light no longer on the card", "light.downlights_living", "room"],
        ["automatic", "auto", "room"],
    ])("%s", (_case, position, place) => {
        expect(placeOf(hass, { entity: "scene.office_bright", position }, OFFICE)).toBe(place);
    });
});

describe("sceneAreas", () => {
    const hass = makeHass();

    it.each([
        ["one room", "scene.office_bright", ["office"]],
        ["two rooms", "scene.both_rooms", ["living_room", "office"]],
        ["a group, by its own area", "scene.office_group", ["office"]],
        ["a group with no area, by its members", "scene.everything", ["living_room", "office"]],
        ["a script", "script.disco", []],
        ["only a switch", "scene.terrace_only", []],
    ])("%s", (_case, scene, areas) => {
        expect([...sceneAreas(hass, scene)].sort()).toEqual(areas);
    });
});

describe("areaLights", () => {
    const hass = makeHass();

    it("leaves out hidden and categorised lights, a Home Assistant light group and a controller's main light", () => {
        expect(areaLights(hass, "office")).toEqual([
            "light.ceiling_office_white",
            "light.ceiling_office_ring",
            "light.desk_lamp",
            "light.led_strip_office",
            "light.strip_segment",
        ]);
        expect(areaLights(hass, "garden")).toEqual(["light.floodlight", "light.lantern_left", "light.lantern_right"]);
    });

    it("has a Zigbee group, a device of its own, stand in for its bulbs", () => {
        expect(areaLights(hass, "living_room")).toEqual(["light.bar_strip", "light.downlights_living"]);
    });

    it("fills in nothing without an area", () => {
        expect(areaLights(hass, undefined)).toEqual([]);
    });

    it("finds the first area by name that has lights", () => {
        expect(firstArea(hass)).toBe("garden");
    });
});

describe("areaScenes", () => {
    const hass = makeHass();

    it("takes the area's own, and one from elsewhere that sets a card's light, but not one spanning rooms", () => {
        expect(areaScenes(hass, "office", OFFICE)).toEqual([
            "script.office_and_living",
            "scene.office_bright",
            "scene.office_group",
            "scene.office_music",
            "script.office_script",
            "scene.office_strip_night",
            "scene.strip_with_relay",
        ]);
        expect(areaScenes(hass, "living_room", LIVING)).toEqual(["scene.bar_party", "scene.living_bright", "scene.living_one"]);
    });

    it("takes only the scenes spanning rooms without an area", () => {
        expect(areaScenes(hass, undefined, [])).toEqual(["scene.both_rooms", "scene.everything"]);
    });
});

describe("scripts", () => {
    const hass = makeHass();
    // What the scripts' configurations set, as the editor reads them.
    const SCRIPTS = {
        "script.disco": ["light.downlight_living_1", "light.ceiling_office_white"],
        "script.office_script": ["light.ceiling_office_white"],
        "script.strip_party": ["light.led_strip_office"],
        "script.office_and_living": ["light.ceiling_office_ring", "light.downlights_living"],
    };

    it("finds the lights in a script's configuration, wherever they are, and not the actions' names", () => {
        const disco = {
            alias: "Disco",
            sequence: [
                { action: "script.save_adaptive_lighting" },
                { action: "light.turn_off", target: { entity_id: ["light.downlights_living", "light.office_lights"] } },
                {
                    repeat: {
                        for_each: ["light.downlight_living_1", "light.downlight_living_2"],
                        sequence: [{ action: "light.turn_on", data: { effect: "colorloop" }, target: { entity_id: "{{ repeat.item }}" } }],
                    },
                },
                { action: "switch.turn_on", target: { entity_id: "switch.wall_relay" } },
                { action: "light.turn_on", data: { entity_id: "light.lantern_left" } },
                { service: "light.toggle", target: { entity_id: "light.turn_on" } },
            ],
        };
        expect(lightsIn(disco)).toEqual([
            "light.downlights_living",
            "light.office_lights",
            "light.downlight_living_1",
            "light.downlight_living_2",
            "light.lantern_left",
            "light.turn_on",
        ]);
        expect(lightsIn(undefined)).toEqual([]);
    });

    it.each([
        [
            "an area, with the scripts read",
            "office",
            SCRIPTS,
            [
                "scene.office_bright",
                "scene.office_group",
                "scene.office_music",
                "script.office_script",
                "scene.office_strip_night",
                "script.strip_party",
                "scene.strip_with_relay",
            ],
        ],
        [
            "an area, with no scripts read",
            "office",
            {},
            [
                "script.office_and_living",
                "scene.office_bright",
                "scene.office_group",
                "scene.office_music",
                "script.office_script",
                "scene.office_strip_night",
                "scene.strip_with_relay",
            ],
        ],
        [
            "no area, with the scripts read",
            undefined,
            SCRIPTS,
            ["scene.both_rooms", "script.disco", "scene.everything", "script.office_and_living"],
        ],
        ["no area, with no scripts read", undefined, {}, ["scene.both_rooms", "scene.everything"]],
    ])("fills in %s", (_case, area, scripts, expected) => {
        expect(areaScenes(hass, area, area ? OFFICE : [], scripts)).toEqual(expected);
    });
});

describe("room state", () => {
    it("averages the brightness of the dimmable lights that are on, and takes the colour of the first one on", () => {
        const warm = makeHass({
            "light.ceiling_office_white": { state: "on", attributes: { brightness: 255, rgb_color: [255, 196, 135] } },
        });
        expect(roomState(warm, OFFICE)).toEqual({ on: 3, total: 4, brightness: 70, color: "rgb(255, 196, 135)" });
    });

    it("has no colour when the first light on has none, even if a later one has", () => {
        expect(roomState(makeHass(), ["light.desk_lamp", "light.led_strip_office"]).color).toBeUndefined();
    });

    // White light would vanish against a light theme, so it is left to the theme's own colour, as Mushroom does.
    it.each([
        ["cool white", [235, 240, 255], undefined],
        ["white", [255, 240, 220], undefined],
        ["warm white", [255, 196, 135], "rgb(255, 196, 135)"],
        ["blue", [0, 120, 255], "rgb(0, 120, 255)"],
        ["pale yellow", [255, 255, 160], undefined],
    ])("%s is shown in its own colour or the theme's", (_case, rgb, color) => {
        const hass = makeHass({ "light.led_strip_office": { state: "on", attributes: { rgb_color: rgb } } });
        expect(lightColor(hass.states["light.led_strip_office"])).toBe(color);
    });

    it("has no brightness when only on/off lights are on", () => {
        expect(roomState(makeHass(), ["light.desk_lamp", "light.ceiling_office_ring"])).toEqual({
            on: 1,
            total: 2,
            brightness: undefined,
            color: undefined,
        });
    });

    it.each([
        [255, 100],
        [128, 50],
        [1, 1],
    ])("brightness %i is %i %%", (brightness, pct) => {
        const hass = makeHass({ "light.ceiling_office_white": { state: "on", attributes: { brightness } } });
        expect(brightnessPct(hass.states["light.ceiling_office_white"])).toBe(pct);
    });

    it("has no brightness when off", () => {
        expect(brightnessPct(makeHass().states["light.ceiling_office_ring"])).toBeUndefined();
    });

    it.each([
        ["light.ceiling_office_white", true],
        ["light.desk_lamp", false],
        ["switch.terrace_socket", false],
        ["light.gone", false],
    ])("%s is dimmable: %s", (id, dimmable) => {
        expect(isDimmable(makeHass().states[id])).toBe(dimmable);
    });
});

describe("names", () => {
    const hass = makeHass();

    it.each([
        ["Alasvalot keittiö", "Keittiö", "Alasvalot"],
        ["Ceiling office light", "Office", "Ceiling light"],
        ["Living room lamp", "Living room", "Lamp"],
        ["Office", "Office", "Office"],
        ["Officer's lamp", "Office", "Officer's lamp"],
        ["Kattovalo keittiö", undefined, "Kattovalo keittiö"],
        ["iPhone lamp", "Office", "iPhone lamp"],
        ["iPhone office", "Office", "iPhone"],
        ["office lamp", "Office", "Lamp"],
        ["Kattovalo - Keittiö", "Keittiö", "Kattovalo"],
        ["Keittiö - Kattovalo", "Keittiö", "Kattovalo"],
        ["Hue - Office lamp", "Office", "Hue lamp"],
        ["Lamp, Office", "Office", "Lamp"],
        ["Lamp | Office", "Office", "Lamp"],
        ["Office / desk lamp", "Office", "Desk lamp"],
        ["Big living room lamp", "Living room", "Big lamp"],
        ["Lamp living room", "Living room", "Lamp"],
        ["Living room", "Living room", "Living room"],
        ["Lamp – Office", "Office", "Lamp"],
        ["Office — lamp", "Office", "Lamp"],
        ["Lamp Room (2)", "Room (2)", "Lamp"],
    ])("%s in %s is %s", (name, area, shorter) => {
        expect(withoutArea(name, area)).toBe(shorter);
    });

    it("names a light by its device alone when the card has no other light of that device", () => {
        expect(lightName(hass, "light.led_strip_office", OFFICE, "Office")).toBe("LED strip");
    });

    it("adds the light's own name when the card has two of its device", () => {
        expect(lightName(hass, "light.ceiling_office_white", OFFICE, "Office")).toBe("Ceiling Light");
        expect(lightName(hass, "light.ceiling_office_ring", OFFICE, "Office")).toBe("Ceiling Ring");
        expect(lightName(hass, "light.ceiling_office_ring", ["light.ceiling_office_ring"], "Office")).toBe("Ceiling");
    });

    it("falls back to the friendly name without formatEntityName", () => {
        const old = { ...hass, formatEntityName: undefined };
        expect(lightName(old, "light.ceiling_office_ring", OFFICE, "Office")).toBe("Ceiling Ring");
    });
});

describe("lightsOf", () => {
    it("takes bare ids and objects, and drops what isn't either", () => {
        // A configuration written by hand can hold anything.
        const lights = ["light.a", { entity: "light.b", name: "B" }, { name: "no entity" }, 5, null] as unknown as string[];
        expect(lightsOf({ type: "x", lights })).toEqual([{ entity: "light.a" }, { entity: "light.b", name: "B" }]);
    });
});
