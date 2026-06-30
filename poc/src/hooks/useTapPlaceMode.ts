import { useEffect, useState } from "react";
import { MOBILE_LANDSCAPE_QUERY } from "./mobileLandscape";

/** Touch landscape layout — drag + tap-to-place both supported. */
export function useTapPlaceMode(): boolean {
  const [tapPlace, setTapPlace] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(MOBILE_LANDSCAPE_QUERY).matches;
  });

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_LANDSCAPE_QUERY);
    const update = () => setTapPlace(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return tapPlace;
}
