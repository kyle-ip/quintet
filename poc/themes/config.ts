import type { CardThemeId } from "./types";

/**
 * Card theme selection
 * ------------------
 * 1. Set DEFAULT_THEME_ID below (used on first visit)
 * 2. Or pick at runtime via the Theme dropdown in the game header (saved to localStorage)
 */

export const DEFAULT_THEME_ID: CardThemeId = "minimal-flat";

export const THEME_STORAGE_KEY = "quintet-theme";

export interface ThemeConfigEntry {
  id: CardThemeId;
  name: string;
  description: string;
}

/** Available themes — add entries here when implementing new faces under ./faces/ */
export const THEME_CONFIG: ThemeConfigEntry[] = [
  {
    id: "minimal-flat",
    name: "Minimal Flat",
    description: "Pure CSS, lightweight, scales cleanly (recommended default).",
  },
  {
    id: "letele-classic",
    name: "Letele Classic",
    description: "Adrian Kennard SVG deck via @letele/playing-cards (CC0).",
  },
  {
    id: "casino-luxe",
    name: "Casino Luxe",
    description: "Gold trim and cream face; casino table aesthetic.",
  },
  {
    id: "neo-brutalist",
    name: "Neo Brutalist",
    description: "Bold outline and hard shadow; playful high contrast.",
  },
  {
    id: "typographic",
    name: "Typographic",
    description: "Oversized rank typography with minimal suit accent.",
  },
];

export function isValidThemeId(id: string): id is CardThemeId {
  return THEME_CONFIG.some((t) => t.id === id);
}

export function resolveThemeId(stored: string | null): CardThemeId {
  if (stored && isValidThemeId(stored)) {
    return stored;
  }
  return DEFAULT_THEME_ID;
}
