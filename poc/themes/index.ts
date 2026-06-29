import { applySketchTheme } from "./applyTheme";
import { SketchPaper } from "./Sketch";
import { THEME_CONFIG } from "./config";
import type { CardThemeId, CardThemeMeta } from "./types";

export type { CardFaceProps, CardThemeId, CardThemeMeta } from "./types";
export {
  DEFAULT_THEME_ID,
  THEME_CONFIG,
  THEME_STORAGE_KEY,
  isValidThemeId,
  resolveThemeId,
  type ThemeConfigEntry,
} from "./config";
export { applySketchTheme };

const meta: CardThemeMeta = {
  ...THEME_CONFIG[0],
  Component: SketchPaper,
};

export const CARD_THEMES: Record<CardThemeId, CardThemeMeta> = {
  "sketch-paper": meta,
};

export const CARD_THEME_LIST = [meta];

export function getCardTheme(_id: CardThemeId = "sketch-paper"): CardThemeMeta {
  return meta;
}
