import type { LovelaceCardConfig } from "./hass";
import type { HeightConfig } from "./height";

/** A light or switch on the card. */
export interface LightConfig {
    entity: string;
    /** Replaces the name the card makes from the entity's device and its own name. */
    name?: string;
}

/** A scene or script on the card. */
export interface SceneConfig {
    entity: string;
    name?: string;
    icon?: string;
    /** "auto" (the default) places it by the lights it touches, "room" with the room's buttons, or a light's entity id on that light's row. */
    position?: string;
}

export type TurnOn = "all" | "lights" | "scene";

export interface RoomLightsCardConfig extends LovelaceCardConfig, HeightConfig {
    /** The area the card shows. Without one, the card holds what belongs to no single room. */
    area?: string;
    name?: string;
    icon?: string;
    lights?: Array<string | LightConfig>;
    scenes?: Array<string | SceneConfig>;
    /** Adaptive Lighting's switch for the room, toggled from the header. */
    adaptive_lighting?: string;
    /** What the room's icon does when every light is off. */
    turn_on?: TurnOn;
    turn_on_lights?: string[];
    turn_on_scene?: string;
}
