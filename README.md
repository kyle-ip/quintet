# Quintet

5×5 poker grid card game — place cards with eight-direction adjacency, score 12 Texas Hold'em-style lines.

**[Play live demo](https://kyle-ip.github.io/quintet/)**

## Project status

| Stage | Status | Location |
|-------|--------|----------|
| Feasibility & scoring design | Done | [`docs/`](docs/) |
| Python reference prototype | Done | [`prototype/`](prototype/) |
| **Browser PoC (solo)** | **Done** | [`poc/`](poc/) |
| **Phase 5 — hardening & deploy** | **In progress** | GitHub Pages + CI |

The browser PoC is a playable solo build: drag-and-drop, **v4 scoring**, undo, play timer, themes, light/dark mode, line hover hints, scoring-rules reference, and first-game tutorial.

## Repository layout

| Path | Description |
|------|-------------|
| [`docs/`](docs/) | Design documents (feasibility, scoring, technical design) |
| [`prototype/`](prototype/) | Python CLI — rules engine reference, simulation, two-player |
| [`poc/`](poc/) | **Browser PoC** — React + TypeScript solo game |
| [`fixtures/`](fixtures/) | Shared golden score fixtures (TS ↔ Python parity) |
| [`prompt.md`](prompt.md) | Original game rules draft |

## Documentation

- [Project status & roadmap](docs/project-status.en.md)
- [Feasibility analysis](docs/feasibility-analysis.en.md)
- [Scoring design (v4)](docs/scoring-design.en.md)
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
| `npm run build:pages` | GitHub Pages build (`/quintet/` base) |
| `npm test` | Vitest (engine + scoring + golden fixtures) |
| `npm run test:e2e` | Playwright solo game E2E |
| `npm run preview` | Preview production build |

See [poc/README.md](poc/README.md) for features, controls, and layout. Card themes: [poc/themes/README.md](poc/themes/README.md).

## Python prototype

```bash
cd prototype
pip install -e .
python -m quintet.cli --mode solo
```

See [prototype/README.md](prototype/README.md) for CLI modes, simulation, and tests.

## What's next

Phase 5 focuses on deployable, testable, shareable solo PoC.

Phase 6 adds browser two-player; 

Phase 7 adds online play.

See **[Project status & roadmap](docs/project-status.en.md)** for milestones and sprint plan.
