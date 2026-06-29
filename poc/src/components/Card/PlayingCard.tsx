import type { Card } from "@/engine/card";
import { useGameStore } from "@/store/gameStore";
import { getCardTheme } from "@themes/index";
import "./PlayingCard.css";

interface PlayingCardProps {
  card: Card;
  className?: string;
  /** fill: parent cell; drag: fixed responsive width for overlay */
  variant?: "fill" | "drag";
  /** Play snap impact after placement */
  justPlaced?: boolean;
}

export function PlayingCard({ card, className, variant = "fill", justPlaced = false }: PlayingCardProps) {
  const themeId = useGameStore((s) => s.themeId);
  const { Component } = getCardTheme(themeId);
  return (
    <div
      className={[
        "playing-card",
        variant === "drag" ? "playing-card--drag" : "",
        justPlaced ? "playing-card--impact" : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Component card={card} />
    </div>
  );
}
