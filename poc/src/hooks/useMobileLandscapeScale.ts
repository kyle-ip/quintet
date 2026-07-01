import { useEffect, useRef } from "react";
import {
  MOBILE_LANDSCAPE_QUERY,
  TABLET_LANDSCAPE_MIN_HEIGHT,
  TABLET_SMALL_LANDSCAPE_MAX_HEIGHT,
} from "./mobileLandscape";

const LAYOUT_CSS_VARS = [
  "--cell-size",
  "--pool-station-width",
  "--pool-surface-pad-x",
  "--pool-surface-pad-y",
  "--grid-gap",
  "--grid-pad",
  "--play-gap",
  "--pool-stack-peek",
  "--play-stage-pad-x",
  "--play-stage-pad-y",
  "--mobile-layout",
  "--board-pool-gap",
  "--play-side-gap",
  "--drag-card-scale",
  "--drag-card-inner-scale",
  "--pool-bridge-width",
  "--pool-spread-width",
  "--pool-card-gap",
] as const;

function clearLayoutCssVars(el: HTMLElement) {
  for (const prop of LAYOUT_CSS_VARS) {
    el.style.removeProperty(prop);
  }
}

interface MobileLandscapeScaleOptions {
  boardSize: 4 | 5;
  poolSize: number;
  bannerVisible: boolean;
}

