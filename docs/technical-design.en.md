---
title: Quintet Web PoC Technical Design
date: 2026-06-29
updated: 2026-06-29
version: poc-1
lang: en
status: implemented
---

# Quintet Web PoC Technical Design

> **Status: PoC complete.** Playable solo build in [`poc/`](../poc/). This document describes what was built; a production web app is a follow-on iteration.

## 1. Goals and Scope

### 1.1 Delivered (PoC)

Browser PoC with:

- **Drag-and-drop** from Pool onto the 5×5 Grid
- **Adjacency rules** (first card anywhere; later adjacent in eight directions, including diagonals)
- **Live total score** after every placement (complete lines only, 5/5)
- Full **solo** flow (setup → 25 placements → game-over banner)
- Undo, new game (with confirm), action count, themes, light/dark mode, line hover hints, scoring-rules dialog

### 1.2 Out of scope (follow-on)

| Item | Notes |
|------|-------|
| Two-player / online | See Python CLI in [`prototype/`](../prototype/); browser Phase 4+ |
| Backend / accounts | Client-only |
| AI opponent | Greedy bot in Python; not in browser UI |
| Persistent 12-line panel | PoC shows total in sidebar; per-line detail on card hover |
| Native mobile apps | Responsive web; dnd-kit touch support |

### 1.3 Reference implementation

- Rules: [`prompt.md`](../prompt.md)
- Scoring v2: [`prototype/quintet/scoring.py`](../prototype/quintet/scoring.py), [`poc/src/engine/scoring.ts`](../poc/src/engine/scoring.ts)
- Docs: [`feasibility-analysis.en.md`](feasibility-analysis.en.md), [`scoring-design.en.md`](scoring-design.en.md)

---

## 2. Technology Choices

### 2.1 Overview

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Language | **TypeScript** | Type-safe rules engine |
| UI | **React 18** | Grid / Pool components |
| Build | **Vite** | Fast HMR |
| Drag-and-drop | **@dnd-kit/core** | Accessible, touch-friendly |
| State | **Zustand** | Lightweight store + undo history |
| Styling | **CSS variables** + component CSS | Light/dark themes |
| Tests | **Vitest** | 13 engine/scoring tests |

### 2.2 Playing-card UI

Five pluggable themes under [`poc/themes/`](../poc/themes/). Default **minimal-flat** (CSS). **letele-classic** uses [@letele/playing-cards](https://www.npmjs.com/package/@letele/playing-cards) (CC0). All themes share 5:7 aspect ratio via `--cell-size`.

`PlayingCard` wraps theme faces with a stable `{ rank, suit }` API.

### 2.3 Directory layout (as built)

```
poc/
  src/
    engine/           # pure TS — port of prototype
    store/gameStore.ts
    components/
      Board/ Pool/ Card/ ScoringRules/
    config/           # colorMode, scoringRules copy
  themes/
```

---

## 3. Architecture

### 3.1 Layers

Presentation (dnd-kit, Board, Pool, header, modals) → Zustand `gameStore` → pure `engine/` (Grid, Hand, v2 Scoring, SoloGame).

### 3.2 Data flow

1. **Init:** pool size `k` → shuffle deck → fill pool
2. **Drag / drop:** `dropCard` → adjacency check → grid update → refill pool
3. **Score:** `scoreGridLive` → total in Stats
4. **Hover:** `getCellScoreHint` → lines through cell, **formed** hand + v2 formula
5. **End:** 25 cells → disable pool drag, show final score

### 3.3 Live scoring

| Line state | PoC behavior |
|------------|----------------|
| 0–4 cards | Excluded from total; hover shows **currently formed** hand score (e.g. pair, high card) |
| 5 cards | Full `evaluateFive` + `scoreV2`; added to total |

**Scoring rules:** sidebar **Scoring rules** button → dialog ([`config/scoringRules.ts`](../poc/src/config/scoringRules.ts)).

---

## 4. Drag-and-drop UX

- Source: Pool cards; target: empty legal cells
- Legal cells highlighted while dragging; pointer sensor with 6px activation distance
- Pool and grid cells share `--cell-size`

---

## 5. Rules engine port

| Python | TypeScript |
|--------|------------|
| `card.py` | `card.ts` |
| `deck.py` | `deck.ts` |
| `grid.py` | `grid.ts` |
| `hand.py` | `hand.ts` |
| `scoring.py` | `scoring.ts` |
| `game.py` | `game.ts` |
| — | `state.ts` (clone for undo) |

Card id: `As`, `Td`, etc.

---

## 6. UI layout (implemented)

```
+------------------------------------------------------------------+
|  Quintet                              [Undo]  [New game]         |
+------------------------------------------------------------------+
| Options      |      [5×5 Grid]              |  Pool              |
| Stats        |                              |                    |
| [Scoring rules]                                     (same card size)
+------------------------------------------------------------------+
```

Three-column grid: sidebar | board (centered) | pool. Top bar aligned to game width.

---

## 7. State (Zustand)

`gameStore`: `state`, `liveScore`, `history` (undo, max 25), `actionCount`, `themeId`, `colorMode`, `initGame`, `dropCard`, `undo`, theme/mode setters. Persist theme and color mode in `localStorage`.

---

## 8. Testing

| Type | Target |
|------|--------|
| Unit | `engine/*` — hands, adjacency, v4 scoring, undo, line hints |
| Golden vs Python | `fixtures/golden-scores.json` — CI on both stacks |
| E2E | Playwright `e2e/solo.spec.ts` — full solo game |

Run: `cd poc && npm test`

---

## 9. Implementation phases

| Phase | Deliverable | Status |
|-------|-------------|--------|
| W1 | Scaffold + engine + Vitest | Done |
| W2 | Grid / Pool / themes | Done |
| W3 | dnd-kit + adjacency | Done |
| W4 | Score, undo, layout, hover, rules dialog, light/dark | Done |
| W5 | GitHub Pages, CI, golden tests, E2E, tutorial, lines panel | Done |

PoC version **0.1.0**.

---

## 10. Risks (remaining)

| Risk | Mitigation |
|------|------------|
| TS / Python score drift | Golden fixtures when adding CI |
| Card library API change | Theme + `PlayingCard` adapter |
| Safari DnD | dnd-kit touch config; device testing |

---

## 11. Conclusion

PoC delivers solo Quintet in the browser with v2 scoring and polished UX (undo, themes, hints, rules reference). **`engine/`** is ready for two-player and online extensions. See [`poc/README.md`](../poc/README.md) to run and play.

---

*Document version poc-1.*
