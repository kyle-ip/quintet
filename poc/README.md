# Quintet Web PoC

Browser proof-of-concept for **solo Quintet** — complete and playable. Rules and v2 scoring match the Python prototype in [`../prototype/`](../prototype/).

## Run

```bash
cd poc
npm install
npm run dev
```

App icons are in [`public/`](public/): `favicon.svg` (browser tab), `icon-512.png` / `icon-192.png` (shortcuts & PWA). Master vector: `icon.svg`.

Production build:

```bash
npm run build
npm run preview
```

## Features

| Area | Details |
|------|---------|
| **Gameplay** | Drag from Pool to 5×5 Grid; adjacency rules; pool refill from deck; 25 turns to fill the board |
| **Scoring** | v2 formulas; header shows **live total** (complete lines only, 5/5) |
| **Undo** | Up to 25 steps; button or `Ctrl+Z` / `Cmd+Z` |
| **New game** | Custom confirm modal (not browser `confirm`); pool size `k` selectable when idle |
| **Game over** | Summary modal: final score, 12-line breakdown, best line; **View results** to reopen |
| **Stats** | Deck remaining, turn, action count (places + undos), score |
| **Themes** | 5 card face themes; persisted in `localStorage` |
| **Appearance** | Light / Dark mode (default Light); CSS variables |
| **Line hints** | Hover a placed card → rows/columns/diagonals through that cell, **formed** hand type + v2 formula (no “best possible fill”) |
| **Scoring rules** | Sidebar button → modal with v2 formulas and **worked example per hand** |
| **Animations** | Card pickup, legal-cell pulse, place impact; **deck draw** flyover into pool |
| **App icon** | Playing-card design (option B); SVG + PNG + PWA manifest |

## Layout

```
┌ Quintet ───────────────────────────── Undo  New game ─┐
│ Options    │         5×5 board          │ Pick (tray)│
│ Stats      │                            │ Deck → Pool│
│ Scoring rules                                         │
└───────────────────────────────────────────────────────┘
```

Top bar width aligns with the game area (sidebar | board | pool). Board is centered; sidebar and pool use equal spacing from the grid.

## Controls

- **Drag** a pool card onto a highlighted empty cell (legal adjacency)
- **Pool k** — 1–5 (locked after first placement until new game)
- **Theme** / **Mode** — card theme and light/dark
- **Undo** / **New game** — top right
- **Scoring rules** — bottom of left column

## Card themes

See [`themes/README.md`](themes/README.md).

- Default: edit [`themes/config.ts`](themes/config.ts) → `DEFAULT_THEME_ID`
- In-game **Theme** dropdown → `localStorage` key `quintet-theme`

| ID | Style |
|----|--------|
| `minimal-flat` | CSS flat (**default**) |
| `letele-classic` | SVG deck (@letele, CC0) |
| `casino-luxe` | Gold / cream casino |
| `neo-brutalist` | Bold outline |
| `typographic` | Large rank type |

## Architecture

```
poc/
  src/
    engine/          # Pure TS rules (no React) — port of prototype
    store/           # Zustand gameStore
    components/      # Board, Pool, Card, Modal, ScoringRules, GameSummary, NewGameConfirm
    config/          # colorMode, scoringRules display copy
  themes/            # Pluggable card face themes
```

Stack: **React 18**, **TypeScript**, **Vite**, **@dnd-kit**, **Zustand**, **Vitest**.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server with HMR |
| `npm run build` | Typecheck + Vite production build |
| `npm test` | Run Vitest once |
| `npm run test:watch` | Vitest watch mode |
| `npm run preview` | Serve `dist/` locally |

## Tests

Engine unit tests (`src/engine/*.test.ts`, `src/config/scoringRules.test.ts`): hand evaluation, adjacency, live scoring, undo snapshots, partial-line hint scoring, scoring-rule examples. **15 tests** total.

## localStorage keys

| Key | Purpose |
|-----|---------|
| `quintet-theme` | Selected card theme id |
| `quintet-color-mode` | `light` or `dark` |

## Related docs

- [Project status & roadmap](../docs/project-status.en.md)
- [Technical design (PoC)](../docs/technical-design.en.md)
- [Scoring v2 design](../docs/scoring-design.en.md)