/** Fit board + pool inside the landscape viewport by scaling --cell-size. */
export function useMobileLandscapeScale({
  boardSize,
  poolSize,
  bannerVisible,
}: MobileLandscapeScaleOptions) {
  const layoutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_LANDSCAPE_QUERY);

    function update() {
      const el = layoutRef.current;
      if (!el) return;

      if (!mq.matches) {
        el.removeAttribute("data-mobile-landscape");
        el.removeAttribute("data-tablet-landscape");
        el.removeAttribute("data-small-tablet");
        el.removeAttribute("data-short-landscape");
        clearLayoutCssVars(el);
        clearLayoutCssVars(document.documentElement);
        return;
      }

      el.setAttribute("data-mobile-landscape", "");
      el.style.setProperty("--mobile-layout", "1");

      const isTablet = window.innerHeight >= TABLET_LANDSCAPE_MIN_HEIGHT;
      const isSmallTablet =
        isTablet && window.innerHeight <= TABLET_SMALL_LANDSCAPE_MAX_HEIGHT;
      if (isTablet) {
        el.setAttribute("data-tablet-landscape", "");
      } else {
        el.removeAttribute("data-tablet-landscape");
      }
      if (isSmallTablet) {
        el.setAttribute("data-small-tablet", "");
      } else {
        el.removeAttribute("data-small-tablet");
      }

      if (!isTablet && window.innerHeight <= 320) {
        el.setAttribute("data-short-landscape", "");
      } else {
        el.removeAttribute("data-short-landscape");
      }

      const cols = boardSize;
      const topbar = el.querySelector<HTMLElement>(".app-topbar");
      const topbarH =
        topbar && getComputedStyle(topbar).display !== "none" ? topbar.offsetHeight : 0;
      const sideTopH = el.querySelector<HTMLElement>(".play-side-top")?.offsetHeight ?? 0;
      const sideBottomH = el.querySelector<HTMLElement>(".play-side-bottom")?.offsetHeight ?? 0;
      const sideRailGap = isTablet ? 10 : 6;
      const bannerH =
        bannerVisible && el.querySelector<HTMLElement>(".floor-banner")
          ? el.querySelector<HTMLElement>(".floor-banner")!.offsetHeight
          : 0;

      const safeL = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--safe-left") || "0",
      );
      const safeR = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--safe-right") || "0",
      );

      const boardPoolGap = isSmallTablet ? 12 : isTablet ? 20 : 10;
      const gap = isSmallTablet ? 5 : isTablet ? 6 : 3;
      const gridPad = isSmallTablet ? 7 : isTablet ? 8 : 4;
      const surfacePadX = isSmallTablet ? 16 : isTablet ? 24 : 18;
      const surfacePadY = isSmallTablet ? 16 : isTablet ? 20 : 14;
      const poolHeaderH = isSmallTablet ? 34 : isTablet ? 38 : 30;
      const poolDeckLabelH = isSmallTablet ? 16 : isTablet ? 18 : 14;
      const deckStackOverhang = isTablet ? 10 : 8;
      const deckCountBadgeH = isTablet ? 10 : 8;
      const bridgeW = isSmallTablet ? 14 : isTablet ? 16 : 12;
      const poolCardGap = isSmallTablet ? 5 : isTablet ? 7 : 5;
      const stagePadX = isSmallTablet ? 22 : isTablet ? 40 : 16;
      const stagePadY = isTablet ? 10 : 6;
      const widthSafety = isSmallTablet ? 8 : isTablet ? 24 : 12;
      const maxCellCap = isSmallTablet ? 132 : isTablet ? 124 : 56;
      const minCell = isSmallTablet ? 38 : isTablet ? 34 : 26;

      const cardH = (w: number) => w * (7 / 5);

      function poolWidthForCell(cellW: number): number {
        return (
          surfacePadX * 2 +
          cellW +
          bridgeW +
          poolSize * cellW +
          Math.max(0, poolSize - 1) * poolCardGap
        );
      }

      const lineGaps = (cols - 1) * gap + 2 * gridPad;
      const playH = Math.max(
        100,
        window.innerHeight - topbarH - bannerH - stagePadY * 2 - 4,
      );
      const poolRailH =
        sideTopH +
        sideBottomH +
        (sideTopH > 0 ? sideRailGap : 0) +
        (sideBottomH > 0 ? sideRailGap : 0);
      const maxPoolH = Math.max(80, playH - poolRailH - 8);
      const cellFromHeight = ((playH - lineGaps) / cols) * (5 / 7);
      const poolFixedH =
        poolHeaderH + surfacePadY * 2 + deckStackOverhang + poolDeckLabelH + deckCountBadgeH + 4;
      const cellFromPoolH = ((maxPoolH - poolFixedH) * 5) / 7;

      const playW = Math.max(
        200,
        window.innerWidth - safeL - safeR - stagePadX * 2 - widthSafety,
      );

      let cell = Math.min(cellFromHeight, cellFromPoolH);
      for (let i = 0; i < 64; i++) {
        const poolW = poolWidthForCell(cell);
        const boardW = cols * cell + lineGaps;
        if (boardW + boardPoolGap + poolW <= playW) break;
        cell -= 0.5;
      }

      cell = Math.max(minCell, Math.min(cell, maxCellCap));
      cell = Math.floor(cell * 10) / 10;

      const poolW = Math.ceil(poolWidthForCell(cell));
      const spreadW = poolSize * cell + Math.max(0, poolSize - 1) * poolCardGap;
      const dragScale = "1";
      const dragInnerScale = "1";

      const vars: Record<string, string> = {
        "--board-pool-gap": `${boardPoolGap}px`,
        "--play-side-gap": `${isTablet ? 0.4 : 0.35}rem`,
        "--play-stage-pad-x": `${stagePadX}px`,
        "--play-stage-pad-y": `${stagePadY}px`,
        "--cell-size": `${cell}px`,
        "--grid-gap": `${gap}px`,
        "--grid-pad": `${gridPad}px`,
        "--play-gap": "0.25rem",
        "--pool-station-width": `${poolW}px`,
        "--pool-surface-pad-x": `${surfacePadX}px`,
        "--pool-surface-pad-y": `${surfacePadY}px`,
        "--pool-stack-peek": `${Math.max(14, Math.ceil(cardH(cell) * 0.38))}px`,
        "--pool-bridge-width": `${bridgeW}px`,
        "--pool-spread-width": `${spreadW}px`,
        "--pool-card-gap": `${poolCardGap}px`,
        "--drag-card-scale": dragScale,
        "--drag-card-inner-scale": dragInnerScale,
      };

      for (const [prop, value] of Object.entries(vars)) {
        el.style.setProperty(prop, value);
        document.documentElement.style.setProperty(prop, value);
      }
    }

    update();
    const observer = new ResizeObserver(update);
    observer.observe(document.documentElement);
    const layoutEl = layoutRef.current;
    if (layoutEl) {
      observer.observe(layoutEl);
      for (const sel of [".play-side-top", ".play-side-bottom", ".floor-banner"]) {
        const node = layoutEl.querySelector<HTMLElement>(sel);
        if (node) observer.observe(node);
      }
    }
    mq.addEventListener("change", update);
    window.addEventListener("orientationchange", update);

    return () => {
      observer.disconnect();
      mq.removeEventListener("change", update);
      window.removeEventListener("orientationchange", update);
    };
  }, [boardSize, poolSize, bannerVisible]);

  return layoutRef;
}

export { MOBILE_LANDSCAPE_QUERY } from "./mobileLandscape";
