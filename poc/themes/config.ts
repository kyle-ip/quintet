import type { CardThemeId } from "./types";

export const DEFAULT_THEME_ID: CardThemeId = "sketch-paper";

export const THEME_STORAGE_KEY = "quintet-theme";

export interface ThemeConfigEntry {
  id: CardThemeId;
  name: string;
  description: string;
}

export const THEME_CONFIG: ThemeConfigEntry[] = [
  {
    id: "sketch-paper",
    name: "Kraft Paper",
    description: "Warm notebook — pencil brown & terracotta accent.",
  },
];

export function isValidThemeId(id: string): id is CardThemeId {
  return THEME_CONFIG.some((t) => t.id === id);
}

export function resolveThemeId(_stored: string | null): CardThemeId {
  return DEFAULT_THEME_ID;
}
