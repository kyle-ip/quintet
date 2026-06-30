import { useEffect, useRef } from "react";
import { MOBILE_LANDSCAPE_QUERY, TABLET_LANDSCAPE_MIN_HEIGHT } from "./mobileLandscape";

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
        el.removeAttribute("data-short-landscape");
        for (const prop of [
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
        ]) {
          el.style.removeProperty(prop);
        }
        return;
      }

      el.setAttribute("data-mobile-landscape", "");
      el.style.setProperty("--mobile-layout", "1");

      const isTablet = window.innerHeight >= TABLET_LANDSCAPE_MIN_HEIGHT;
      if (isTablet) {
        el.setAttribute("data-tablet-landscape", "");
      } else {
        el.removeAttribute("data-tablet-landscape");
      }

      if (!isTablet && window.innerHeight <= 320) {
        el.setAttribute("data-short-landscape", "");
      } else {
        el.removeAttribute("data-short-landscape");
      }

      const cols = boardSize;
      const topbarH = el.querySelector<HTMLElement>(".app-topbar")?.offsetHeight ?? 34;
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

      const boardPoolGap = isTablet ? 22 : 10;
      const gap = isTablet ? 6 : 3;
      const gridPad = isTablet ? 8 : 4;
      const surfacePadX = isTablet ? 26 : 18;
      const surfacePadY = isTablet ? 20 : 14;
      const poolHeaderH = isTablet ? 38 : 30;
      const poolDeckLabelH = isTablet ? 18 : 14;
      const deckStackOverhang = isTablet ? 10 : 8;
      const deckCountBadgeH = isTablet ? 10 : 8;
      const bridgeW = isTablet ? 14 : 10;
      const poolCardGap = isTablet ? 8 : 5;
      const stagePadX = isTablet ? 48 : 16;
      const stagePadY = isTablet ? 12 : 6;
      const widthSafety = isTablet ? 32 : 12;
      const maxCellCap = isTablet ? 118 : 56;
      const minCell = isTablet ? 34 : 26;

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
        window.innerHeight - topbarH - bannerH - 6,
      );
      const playW = Math.max(
        200,
        window.innerWidth - safeL - safeR - stagePadX * 2 - widthSafety,
      );

      const maxPoolH = playH - 8;
      const cellFromHeight = ((playH - surfacePadY * 2 - lineGaps) / cols) * (5 / 7);
      const poolFixedH =
        poolHeaderH + surfacePadY * 2 + deckStackOverhang + poolDeckLabelH + deckCountBadgeH + 4;
      const cellFromPoolH = ((maxPoolH - poolFixedH) * 5) / 7;

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

      el.style.setProperty("--board-pool-gap", `${boardPoolGap}px`);
      el.style.setProperty("--play-stage-pad-x", `${stagePadX}px`);
      el.style.setProperty("--play-stage-pad-y", `${stagePadY}px`);
      el.style.setProperty("--cell-size", `${cell}px`);
      el.style.setProperty("--grid-gap", `${gap}px`);
      el.style.setProperty("--grid-pad", `${gridPad}px`);
      el.style.setProperty("--play-gap", "0.25rem");
      el.style.setProperty("--pool-station-width", `${poolW}px`);
      el.style.setProperty("--pool-surface-pad-x", `${surfacePadX}px`);
      el.style.setProperty("--pool-surface-pad-y", `${surfacePadY}px`);
      el.style.setProperty(
        "--pool-stack-peek",
        `${Math.max(14, Math.ceil(cardH(cell) * 0.38))}px`,
      );
    }

    update();
    const observer = new ResizeObserver(update);
    observer.observe(document.documentElement);
    if (layoutRef.current) {
      observer.observe(layoutRef.current);
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
