import { useEffect, useState } from "react";
import { MOBILE_LANDSCAPE_QUERY } from "./useMobileLandscapeScale";

/** Tap-to-place on mobile landscape (no drag needed). */
const TAP_PLACE_QUERY = `${MOBILE_LANDSCAPE_QUERY}, (hover: none) and (pointer: coarse) and (orientation: landscape)`;

export function useTapPlaceMode(): boolean {
  const [tapPlace, setTapPlace] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(TAP_PLACE_QUERY).matches;
  });

  useEffect(() => {
    const mq = window.matchMedia(TAP_PLACE_QUERY);
    const update = () => setTapPlace(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return tapPlace;
}
