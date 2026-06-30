import { useEffect, useState } from "react";

const TAP_PLACE_QUERY = "(max-width: 768px), (pointer: coarse)";

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
