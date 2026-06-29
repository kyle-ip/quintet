---
title: Quintet Project Status and Roadmap
date: 2026-06-29
version: status-1
lang: en
status: living
---

# Quintet Project Status and Roadmap

> Summary of work completed through **2026-06-29**, plus evolution plan and next development steps.  
> Chinese version: [project-status.zh.md](project-status.zh.md)

---

## 1. Overview

**Quintet** is a 5×5 poker grid game: pick cards from a pool, place them with eight-direction adjacency (including diagonals), and score 12 Texas Hold'em-style lines (5 rows, 5 columns, 2 diagonals).

| Dimension | Assessment |
|-----------|------------|
| Design feasibility | High — closed rule set; 52 cards fill the grid exactly |
| Technical feasibility | High — state machine + hand evaluation; no exotic algorithms |
| Current stage | **Browser solo PoC complete and playable** |
| Reference code | Python CLI (rules engine, simulation, local two-player) |

---

## 2. Completed Deliverables

### 2.1 Phase summary

| Phase | Goal | Deliverable | Status |
|-------|------|-------------|--------|
| **Design** | Rules, feasibility, scoring | [`docs/`](../docs/), [`prompt.md`](../prompt.md) | ✅ Done |
| **Phase 1** | Validate rule flow | Python engine + solo CLI | ✅ Done |
| **Phase 2** | Score calibration | v2 coefficients (50k Monte Carlo) | ✅ Done |
| **Phase 3** | Two-player playability | Local versus/match, greedy AI, simulation | ✅ Done |
| **Phase 4** | Browser playability | React solo PoC | ✅ Done |
| **Phase 5+** | Product expansion | Web two-player, online, ranked | 📋 Planned |

### 2.2 Documentation

| Document | Description |
|----------|-------------|
| [Feasibility analysis](feasibility-analysis.en.md) | Rules, balance, tech, two-player assessment |
| [Scoring design v2](scoring-design.en.md) | Coefficients, simulation, hand values |
| [Web PoC technical design](technical-design.en.md) | Stack, architecture, implementation phases |
| [Game rules draft](../prompt.md) | Original rules |

### 2.3 Python prototype (`prototype/`)

| Area | Capabilities |
|------|--------------|
| Core engine | Cards/deck, 5×5 grid, adjacency, 12-line hands, v2 scoring |
| CLI | `solo`, `versus`, `match` |
| Match format | Two games, alternating first player; tie-break chain |
| AI | Greedy bot (`ai` command) |
| Simulation | Random vs greedy, Monte Carlo score comparison |
| Tests | `pytest` unit tests |

### 2.4 Browser PoC (`poc/`) — primary deliverable

**Stack:** React 18, TypeScript, Vite, @dnd-kit, Zustand, Vitest

#### Gameplay

| Feature | Details |
|---------|---------|
| Drag-and-drop | Pool → legal empty cells; first card anywhere, then eight-direction adjacency |
| Pool k | 1–5 at setup; locked after first placement until new game |
| 25 turns | Fill 5×5 → game over |
| v2 scoring | **Complete lines only** (5/5); formulas match Python |

#### UI and UX

| Feature | Details |
|---------|---------|
| Three-column layout | Top bar \| sidebar \| centered board \| pool |
| Line hover hints | Placed card → lines through cell, **formed** hand + v2 formula (no optimal-fill prediction) |
| Placement animations | Pickup, droppable pulse, place impact |
| Custom modals | Shared `AppModal`; no native `confirm` |
| New game confirm | Context-aware copy (in progress vs finished) |
| Game summary | Auto on completion: total, 12-line breakdown, best line, action count; **View results** to reopen |
| Scoring rules | Sidebar button → v2 formulas + **worked example per hand** (engine-generated) |

#### Appearance and branding

| Feature | Details |
|---------|---------|
| 5 card themes | minimal-flat (default), letele-classic, casino-luxe, neo-brutalist, typographic |
| Light / dark mode | Default light; `localStorage` persistence |
| App icon | **Option B — Playing card** (tilted ace of spades); SVG + PNG sizes, PWA manifest |

#### State and actions

| Feature | Details |
|---------|---------|
| Undo | Up to 25 steps; button or Ctrl/Cmd+Z |
| Action count | Placements + undos |
| Live stats | Deck remaining, turn, score |

#### Architecture

```
poc/src/
  engine/       # Pure TS rules (aligned with Python)
  store/        # Zustand gameStore
  components/   # Board, Pool, Card, Modal, ScoringRules, GameSummary, NewGameConfirm
  config/       # colorMode, scoringRules (with example builder)
themes/         # Pluggable card faces
```

#### Tests (15 cases)

| File | Coverage |
|------|----------|
| `engine/engine.test.ts` | Adjacency, placement flow, end game |
| `engine/scoring.test.ts` | v2 and live scoring |
| `engine/undo.test.ts` | Undo snapshots |
| `config/scoringRules.test.ts` | Rule examples vs engine |

