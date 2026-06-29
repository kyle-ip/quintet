export type ColorMode = "light" | "dark";

export const COLOR_MODE_STORAGE_KEY = "quintet-color-mode";

export const DEFAULT_COLOR_MODE: ColorMode = "light";

export function resolveColorMode(stored: string | null): ColorMode {
  return stored === "dark" ? "dark" : "light";
}

export function applyColorMode(mode: ColorMode): void {
  document.documentElement.dataset.colorMode = mode;
}
