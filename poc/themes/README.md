# Card Themes

Pluggable card face themes for the Quintet PoC. All themes use a **5:7 aspect ratio** and scale with their container (grid cells and pool cards share the same `--cell-size`).

## Choose a theme

### Option A — config file (default on first load)

Edit [`config.ts`](config.ts):

```typescript
export const DEFAULT_THEME_ID: CardThemeId = "minimal-flat";
```

### Option B — in-game dropdown

Use the **Theme** selector in the left **Options** panel. Your choice is saved to `localStorage` (`quintet-theme`).

## Available themes

| ID | Name | Notes |
|----|------|-------|
| `minimal-flat` | Minimal Flat | Pure CSS, smallest bundle (**default**) |
| `letele-classic` | Letele Classic | @letele/playing-cards SVG (CC0) |
| `casino-luxe` | Casino Luxe | Gold frame, cream face |
| `neo-brutalist` | Neo Brutalist | Bold outline + hard shadow |
| `typographic` | Typographic | Large rank typography |

## Layout

```
themes/
  config.ts          # DEFAULT_THEME_ID + THEME_CONFIG catalog
  index.ts           # registry + getCardTheme()
  types.ts
  deckKey.ts         # rank/suit → @letele export names
  LeteleClassic.tsx
  MinimalFlat.tsx
  …
  styles/            # per-theme CSS
```

To add a theme: implement a `CardFace` component, register it in `index.ts` `FACES`, and add an entry to `THEME_CONFIG` in `config.ts`.
