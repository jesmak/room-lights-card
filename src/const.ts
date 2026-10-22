/** Replaced at build time with the version in package.json. */
declare const __CARD_VERSION__: string;

export const CARD_VERSION = __CARD_VERSION__;

export const DEFAULT_ICON = "mdi:lightbulb-group";

/** How far an arrow key moves a brightness bar, and Page Up and Page Down. */
export const KEY_STEP = 5;
export const PAGE_STEP = 10;

/** Keys pressed in a row are sent as one change, after this long without another. */
export const KEY_DELAY_MS = 400;
