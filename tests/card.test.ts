import { afterEach, describe, expect, it, vi } from "vitest";

import { compact, fromArea } from "../src/editor";
import { areaLights, areaScenes } from "../src/lights";
import type { HassEntity, HomeAssistant } from "../src/hass";
import "../src/room-lights-card";
import type { RoomLightsCard } from "../src/room-lights-card";
import type { RoomLightsCardConfig } from "../src/types";
import { makeHass } from "./fixtures";

const OFFICE: Partial<RoomLightsCardConfig> = {
    area: "office",
    lights: ["light.ceiling_office_white", "light.ceiling_office_ring", "light.led_strip_office", "light.desk_lamp"],
    scenes: ["scene.office_bright", "scene.office_music", { entity: "scene.office_strip_night", name: "Night" }, "script.office_script"],
};

async function card(hass: HomeAssistant, config: Partial<RoomLightsCardConfig>): Promise<RoomLightsCard> {
    const element = document.createElement("room-lights-card");
    element.setConfig({ type: "custom:room-lights-card", ...config } as RoomLightsCardConfig);
    element.hass = hass;
    document.body.append(element);
    await element.updateComplete;
    return element;
}

const root = (element: RoomLightsCard): ShadowRoot => element.shadowRoot!;
const text = (node: Element | null | undefined): string => (node?.textContent ?? "").replace(/\s+/g, " ").trim();
const all = (element: RoomLightsCard, selector: string): Element[] => [...root(element).querySelectorAll(selector)];

/** Puts a bar 200 px wide at the left edge, since happy-dom lays nothing out. */
function measure(bar: Element): void {
    bar.getBoundingClientRect = () => ({ left: 0, width: 200, top: 0, height: 32, right: 200, bottom: 32, x: 0, y: 0, toJSON: () => ({}) });
}

function pointer(bar: Element, type: string, clientX: number): void {
    bar.dispatchEvent(new PointerEvent(type, { clientX, button: 0, pointerId: 1, bubbles: true }));
}

