/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_E2E?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "@letele/playing-cards" {
  import type { ComponentType } from "react";

  export interface DeckCardProps {
    width?: number;
    height?: number;
    className?: string;
  }

  export const Ha: ComponentType<DeckCardProps>;
  export const H2: ComponentType<DeckCardProps>;
  // ... other cards exported as named symbols (C*, D*, H*, S*)
}
