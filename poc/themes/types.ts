import type { Card } from "@/engine/card";
import type { ComponentType } from "react";

export interface CardFaceProps {
  card: Card;
  className?: string;
}

export type CardThemeId = "sketch-paper";

export interface CardThemeMeta {
  id: CardThemeId;
  name: string;
  description: string;
  Component: ComponentType<CardFaceProps>;
}