describe("room-lights-card", () => {
    afterEach(() => {
        document.body.innerHTML = "";
        vi.useRealTimers();
    });

    it("shows dimmable lights as bars, the rest as buttons, and each scene where it belongs", async () => {
        const element = await card(makeHass(), OFFICE);
        expect(text(root(element).querySelector(".name"))).toBe("Office");
        expect(all(element, ".row .label").map(text)).toEqual(["Ceiling Light", "Ceiling Ring", "LED strip"]);
        expect(all(element, ".pill").map(text)).toEqual(["Desk lamp"]);
        // The night scene sets the strip alone, so it sits on the strip's row. The others are the room's.
        const strip = all(element, ".row")[2];
        expect(strip.querySelector(".scene")?.getAttribute("title")).toBe("Night");
        expect(all(element, ".chip").map(text)).toEqual(["Office bright", "Office music", "Office script"]);
    });

    it("says how bright the room is and how many lights are on, in the viewer's language", async () => {
        const element = await card(makeHass({}, "fi"), OFFICE);
        expect(text(root(element).querySelector(".status"))).toBe("70 % · 3/4 päällä");
        expect(all(element, ".value").map(text)).toEqual(["100 %", "Pois", "40 %"]);
    });

    it.each([
        ["the average of the dimmable lights on, and the count", OFFICE.lights, {}, "70% · 3/4 on"],
        [
            "only an on/off light on",
            OFFICE.lights,
            { "light.ceiling_office_white": { state: "off" }, "light.led_strip_office": { state: "off" } },
            "On · 1/4 on",
        ],
        ["a single light, without a count", ["light.ceiling_office_white"], {}, "100%"],
        ["everything off", ["light.ceiling_office_ring"], {}, "Off"],
        ["everything unavailable", ["light.bar_strip"], {}, "Unavailable"],
        ["one unavailable and one on", ["light.bar_strip", "light.ceiling_office_white"], {}, "100% · 1/2 on"],
        ["a switch alone on", ["light.ceiling_office_ring", "switch.terrace_socket"], {}, "On · 1/2 on"],
        [
            "several lights, all unavailable",
            ["light.bar_strip", "light.ceiling_office_ring"],
            { "light.ceiling_office_ring": { state: "unavailable" } },
            "Unavailable",
        ],
        ["a single on/off light on", ["light.desk_lamp"], {}, "On"],
        ["several lights, one unavailable and the rest off", ["light.bar_strip", "light.ceiling_office_ring"], {}, "Off"],
        ["a single switch on", ["switch.terrace_socket"], {}, "On"],
    ])("status with %s", async (_case, lights, states, status) => {
        const element = await card(makeHass(states as Record<string, Partial<HassEntity>>), { lights: lights as string[] });
        expect(text(root(element).querySelector(".status"))).toBe(status);
    });

    it("turns off every light of the card when a switch alone is on", async () => {
        const hass = makeHass();
        const element = await card(hass, { lights: ["light.ceiling_office_ring", "switch.terrace_socket"] });
        (root(element).querySelector(".room-icon") as HTMLElement).click();
        expect(hass.callService).toHaveBeenCalledWith("homeassistant", "turn_off", {
            entity_id: ["light.ceiling_office_ring", "switch.terrace_socket"],
        });
    });

    it("shows a device's new name when the device is renamed", async () => {
        const hass = makeHass();
        const element = await card(hass, OFFICE);
        const renamed: HomeAssistant = {
            ...hass,
            devices: { ...hass.devices },
            formatEntityName: (state, parts) =>
                state.entity_id === "light.led_strip_office" ? "Shelf strip" : hass.formatEntityName!(state, parts),
        };
        element.hass = renamed;
        await element.updateComplete;
        expect(all(element, ".row .label").map(text)).toContain("Shelf strip");
    });

    it("turns off every light of the card when any is on", async () => {
        const hass = makeHass();
        const element = await card(hass, OFFICE);
        (root(element).querySelector(".room-icon") as HTMLElement).click();
        expect(hass.callService).toHaveBeenCalledWith("homeassistant", "turn_off", { entity_id: OFFICE.lights });
    });

    describe("turning the room on", () => {
        const allOff = {
            "light.ceiling_office_white": { state: "off" },
            "light.led_strip_office": { state: "off" },
            "light.desk_lamp": { state: "off" },
        };

        it.each([
            ["all lights by default", {}, ["homeassistant", "turn_on", { entity_id: OFFICE.lights }]],
            [
                "the chosen lights",
                { turn_on: "lights", turn_on_lights: ["light.ceiling_office_white", "light.downlights_living"] },
                ["homeassistant", "turn_on", { entity_id: ["light.ceiling_office_white"] }],
            ],
            [
                "all lights when none chosen is on the card",
                { turn_on: "lights", turn_on_lights: ["light.gone"] },
                ["homeassistant", "turn_on", { entity_id: OFFICE.lights }],
            ],
            [
                "a scene",
                { turn_on: "scene", turn_on_scene: "scene.office_bright" },
                ["scene", "turn_on", { entity_id: "scene.office_bright" }],
            ],
            ["a script", { turn_on: "scene", turn_on_scene: "script.disco" }, ["script", "turn_on", { entity_id: "script.disco" }]],
            ["all lights when no scene is set", { turn_on: "scene" }, ["homeassistant", "turn_on", { entity_id: OFFICE.lights }]],
        ])("%s", async (_case, extra, expected) => {
            const hass = makeHass(allOff);
            const element = await card(hass, { ...OFFICE, ...extra } as Partial<RoomLightsCardConfig>);
            expect(text(root(element).querySelector(".status"))).toBe("Off");
            (root(element).querySelector(".room-icon") as HTMLElement).click();
            expect(hass.callService).toHaveBeenCalledWith(...expected);
        });
    });

    it("sets the brightness where the bar is let go, and keeps showing it until Home Assistant answers", async () => {
        const hass = makeHass();
        const element = await card(hass, OFFICE);
        const bar = all(element, ".bar")[0];
        measure(bar);
        pointer(bar, "pointerdown", 20);
        pointer(bar, "pointermove", 90);
        await element.updateComplete;
        expect(hass.callService).not.toHaveBeenCalled();
        pointer(bar, "pointerup", 120);
        expect(hass.callService).toHaveBeenCalledWith("light", "turn_on", { entity_id: "light.ceiling_office_white", brightness_pct: 60 });
        await element.updateComplete;
        expect(text(bar.querySelector(".value"))).toBe("60%");

        // Any new state of the light ends the wait.
        element.hass = makeHass({
            "light.ceiling_office_white": { state: "on", attributes: { brightness: 51, supported_color_modes: ["color_temp"] } },
        });
        await element.updateComplete;
        expect(text(bar.querySelector(".value"))).toBe("20%");
    });

    it("turns a light off when its bar is let go at the start", async () => {
        const hass = makeHass();
        const element = await card(hass, OFFICE);
        const bar = all(element, ".bar")[0];
        measure(bar);
        pointer(bar, "pointerdown", 100);
        pointer(bar, "pointerup", -30);
        expect(hass.callService).toHaveBeenCalledWith("light", "turn_off", { entity_id: "light.ceiling_office_white" });
    });

    it("sends nothing when the browser takes the pointer for scrolling", async () => {
        const hass = makeHass();
        const element = await card(hass, OFFICE);
        const bar = all(element, ".bar")[0];
        measure(bar);
        pointer(bar, "pointerdown", 100);
        pointer(bar, "pointercancel", 100);
        pointer(bar, "pointerup", 100);
        expect(hass.callService).not.toHaveBeenCalled();
    });

    it("sends the arrow keys pressed in a row as one change", async () => {
        vi.useFakeTimers();
        const hass = makeHass();
        const element = await card(hass, OFFICE);
        const strip = all(element, ".bar")[2];
        for (const key of ["ArrowRight", "ArrowRight", "PageUp"]) {
            strip.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
            await element.updateComplete;
        }
        expect(hass.callService).not.toHaveBeenCalled();
        vi.advanceTimersByTime(400);
        expect(hass.callService).toHaveBeenCalledTimes(1);
        expect(hass.callService).toHaveBeenCalledWith("light", "turn_on", { entity_id: "light.led_strip_office", brightness_pct: 60 });
    });

    describe("keys", () => {
        const press = async (element: RoomLightsCard, bar: number, key: string): Promise<void> => {
            all(element, ".bar")[bar].dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
            await element.updateComplete;
        };

        // The ceiling light is at 100%, the ring off and the strip at 40%.
        it.each([
            [2, "ArrowRight", ["light", "turn_on", { entity_id: "light.led_strip_office", brightness_pct: 45 }]],
            [2, "ArrowUp", ["light", "turn_on", { entity_id: "light.led_strip_office", brightness_pct: 45 }]],
            [2, "ArrowLeft", ["light", "turn_on", { entity_id: "light.led_strip_office", brightness_pct: 35 }]],
            [2, "ArrowDown", ["light", "turn_on", { entity_id: "light.led_strip_office", brightness_pct: 35 }]],
            [2, "PageUp", ["light", "turn_on", { entity_id: "light.led_strip_office", brightness_pct: 50 }]],
            [2, "PageDown", ["light", "turn_on", { entity_id: "light.led_strip_office", brightness_pct: 30 }]],
            [2, "Home", ["light", "turn_off", { entity_id: "light.led_strip_office" }]],
            [2, "End", ["light", "turn_on", { entity_id: "light.led_strip_office", brightness_pct: 100 }]],
            [0, "ArrowRight", ["light", "turn_on", { entity_id: "light.ceiling_office_white", brightness_pct: 100 }]],
            [1, "ArrowLeft", ["light", "turn_off", { entity_id: "light.ceiling_office_ring" }]],
            [1, "ArrowRight", ["light", "turn_on", { entity_id: "light.ceiling_office_ring", brightness_pct: 5 }]],
        ])("bar %i, %s", async (bar, key, expected) => {
            vi.useFakeTimers();
            const hass = makeHass();
            const element = await card(hass, OFFICE);
            await press(element, bar, key);
            vi.advanceTimersByTime(400);
            expect(hass.callService).toHaveBeenCalledTimes(1);
            expect(hass.callService).toHaveBeenCalledWith(...expected);
        });

        it("sends each bar's change when another bar is used before the first is sent", async () => {
            vi.useFakeTimers();
            const hass = makeHass();
            const element = await card(hass, OFFICE);
            await press(element, 2, "ArrowRight");
            await press(element, 1, "End");
            vi.advanceTimersByTime(400);
            expect(hass.callService).toHaveBeenCalledTimes(2);
            expect(hass.callService).toHaveBeenCalledWith("light", "turn_on", { entity_id: "light.led_strip_office", brightness_pct: 45 });
            expect(hass.callService).toHaveBeenCalledWith("light", "turn_on", {
                entity_id: "light.ceiling_office_ring",
                brightness_pct: 100,
            });
        });

        it.each([
            ["an unavailable light", { "light.led_strip_office": { state: "unavailable" } }, "ArrowRight"],
            ["a key the bar doesn't use", {}, "a"],
        ])("sends nothing for %s", async (_case, states, key) => {
            vi.useFakeTimers();
            const hass = makeHass(states as Record<string, Partial<HassEntity>>);
            const element = await card(hass, OFFICE);
            await press(element, 2, key);
            vi.advanceTimersByTime(400);
            expect(hass.callService).not.toHaveBeenCalled();
        });

        it("turns a light off when a step down reaches zero", async () => {
            vi.useFakeTimers();
            const hass = makeHass({
                "light.led_strip_office": { state: "on", attributes: { supported_color_modes: ["rgbw"], brightness: 13 } },
            });
            const element = await card(hass, OFFICE);
            await press(element, 2, "PageDown");
            vi.advanceTimersByTime(400);
            expect(hass.callService).toHaveBeenCalledWith("light", "turn_off", { entity_id: "light.led_strip_office" });
        });

        it("shows the waiting value, and keeps it when Home Assistant answers an earlier change meanwhile", async () => {
            vi.useFakeTimers();
            const hass = makeHass();
            const element = await card(hass, OFFICE);
            const strip = (): string => text(all(element, ".bar")[2].querySelector(".value"));
            await press(element, 2, "ArrowRight");
            expect(strip()).toBe("45%");
            vi.advanceTimersByTime(400);
            await press(element, 2, "ArrowRight");
            vi.advanceTimersByTime(50);
            // The answer to the first change arrives while the second waits.
            element.hass = makeHass({
                "light.led_strip_office": {
                    state: "on",
                    attributes: { supported_color_modes: ["rgbw"], brightness: 115, rgb_color: [0, 120, 255] },
                },
            });
            element.hass.callService = hass.callService;
            await element.updateComplete;
            expect(strip()).toBe("50%");
            await press(element, 2, "ArrowRight");
            vi.advanceTimersByTime(400);
            expect(hass.callService).toHaveBeenLastCalledWith("light", "turn_on", {
                entity_id: "light.led_strip_office",
                brightness_pct: 55,
            });
        });

        it("sends each bar's change on its own time", async () => {
            vi.useFakeTimers();
            const hass = makeHass();
            const element = await card(hass, OFFICE);
            await press(element, 2, "ArrowRight");
            vi.advanceTimersByTime(300);
            await press(element, 1, "End");
            vi.advanceTimersByTime(100);
            expect(hass.callService).toHaveBeenCalledTimes(1);
            expect(hass.callService).toHaveBeenCalledWith("light", "turn_on", { entity_id: "light.led_strip_office", brightness_pct: 45 });
            vi.advanceTimersByTime(300);
            expect(hass.callService).toHaveBeenCalledTimes(2);
            expect(hass.callService).toHaveBeenLastCalledWith("light", "turn_on", {
                entity_id: "light.ceiling_office_ring",
                brightness_pct: 100,
            });
        });

        it("lets a drag replace a key press still waiting on the same light", async () => {
            vi.useFakeTimers();
            const hass = makeHass();
            const element = await card(hass, OFFICE);
            await press(element, 2, "ArrowRight");
            const bar = all(element, ".bar")[2];
            measure(bar);
            pointer(bar, "pointerdown", 160);
            pointer(bar, "pointerup", 160);
            vi.advanceTimersByTime(400);
            await element.updateComplete;
            expect(hass.callService).toHaveBeenCalledTimes(1);
            expect(hass.callService).toHaveBeenCalledWith("light", "turn_on", { entity_id: "light.led_strip_office", brightness_pct: 80 });
            expect(text(bar.querySelector(".value"))).toBe("80%");
        });

        it("drops a waiting value, without sending it, when the light goes unavailable meanwhile", async () => {
            vi.useFakeTimers();
            const hass = makeHass();
            const element = await card(hass, OFFICE);
            await press(element, 2, "ArrowRight");
            element.hass = makeHass({
                "light.led_strip_office": { state: "unavailable", attributes: { supported_color_modes: ["rgbw"] } },
            });
            element.hass.callService = hass.callService;
            await element.updateComplete;
            const bar = all(element, ".bar")[2];
            expect(text(bar.querySelector(".value"))).toBe("Unavailable");
            expect((bar.querySelector(".fill") as HTMLElement).style.width).toBe("0%");
            vi.advanceTimersByTime(400);
            element.remove();
            expect(hass.callService).not.toHaveBeenCalled();
        });

        it("keeps a newer waiting value when an earlier change is refused", async () => {
            vi.useFakeTimers();
            const hass = makeHass();
            let refuse: (reason: Error) => void = () => undefined;
            hass.callService = vi.fn(() => new Promise((_resolve, reject) => (refuse = reject)));
            const element = await card(hass, OFFICE);
            const strip = (): string => text(all(element, ".bar")[2].querySelector(".value"));
            await press(element, 2, "ArrowRight");
            vi.advanceTimersByTime(400);
            await press(element, 2, "ArrowRight");
            refuse(new Error("refused"));
            await vi.waitFor(() => element.updateComplete);
            await Promise.resolve();
            await element.updateComplete;
            expect(strip()).toBe("50%");
            await press(element, 2, "ArrowRight");
            vi.advanceTimersByTime(400);
            expect(hass.callService).toHaveBeenLastCalledWith("light", "turn_on", {
                entity_id: "light.led_strip_office",
                brightness_pct: 55,
            });
        });

        it("goes back to the light's own brightness when a change is refused", async () => {
            const hass = makeHass();
            hass.callService = vi.fn(() => Promise.reject(new Error("refused")));
            const element = await card(hass, OFFICE);
            const bar = all(element, ".bar")[2];
            measure(bar);
            pointer(bar, "pointerdown", 160);
            pointer(bar, "pointerup", 160);
            await new Promise((resolve) => setTimeout(resolve, 0));
            await element.updateComplete;
            expect(text(bar.querySelector(".value"))).toBe("40%");
        });

        it("sends nothing for a light that went unavailable when the card leaves the page with its keys waiting", async () => {
            vi.useFakeTimers();
            const hass = makeHass();
            const element = await card(hass, OFFICE);
            await press(element, 2, "ArrowRight");
            element.hass = makeHass({
                "light.led_strip_office": { state: "unavailable", attributes: { supported_color_modes: ["rgbw"] } },
            });
            element.hass.callService = hass.callService;
            await element.updateComplete;
            element.remove();
            vi.advanceTimersByTime(400);
            expect(hass.callService).not.toHaveBeenCalled();
        });

        it("sends both when keys wait on one light and another is dragged", async () => {
            vi.useFakeTimers();
            const hass = makeHass();
            const element = await card(hass, OFFICE);
            await press(element, 2, "ArrowRight");
            const ceiling = all(element, ".bar")[0];
            measure(ceiling);
            pointer(ceiling, "pointerdown", 100);
            pointer(ceiling, "pointerup", 100);
            vi.advanceTimersByTime(400);
            expect(hass.callService).toHaveBeenCalledTimes(2);
            expect(hass.callService).toHaveBeenCalledWith("light", "turn_on", {
                entity_id: "light.ceiling_office_white",
                brightness_pct: 50,
            });
            expect(hass.callService).toHaveBeenCalledWith("light", "turn_on", { entity_id: "light.led_strip_office", brightness_pct: 45 });
        });

        it("forgets a drag still under way when the card leaves the page", async () => {
            const hass = makeHass();
            const element = await card(hass, OFFICE);
            const bar = all(element, ".bar")[2];
            measure(bar);
            pointer(bar, "pointerdown", 180);
            await element.updateComplete;
            expect(text(bar.querySelector(".value"))).toBe("90%");
            element.remove();
            document.body.append(element);
            await element.updateComplete;
            expect(text(all(element, ".bar")[2].querySelector(".value"))).toBe("40%");
            expect(hass.callService).not.toHaveBeenCalled();
        });

        it("sends nothing when a drag is let go on a light that went unavailable meanwhile", async () => {
            const hass = makeHass();
            const element = await card(hass, OFFICE);
            const bar = all(element, ".bar")[2];
            measure(bar);
            pointer(bar, "pointerdown", 180);
            element.hass = makeHass({
                "light.led_strip_office": { state: "unavailable", attributes: { supported_color_modes: ["rgbw"] } },
            });
            element.hass.callService = hass.callService;
            await element.updateComplete;
            pointer(bar, "pointerup", 180);
            expect(hass.callService).not.toHaveBeenCalled();
        });

        it("sends a waiting change when the card leaves the page", async () => {
            vi.useFakeTimers();
            const hass = makeHass();
            const element = await card(hass, OFFICE);
            await press(element, 2, "ArrowRight");
            element.remove();
            expect(hass.callService).toHaveBeenCalledWith("light", "turn_on", { entity_id: "light.led_strip_office", brightness_pct: 45 });
            vi.advanceTimersByTime(400);
            expect(hass.callService).toHaveBeenCalledTimes(1);
        });
    });

    it("toggles an on/off light from its button, and starts a scene from its own", async () => {
        const hass = makeHass();
        const element = await card(hass, OFFICE);
        (root(element).querySelector(".pill") as HTMLElement).click();
        expect(hass.callService).toHaveBeenCalledWith("homeassistant", "toggle", { entity_id: "light.desk_lamp" });
        (all(element, ".chip")[2] as HTMLElement).click();
        expect(hass.callService).toHaveBeenCalledWith("script", "turn_on", { entity_id: "script.office_script" });
    });

    it("puts a scene of an on/off light with the room's, as it has no row", async () => {
        const element = await card(makeHass(), {
            area: "garden",
            lights: ["light.lanterns", "light.floodlight", "switch.terrace_socket"],
            scenes: ["scene.floodlight_on", "scene.terrace_only"],
        });
        expect(all(element, ".chip").map(text)).toEqual(["Floodlight on", "Terrace only"]);
        expect(all(element, ".row .scene")).toEqual([]);
    });

    it.each(["light.floodlight", "switch.terrace_socket"])("puts a scene placed by hand on %s with the room's", async (position) => {
        const element = await card(makeHass(), {
            lights: ["light.lanterns", "light.floodlight", "switch.terrace_socket"],
            scenes: [{ entity: "scene.garden_evening", position }],
        });
        expect(all(element, ".chip").map(text)).toEqual(["Garden evening"]);
        expect(all(element, ".row .scene")).toEqual([]);
    });

    it("leaves the label out with a single light, whose dialog its name opens", async () => {
        const element = await card(makeHass(), {
            area: "living_room",
            lights: ["light.downlights_living"],
            scenes: ["scene.living_bright"],
        });
        expect(all(element, ".label")).toEqual([]);
        expect(all(element, ".row .scene").length).toBe(1);
        const opened = vi.fn();
        element.addEventListener("hass-more-info", (event) => opened((event as CustomEvent).detail));
        (root(element).querySelector("button.name") as HTMLElement).click();
        expect(opened).toHaveBeenCalledWith({ entityId: "light.downlights_living" });
    });

    it("toggles Adaptive Lighting from the header", async () => {
        const hass = makeHass();
        const element = await card(hass, {
            area: "living_room",
            lights: ["light.downlights_living"],
            adaptive_lighting: "switch.adaptive_living",
        });
        const button = root(element).querySelector(".adaptive") as HTMLElement;
        expect(button.classList.contains("on")).toBe(true);
        button.click();
        expect(hass.callService).toHaveBeenCalledWith("switch", "toggle", { entity_id: "switch.adaptive_living" });
    });

    it("shows an unavailable light as such, and won't drag it", async () => {
        const hass = makeHass();
        const element = await card(hass, { area: "living_room", lights: ["light.bar_strip"] });
        const bar = all(element, ".bar")[0];
        expect(text(bar.querySelector(".value"))).toBe("Unavailable");
        expect(text(root(element).querySelector(".status"))).toBe("Unavailable");
        measure(bar);
        pointer(bar, "pointerdown", 100);
        pointer(bar, "pointerup", 100);
        expect(hass.callService).not.toHaveBeenCalled();
    });

    it("has no toggle without lights, as a card of scenes spanning rooms", async () => {
        const element = await card(makeHass(), { name: "Moods", scenes: ["scene.both_rooms", "script.disco"] });
        expect(root(element).querySelector("button.room-icon")).toBeNull();
        expect(root(element).querySelector(".status")).toBeNull();
        expect(all(element, ".chip").map(text)).toEqual(["Both rooms", "Disco"]);
    });

    it("asks for something to show when it has nothing", async () => {
        const element = await card(makeHass(), {});
        expect(text(root(element).querySelector(".name"))).toBe("Lights");
        expect(text(root(element).querySelector(".message"))).toBe("Choose an area, lights or scenes in the card's settings.");
    });

    it.each([{ lights: "light.a" }, { scenes: { entity: "scene.a" } }])("refuses lights or scenes that aren't lists: %o", (config) => {
        const element = document.createElement("room-lights-card");
        expect(() => element.setConfig({ type: "custom:room-lights-card", ...config } as unknown as RoomLightsCardConfig)).toThrow();
    });

    it("offers the first area with lights from the picker", () => {
        const stub = (customElements.get("room-lights-card") as unknown as typeof RoomLightsCard).getStubConfig(makeHass());
        expect(stub).toEqual({
            area: "garden",
            lights: ["light.floodlight", "light.lantern_left", "light.lantern_right"],
            scenes: ["scene.floodlight_on", "scene.garden_evening", "scene.terrace_only"],
        });
    });
});

