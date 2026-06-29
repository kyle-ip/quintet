import { type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { PlayingCard } from "@/components/Card/PlayingCard";
import type { DealFlight } from "./poolDealFx";
import "./PoolDealFlyover.css";

interface PoolDealFlyoverProps {
  flights: DealFlight[];
}

export function PoolDealFlyover({ flights }: PoolDealFlyoverProps) {
  if (flights.length === 0) return null;

  return createPortal(
    <div className="pool-deal-layer" aria-hidden="true">
      {flights.map((flight) => {
        const dx = flight.toX - flight.fromX;
        const dy = flight.toY - flight.fromY;
        return (
          <div
            key={flight.id}
            className="pool-deal-fly"
            style={
              {
                left: flight.fromX,
                top: flight.fromY,
                width: flight.width,
                height: flight.height,
                "--deal-dx": `${dx}px`,
                "--deal-dy": `${dy}px`,
                animationDelay: `${flight.delayMs}ms`,
              } as CSSProperties
            }
          >
            <PlayingCard card={flight.card} variant="fill" />
          </div>
        );
      })}
    </div>,
    document.body,
  );
}
