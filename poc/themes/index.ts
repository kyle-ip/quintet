import type { ComponentType } from "react";
import { LeteleClassic } from "./LeteleClassic";
import { MinimalFlat } from "./MinimalFlat";
import { CasinoLuxe } from "./CasinoLuxe";
import { NeoBrutalist } from "./NeoBrutalist";
import { Typographic } from "./Typographic";
import { THEME_CONFIG } from "./config";
import type { CardFaceProps, CardThemeId, CardThemeMeta } from "./types";

export type { CardFaceProps, CardThemeId, CardThemeMeta } from "./types";
export {
  DEFAULT_THEME_ID,
  THEME_CONFIG,
  THEME_STORAGE_KEY,
  isValidThemeId,
  resolveThemeId,
  type ThemeConfigEntry,
} from "./config";

const FACES: Record<CardThemeId, ComponentType<CardFaceProps>> = {
  "minimal-flat": MinimalFlat,
  "letele-classic": LeteleClassic,
  "casino-luxe": CasinoLuxe,
  "neo-brutalist": NeoBrutalist,
  typographic: Typographic,
};

export const CARD_THEMES: Record<CardThemeId, CardThemeMeta> = Object.fromEntries(
  THEME_CONFIG.map((entry) => [
    entry.id,
    { ...entry, Component: FACES[entry.id] },
  ]),
) as Record<CardThemeId, CardThemeMeta>;

export const CARD_THEME_LIST = THEME_CONFIG.map((entry) => CARD_THEMES[entry.id]);

export function getCardTheme(id: CardThemeId): CardThemeMeta {
  return CARD_THEMES[id];
}
