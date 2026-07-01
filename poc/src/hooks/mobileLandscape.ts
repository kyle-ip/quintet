/** Phone landscape — height-based so it works on all iPhone widths including Pro Max. */
export const MOBILE_LANDSCAPE_QUERY =
  "(orientation: landscape) and (max-height: 520px), (orientation: landscape) and (hover: none) and (pointer: coarse)";

export const MOBILE_PORTRAIT_QUERY =
  "(orientation: portrait) and (max-height: 520px), (orientation: portrait) and (hover: none) and (pointer: coarse)";

/** Landscape touch layout on iPad / large tablets (height well above phone). */
export const TABLET_LANDSCAPE_MIN_HEIGHT = 521;

/** iPad Air / mini — shorter than Pro; use tighter margins for a larger board. */
export const TABLET_SMALL_LANDSCAPE_MAX_HEIGHT = 960;

export function isMobileLandscape(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(MOBILE_LANDSCAPE_QUERY).matches;
}

export function isTabletLandscape(): boolean {
  if (typeof window === "undefined") return false;
  return isMobileLandscape() && window.innerHeight >= TABLET_LANDSCAPE_MIN_HEIGHT;
}
