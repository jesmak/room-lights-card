/** The little of Home Assistant a card needs, so the unmaintained custom-card-helpers isn't a dependency. */

export interface HassEntity {
    entity_id: string;
    state: string;
    attributes: Record<string, unknown>;
}

/** An entity's entry in the frontend's copy of the entity registry. */
export interface EntityEntry {
    entity_id: string;
    device_id?: string | null;
    area_id?: string | null;
    /** The integration, such as `group` for a Home Assistant light group. */
    platform?: string;
    hidden?: boolean;
    entity_category?: string | null;
}

export interface DeviceEntry {
    area_id?: string | null;
}

export interface AreaEntry {
    area_id: string;
    name: string;
    icon?: string | null;
}

/** One part of an entity's name, as `formatEntityName` puts them together. */
export interface NamePart {
    type: "entity" | "device" | "area" | "floor";
}

export interface HomeAssistant {
    states: Record<string, HassEntity | undefined>;
    entities?: Record<string, EntityEntry | undefined>;
    devices?: Record<string, DeviceEntry | undefined>;
    areas?: Record<string, AreaEntry | undefined>;
    language?: string;
    locale?: { language?: string };
    callService(domain: string, service: string, data?: Record<string, unknown>): Promise<unknown>;
    callWS?<T>(message: Record<string, unknown>): Promise<T>;
    /** Present in Home Assistant 2025.11 and later. */
    formatEntityName?(state: HassEntity, parts: NamePart[]): string;
}

export interface LovelaceCardConfig {
    type: string;
    [key: string]: unknown;
}
