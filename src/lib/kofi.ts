/** Ko-fi integration: real Dungeon World Italia values, env-overridable. */

export const KOFI_PAGE_URL =
  process.env.NEXT_PUBLIC_KOFI_URL ?? "https://ko-fi.com/dungeonworlditalia";

export const KOFI_BUTTON_URL =
  process.env.NEXT_PUBLIC_KOFI_BUTTON_URL ?? "https://ko-fi.com/R0X7278HIE";

export const KOFI_EMBED_URL =
  process.env.NEXT_PUBLIC_KOFI_EMBED_URL ??
  "https://ko-fi.com/dungeonworlditalia/?hidefeed=true&widget=true&embed=true&preview=true";