---

## 3. Explicitly out of PoC scope

| Item | Notes |
|------|-------|
| Browser two-player | Python CLI only |
| Online / accounts | No backend |
| Browser AI opponent | Greedy bot in Python only |
| Persistent 12-line panel | End-game modal + hover cover main cases |
| E2E automation | Not implemented |
| TS/Python golden-score CI | Not in pipeline |
| Native apps | Responsive web only |

---

## 4. Evolution roadmap (Phase 5+)

### 4.1 High-level flow

1. **Phase 5** — Harden and ship the solo PoC (deploy, mobile, golden tests, E2E)
2. **Phase 6** — Browser local two-player (`versus` / `match`)
3. **Phase 7** — Online multiplayer (rooms, sync, accounts, ranked)

### 4.2 Phase 5 — PoC hardening (est. 2–3 weeks)

| Priority | Work | Value |
|----------|------|-------|
| P0 | Static deploy (Vercel / Netlify / GitHub Pages) | Shareable demo URL |
| P0 | Mobile + Safari drag-and-drop QA | Broader device support |
| P1 | TS ↔ Python golden score fixtures in CI | Prevent engine drift |
| P1 | Playwright E2E: start → play → game over | Regression safety |
| P2 | First-game tutorial overlay | Lower onboarding friction |
| P2 | Accessibility (modal focus, keyboard play) | Inclusive UX |

### 4.3 Phase 6 — Browser two-player (est. 3–5 weeks)

| Priority | Work | Notes |
|----------|------|-------|
| P0 | Two-player state machine | Shared deck/pool; dual grids |
| P0 | Turn UI + opponent board | Highlight active player |
| P0 | Dual end-game summary | Side-by-side 12-line scores |
| P1 | Match mode | Port `resolve_match` from Python |
| P1 | Greedy AI practice mode | Port `ai.py` logic to TS |
| P2 | Hot-seat polish | Pool denial feedback |

**Reuse:** `prototype/quintet/two_player.py`, `ai.py`; extend `poc/src/engine/`.

### 4.4 Phase 7 — Online (est. 8–12 weeks, optional)

Server-authoritative games, WebSocket sync, accounts, ranked play, match history.

**Prerequisites:** Stable Phase 6; open rule questions resolved.

### 4.5 Open design items

From [feasibility analysis](feasibility-analysis.en.md):

1. Default k for ranked play
2. Partial deck refill edge cases (documented behavior)
3. Competitive undo limits
4. Localization strategy for rules/tutorial

---

## 5. Next development plan (recommended order)

> **Near-term focus:** Deployable, testable, shareable solo PoC before two-player / online.

### Sprint 1 (~1 week) — Ship and quality

| # | Task | Output |
|---|------|--------|
| 1 | Production deploy pipeline for `poc` | Public play URL |
| 2 | Sync READMEs with current features | Accurate docs |
| 3 | Golden score fixtures + CI (TS + Python) | Dual test run in CI |
| 4 | Mobile layout + touch DnD validation | Fix list + critical patches |

### Sprint 2 (~1–2 weeks) — UX and tests

| # | Task | Output |
|---|------|--------|
| 5 | Playwright full solo game E2E | `e2e/solo.spec.ts` |
| 6 | First-game tutorial (adjacency + 12 lines) | Skippable overlay |
| 7 | Optional collapsible 12-line panel in sidebar | Less hover-only dependency |

### Sprint 3 (~2–3 weeks) — Browser two-player MVP

| # | Task | Output |
|---|------|--------|
| 8 | Engine: `TwoPlayerGameState` + tests | Parity with Python |
| 9 | Dual-board UI + shared pool | Playable `versus` |
| 10 | Dual end-game comparison modal | Winner display |
| 11 | Match mode entry | Two-game format |

### Milestone criteria

| Milestone | Done when |
|-----------|-----------|
| **M1: Shareable PoC** | Deploy URL live; tests green; mobile basically works |
| **M2: Regressable PoC** | Golden CI + ≥1 E2E green |
| **M3: Web two-player MVP** | Full local `versus`; scores match Python |
| **M4: Online alpha** | Rooms, sync, server validation |

---

## 6. Repository layout

```
quinter/
  docs/           # Design docs + this document
  prototype/      # Python reference
  poc/            # Browser PoC (current main deliverable)
  prompt.md       # Rules draft
```

---

## 7. Conclusion

Quintet has completed the full path from **rules design → Python validation → v2 calibration → browser solo PoC**. The PoC delivers a polished core loop (drag-and-drop, undo, themes, modals, end-game summary, scoring reference with examples), and both `engine/` packages are structured for two-player and online extensions.

**Recommended next step:** Sprint 1 (deploy + golden tests + mobile), then browser two-player MVP; defer online until local versus is stable.

---

*Document version status-1 · 2026-06-29*
