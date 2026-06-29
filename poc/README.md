# Quintet Web PoC

Browser proof-of-concept for **solo Quintet** — complete and playable.

**[Live demo](https://kyle-ip.github.io/quintet/)** · Rules and **v4 scoring** match the Python prototype in [`../prototype/`](../prototype/).

## Run

```bash
cd poc
npm install
npm run dev
```

App icons are in [`public/`](public/): `favicon.svg` (browser tab), `icon-512.png` / `icon-192.png` (shortcuts & PWA). Master vector: `icon.svg`.

Production build:

```bash
npm run build          # local preview at /
npm run build:pages    # GitHub Pages at /quintet/
npm run preview
npm run preview:pages  # preview Pages base locally
```

## Features

| Area | Details |
|------|---------|
| **Gameplay** | Drag from Pool to 5×5 Grid; **eight-direction** adjacency; pool refill from deck; 25 turns to fill the board |
| **Scoring** | **v4** formulas; header shows **live total** (complete lines only, 5/5) |
| **Timer** | Starts on first placement; stops on game complete; shown in sidebar and summary |
| **Undo** | Up to 25 steps; button or `Ctrl+Z` / `Cmd+Z` |
| **New game** | Custom confirm modal (not browser `confirm`); pool size `k` selectable when idle |
| **Game over** | Summary modal: final score, 12-line breakdown, best line, time; **View results** to reopen |
| **Lines panel** | Collapsible sidebar list of all 12 lines (progress + scored lines) |
| **Tutorial** | First-visit **How to play** overlay; reopen from sidebar |
| **Stats** | Deck remaining, turn, action count (places + undos), score, time |
| **Themes** | 5 card face themes; persisted in `localStorage` |
| **Appearance** | Light / Dark mode (default Light); CSS variables |
| **Line hints** | Hover a placed card → rows/columns/diagonals through that cell, **formed** hand type + v4 formula |
| **Scoring rules** | Sidebar button → modal with v4 formulas and **worked example per hand** |
| **Animations** | Card pickup, legal-cell pulse, place impact; **deck draw** flyover into pool |
| **App icon** | Playing-card design (option B); SVG + PNG + PWA manifest |

## Layout

```
┌ Quintet ───────────────────────────── Undo  New game ─┐
│ Options    │         5×5 board          │ Pick (tray)│
│ Stats      │                            │ Deck → Pool│
│ Lines      │                                         │
│ How to play / Scoring rules                           │
└───────────────────────────────────────────────────────┘
```

On narrow screens the layout stacks vertically (board centered, sidebar above pool).

## Controls

- **Drag** a pool card onto a highlighted empty cell (legal adjacency)
- **Touch** — long-press (~150ms) then drag on mobile (dnd-kit TouchSensor)
- **Pool k** — 1–5 (locked after first placement until new game)
- **Theme** / **Mode** — card theme and light/dark
- **Undo** / **New game** — top right
- **How to play** / **Scoring rules** — sidebar

## Mobile QA checklist

Manual smoke test before release:

| Check | iOS Safari | Android Chrome |
|-------|------------|----------------|
| Long-press drag from pool to legal cell | | |
| Board readable; no horizontal overflow | | |
| Modals (tutorial, summary, scoring) scroll and close | | |
| Undo / New game tappable | | |
| Complete 25 placements without layout break | | |

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
    components/      # Board, Pool, Card, Modal, ScoringRules, GameSummary, Tutorial, LinesPanel
    config/          # colorMode, scoringRules display copy
  e2e/               # Playwright tests
  themes/            # Pluggable card face themes
```

Stack: **React 18**, **TypeScript**, **Vite**, **@dnd-kit**, **Zustand**, **Vitest**, **Playwright**.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server with HMR |
| `npm run build` | Typecheck + Vite production build |
| `npm run build:pages` | Build for GitHub Pages (`/quintet/` base) |
| `npm test` | Run Vitest once |
| `npm run test:watch` | Vitest watch mode |
| `npm run test:e2e` | Playwright E2E (starts dev server) |
| `npm run preview` | Serve `dist/` locally |

## Tests

Engine unit tests + golden fixtures (`../fixtures/golden-scores.json`) for TS ↔ Python v4 parity. **22+ Vitest cases** including golden and scoring-rule examples.

## localStorage keys

| Key | Purpose |
|-----|---------|
| `quintet-theme` | Selected card theme id |
| `quintet-color-mode` | `light` or `dark` |
| `quintet-tutorial-seen` | Skip first-visit tutorial when set |

## Related docs

- [Project status & roadmap](../docs/project-status.en.md)
- [Technical design (PoC)](../docs/technical-design.en.md)
- [Scoring v4 design](../docs/scoring-design.en.md)
