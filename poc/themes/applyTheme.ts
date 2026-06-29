import type { CardThemeId } from "./types";

/** Apply UI palette + card variant hook on `<html>`. */
export function applySketchTheme(id: CardThemeId): void {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.sketchTheme = id;
  document.documentElement.dataset.colorMode = "light";
}
