# Quintet — Python CLI Prototype

Reference implementation of Quintet rules, scoring (v2), Monte Carlo simulation, and local two-player CLI.

## Quick start

```bash
cd prototype
pip install -e .
python -m quintet.cli                    # interactive (solo / versus / match)
python -m quintet.cli --mode versus -k 2 # local two-player, k=2
python -m quintet.simulate --compare -n 50000
python -m quintet.simulate --greedy -n 5000
python -m pytest tests/ -q
```

## Modes

| Mode | Description |
|------|-------------|
| `solo` | Single player, shared deck/pool/grid |
| `versus` | Pass-and-play two-player, one game |
| `match` | Two games with alternating first player; combined score + tie-break |

CLI commands: `place <pool_idx> <row> <col>`, `auto`, `ai` (greedy bot, versus/match).

## Layout

```
prototype/
  quintet/          # core package
  tests/
  pyproject.toml
```

Design docs and the browser PoC live at the repo root ([`docs/`](../docs/), [`poc/`](../poc/)).
