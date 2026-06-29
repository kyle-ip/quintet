# Quintet

5×5 poker grid card game — place cards with adjacency rules, score 12 Texas Hold'em-style lines.

## Project status

| Stage | Status | Location |
|-------|--------|----------|
| Feasibility & scoring design | Done | [`docs/`](docs/) |
| Python reference prototype | Done | [`prototype/`](prototype/) |
| **Browser PoC (solo)** | **Done** | [`poc/`](poc/) |

The browser PoC is a playable solo build: drag-and-drop, v2 scoring, undo, themes, light/dark mode, line hover hints, and an in-app scoring-rules reference.

## Repository layout

| Path | Description |
|------|-------------|
| [`docs/`](docs/) | Design documents (feasibility, scoring, technical design) |
| [`prototype/`](prototype/) | Python CLI — rules engine reference, simulation, two-player |
| [`poc/`](poc/) | **Browser PoC** — React + TypeScript solo game |
| [`prompt.md`](prompt.md) | Original game rules draft |

## Documentation

- [Project status & roadmap (中文)](docs/project-status.zh.md) · [English](docs/project-status.en.md)
- [Feasibility analysis](docs/feasibility-analysis.en.md)
- [Scoring design (v2)](docs/scoring-design.en.md)
- [Technical design — Web PoC](docs/technical-design.en.md)

## Browser PoC (quick start)

```bash
cd poc
npm install
npm run dev
```

Open the URL shown in the terminal (default `http://localhost:5173`).

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build → `poc/dist/` |
| `npm test` | Vitest (engine + scoring + undo) |
| `npm run preview` | Preview production build |

See [poc/README.md](poc/README.md) for features, controls, and layout. Card themes: [poc/themes/README.md](poc/themes/README.md).

## Python prototype

```bash
cd prototype
pip install -e .
python -m quintet.cli --mode solo
```

See [prototype/README.md](prototype/README.md) for CLI modes, simulation, and tests.

## What’s next (post-PoC)

Not in the PoC scope yet: browser two-player, backend/accounts, AI opponent UI, ranked online play. The TypeScript `engine/` and Python `quintet/` packages are structured for a future production web app.

See **[Project status & roadmap](docs/project-status.en.md)** for completed work, phase plan, and sprint-level next steps.