describe("editor", () => {
    const hass = makeHass();

    describe("filling in from the area", () => {
        const fill = (area: string | undefined) => {
            const lights = areaLights(hass, area);
            return { lights, scenes: areaScenes(hass, area, lights) };
        };
        const LISTS = {
            empty: {},
            "another area's": fill("living_room"),
            "set by hand": {
                lights: [{ entity: "light.desk_lamp", name: "Desk" }],
                scenes: [{ entity: "scene.office_bright", position: "room" }],
            },
        };
        const rows: Array<[string | undefined, keyof typeof LISTS]> = [];
        for (const area of ["office", "garden", undefined]) {
            for (const lists of Object.keys(LISTS) as Array<keyof typeof LISTS>) {
                rows.push([area, lists]);
            }
        }

        // Without an area, the lights are none and the scenes those that span areas.
        it.each(rows)("fills in %s over %s lists", (area, lists) => {
            const config = fromArea(hass, { type: "x", area, ...LISTS[lists] });
            expect({ lights: config.lights, scenes: config.scenes }).toEqual(fill(area));
        });

        it("keeps the rest of the configuration", () => {
            const config = fromArea(hass, {
                type: "x",
                area: "garden",
                name: "Yard",
                adaptive_lighting: "switch.a",
                turn_on: "scene",
                turn_on_scene: "scene.b",
            });
            expect(config).toMatchObject({
                type: "x",
                area: "garden",
                name: "Yard",
                adaptive_lighting: "switch.a",
                turn_on: "scene",
                turn_on_scene: "scene.b",
            });
        });

        it.each([
            ["an area with no lights", "attic", {}],
            [
                "no area, which fills in no lights and the scenes spanning areas",
                undefined,
                { scenes: ["scene.both_rooms", "scene.everything"] },
            ],
        ])("fills in %s", (_case, area, expected) => {
            const config = compact(fromArea(hass, { type: "x", area, lights: ["light.desk_lamp"], scenes: ["scene.office_bright"] }));
            expect(config).toEqual({ type: "x", ...(area ? { area } : {}), ...expected });
        });

        it.each([
            ["an area", "garden"],
            ["no area", undefined],
        ])("replaces the lists from the editor's button with %s", async (_case, area) => {
            const editor = document.createElement("room-lights-card-editor");
            editor.hass = hass;
            const before = {
                type: "custom:room-lights-card",
                ...(area ? { area } : {}),
                lights: [{ entity: "light.desk_lamp", name: "Desk" }],
                scenes: ["scene.office_bright"],
                turn_on: "all" as const,
            };
            editor.setConfig(before);
            document.body.append(editor);
            await editor.updateComplete;
            const changed = vi.fn();
            editor.addEventListener("config-changed", (event) => changed((event as CustomEvent).detail.config));
            (editor.shadowRoot!.querySelector(".fill ha-button") as HTMLElement).click();
            await vi.waitFor(() => expect(changed).toHaveBeenCalled());
            expect(changed).toHaveBeenCalledWith(compact(fromArea(hass, before)));
            expect(changed.mock.calls[0][0].lights ?? []).toEqual(
                area ? ["light.floodlight", "light.lantern_left", "light.lantern_right"] : [],
            );
        });

        it("reads the scripts' configurations, skipping one it can't read", async () => {
            const reading: HomeAssistant = {
                ...hass,
                callWS: vi.fn((message: { entity_id: string }) =>
                    message.entity_id === "script.disco"
                        ? Promise.resolve({
                              config: { sequence: [{ target: { entity_id: ["light.downlight_living_1", "light.ceiling_office_white"] } }] },
                          })
                        : Promise.reject(new Error("unauthorized")),
                ) as HomeAssistant["callWS"],
            };
            const editor = document.createElement("room-lights-card-editor");
            editor.hass = reading;
            editor.setConfig({ type: "custom:room-lights-card", lights: ["light.desk_lamp"] });
            document.body.append(editor);
            await editor.updateComplete;
            const changed = vi.fn();
            editor.addEventListener("config-changed", (event) => changed((event as CustomEvent).detail.config));
            (editor.shadowRoot!.querySelector(".fill ha-button") as HTMLElement).click();
            await vi.waitFor(() => expect(changed).toHaveBeenCalled());
            expect(changed).toHaveBeenCalledWith({
                type: "custom:room-lights-card",
                scenes: ["scene.both_rooms", "script.disco", "scene.everything"],
            });
        });

        it("leaves the lists alone when only the area changes", () => {
            const editor = document.createElement("room-lights-card-editor");
            editor.hass = hass;
            const before = {
                type: "custom:room-lights-card",
                area: "living_room",
                lights: ["light.bar_strip"],
                scenes: ["scene.bar_party"],
            };
            editor.setConfig(before);
            const changed = vi.fn();
            editor.addEventListener("config-changed", (event) => changed((event as CustomEvent).detail.config));
            (editor as unknown as { valueChanged(event: { detail: { value: RoomLightsCardConfig } }): void }).valueChanged({
                detail: { value: { ...before, area: "garden" } },
            });
            expect(changed).toHaveBeenCalledWith({ ...before, area: "garden" });
        });
    });

    it("writes the configuration as short as it reads the same", () => {
        expect(
            compact({
                type: "custom:room-lights-card",
                area: "office",
                name: "",
                lights: [{ entity: "light.a" }, { entity: "light.b", name: "B" }],
                scenes: [
                    { entity: "scene.a", position: "auto" },
                    { entity: "scene.b", position: "room", icon: "" },
                ],
                turn_on: "all",
                turn_on_lights: ["light.a"],
                turn_on_scene: "scene.a",
                adaptive_lighting: "",
            }),
        ).toEqual({
            type: "custom:room-lights-card",
            area: "office",
            lights: ["light.a", { entity: "light.b", name: "B" }],
            scenes: ["scene.a", { entity: "scene.b", position: "room" }],
        });
        expect(compact({ type: "x", turn_on: "scene", turn_on_scene: "scene.a", turn_on_lights: [] })).toEqual({
            type: "x",
            turn_on: "scene",
            turn_on_scene: "scene.a",
        });
    });
});
