import { useEffect, useRef } from "react";

const MOBILE_LANDSCAPE = "(max-width: 900px) and (orientation: landscape)";

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
    const mq = window.matchMedia(MOBILE_LANDSCAPE);

    function update() {
      const el = layoutRef.current;
      if (!el) return;

      if (!mq.matches) {
        for (const prop of [
          "--cell-size",
          "--pool-station-width",
          "--grid-gap",
          "--grid-pad",
          "--play-gap",
          "--pool-stack-peek",
          "--mobile-layout",
        ]) {
          el.style.removeProperty(prop);
        }
        return;
      }

      el.style.setProperty("--mobile-layout", "1");

      const cols = boardSize;
      const vh = window.innerHeight;
      const vw = window.innerWidth;

      const topbarH = 34;
      const bannerH = bannerVisible ? 30 : 0;
      const stagePadY = 4;
      const stagePadX = 6;
      const boardPoolGap = 6;
      const gap = 3;
      const gridPad = 4;

      const cardH = (w: number) => w * (7 / 5);
      const surfacePad = 8;
      const bridgeW = 4;

      const playH = vh - topbarH - bannerH - stagePadY * 2;
      const playW = vw - stagePadX * 2 - boardPoolGap;

      const lineGaps = (cols - 1) * gap + 2 * gridPad;

      // Pool strip: [deck][bridge][pool cards…] in one row — width tied to cell size.
      function poolWidthForCell(cellW: number): number {
        return (
          surfacePad +
          cellW +
          bridgeW +
          poolSize * cellW +
          (poolSize - 1) * 2 +
          surfacePad
        );
      }

      let cell = Math.min(
        (playW * 0.68 - lineGaps) / cols,
        ((playH - lineGaps) / cols) * (5 / 7),
      );
      cell = Math.max(22, Math.min(cell, 58));

      let poolW = poolWidthForCell(cell);
      const maxPoolW = playW * 0.32;
      if (poolW > maxPoolW) {
        cell = Math.max(22, ((maxPoolW - surfacePad * 2 - bridgeW - (poolSize - 1) * 2) / (1 + poolSize)));
        poolW = poolWidthForCell(cell);
      }

      const boardW = cols * cell + lineGaps;
      if (boardW + poolW + boardPoolGap > playW) {
        cell = Math.max(
          22,
          Math.min(
            cell,
            (playW - poolW - boardPoolGap - lineGaps) / cols,
          ),
        );
        poolW = poolWidthForCell(cell);
      }

      cell = Math.floor(cell * 10) / 10;
      poolW = Math.ceil(poolWidthForCell(cell));

      el.style.setProperty("--cell-size", `${cell}px`);
      el.style.setProperty("--grid-gap", `${gap}px`);
      el.style.setProperty("--grid-pad", `${gridPad}px`);
      el.style.setProperty("--play-gap", "0.3rem");
      el.style.setProperty("--pool-station-width", `${Math.ceil(poolW)}px`);
      el.style.setProperty(
        "--pool-stack-peek",
        `${Math.max(14, Math.ceil(cardH(cell) * 0.38))}px`,
      );
    }

    update();
    const observer = new ResizeObserver(update);
    observer.observe(document.documentElement);
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

export const MOBILE_LANDSCAPE_QUERY = MOBILE_LANDSCAPE;
