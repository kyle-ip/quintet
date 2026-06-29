---
title: Quintet Scoring Design
date: 2026-06-29
version: draft-1
lang: en
---

# Quintet Scoring Design

This document records Phase 2 Monte Carlo simulation results and the rationale for **v2 calibrated scoring**. Rules source: [`prompt.md`](../prompt.md).

## 1. Simulation Method

- **Sample size:** 50,000 games
- **Fill method:** Draw 25 cards from a shuffled 52-card deck; random start + random legal adjacency placement (consistent with “always a legal cell exists” during play)
- **Scoring lines:** 5 rows + 5 columns + 2 diagonals = 12 lines
- **Hand rules:** Standard 5-card Hold'em rankings; Ace low for Wheel (A-2-3-4-5)
- **Run:**

```bash
cd prototype
python -m quintet.simulate --compare -n 50000
```

## 2. Hand Frequency (Per Line)

Frequencies are identical for v1 and v2 (scoring differs only):

| Hand | Frequency |
|------|-----------|
| High card | 50.16% |
| One pair | 42.24% |
| Two pair | 4.74% |
| Three of a kind | 2.10% |
| Straight | 0.40% |
| Flush | 0.19% |
| Full house | 0.14% |
| Four of a kind | 0.03% |
| Straight flush | ~0% |
| Royal flush | ~0% |

**Interpretation:** Using 25 of 52 cards, each line’s 5 cards come from that subset—pairs and high cards dominate (~92% combined). Premium hands are rare but chase-worthy. Overlapping lines make “multiple strong lines” extremely difficult, matching intended strategic depth.

## 3. v1 Draft vs v2 Calibrated

| Metric | v1 draft | v2 calibrated |
|--------|----------|---------------|
| Mean game total | 152.38 | **123.54** |
| Game total stdev | 19.51 | 16.90 |
| 95th percentile | 187.50 | 154.33 |
| Max observed | 261.00 | 240.99 |
| Mean per line | 12.70 | **10.30** |

**v1 issues:**

- Totals too high; high-card lines still score 0–14, inflating the 12-line baseline
- One pair at `2 + pair rank` jumps too sharply to two pair / trips
- Flush `14 + sum×0.2` under-rewards relative to full house / quads risk

**v2 goals:**

- Mean **~11 per line** → **~132** per full board
- Tier bases roughly inverse to frequency
- Kicker terms use **small coefficients** for tie-breaks without shifting tier feel

## 4. v4 Scoring Formulas (Current Default)

Building on v3, v4 **lowers common-hand baselines and steepens premium tiers** so straights/flushes contribute more noticeably to game totals. ~20k trials: **~9.7** mean per line, **~117** per full board; games with ≥1 straight average **~168** (v3: ~162).

| Hand | Formula |
|------|---------|
| Royal flush | **200** |
| Straight flush | **165** + high rank × 0.1 |
| Four of a kind | **130** + quad rank × 0.5 + kicker × 0.1 |
| Full house | **98** + trips rank × 0.2 + pair rank × 0.1 |
| Flush | **78** + sum of ranks × 0.05 |
| Straight | **62** + high rank × 0.1 |
| Three of a kind | **24** + trips rank × 0.2 + kicker sum × 0.05 |
| Two pair | **16** + high pair × 0.1 + low pair × 0.1 + kicker × 0.05 |
| One pair | **9** + pair rank × 0.1 + kicker sum × 0.05 |
| High card | **4** + top rank × 0.1 + 2nd+3rd rank sum × 0.05 |

Implementation: `score_v4` / `SCORING_V4` (Python default); `scoreV4` / `scoreActive` in [`poc/src/engine/scoring.ts`](../poc/src/engine/scoring.ts).

### 4.1 v3 vs v4 Comparison (20,000 games)

| Metric | v3 | v4 |
|--------|-----|-----|
| Mean game total | 127.9 | **116.9** |
| Stdev | 18.7 | **24.0** |
| 95th percentile | 164.6 | **171.5** |
| Max observed | 252.9 | **332.9** |
| With ≥1 straight | 161.7 | **167.7** |
| With ≥1 premium | 166.6 | **179.3** |

**Interpretation:** v4 trims high-card/one-pair baseline (~−11 mean) but pays more per premium line—wider tail and higher ceiling, rewarding chase hands over stacking many weak pairs.

## 5. v3 Scoring Formulas (Historical)

Integer bases by rarity (§2); rank bonuses use **0.05 / 0.1 / 0.2 / 0.5** only. ~20k trials: **~10.7** mean per line, **~128** per full board.

| Hand | Formula |
|------|---------|
| Royal flush | **100** |
| Straight flush | **92** + high rank × 0.1 |
| Four of a kind | **78** + quad rank × 0.5 + kicker × 0.1 |
| Full house | **62** + trips rank × 0.2 + pair rank × 0.1 |
| Flush | **52** + sum of ranks × 0.05 |
| Straight | **45** + high rank × 0.1 |
| Three of a kind | **28** + trips rank × 0.2 + kicker sum × 0.05 |
| Two pair | **18** + high pair × 0.1 + low pair × 0.1 + kicker × 0.05 |
| One pair | **10** + pair rank × 0.1 + kicker sum × 0.05 |
| High card | **5** + top rank × 0.1 + 2nd+3rd rank sum × 0.05 |

Implementation: `score_v3` / `SCORING_V3`.

## 6. v2 Scoring Formulas (Historical)

| Hand | Formula |
|------|---------|
| Royal flush | **110** |
| Straight flush | **88** + high rank × 0.15 |
| Four of a kind | **68** + quad rank × 0.4 + kicker × 0.08 |
| Full house | **50** + trips rank × 0.25 + pair rank × 0.12 |
| Flush | **40** + sum of ranks × 0.04 |
| Straight | **34** + high rank × 0.15 |
| Three of a kind | **24** + trips rank × 0.2 + kicker sum × 0.04 |
| Two pair | **17** + high pair × 0.15 + low pair × 0.08 + kicker × 0.04 |
| One pair | **11** + pair rank × 0.12 + kicker sum × 0.03 |
| High card | **5** + top rank × 0.08 + 2nd+3rd rank sum × 0.015 |

## 7. Prototype Usage

### CLI

```bash
cd prototype
python -m quintet.cli
```

Supports: set k, choose v1/v2/v3/v4 scoring, `place <pool_index> <row> <col>`, `auto` for random legal moves.

### Programmatic API

```python
from quintet.game import SoloGame
from quintet.scoring import SCORING_V4

game = SoloGame(pool_size=2, scoring=SCORING_V4)
game.start()
# game.play(pool_index, row, col)
result = game.final_score()  # after 25 placements
```

## 8. Further Tuning

1. **Strategic simulation:** Greedy AI (500 trials, k=2): solo mean **162.6** vs random **123.6**; confirms skill expression headroom
2. **k variants:** Lower baseline for k=1; keep v2 for k=4 ranked play
3. **Two-player:** Greedy vs random win rate ~97% at k=2 — shared Pool denial adds advantage; playtest human vs human
4. **Tie-break:** Implemented in `two_player.resolve_match` — combined total → best single game → premium line count → draw

## 9. Phase 3 Prototype (Python CLI)

- **Local two-player:** `cd prototype && python -m quintet.cli --mode versus`
- **Match (2 games):** `cd prototype && python -m quintet.cli --mode match`
- **Greedy bot:** `ai` command in versus/match; `cd prototype && python -m quintet.simulate --greedy`
- **All code/comments/logs:** English only

## 10. Phase 4 — Browser PoC (complete)

Playable solo web build in [`poc/`](../poc/):

| Feature | Notes |
|---------|-------|
| Drag-and-drop | dnd-kit; same adjacency rules as Python |
| v4 scoring | Total from complete lines; hover shows formed hand on partial lines |
| Undo | Up to 25 steps; `Ctrl+Z` |
| Themes / appearance | 5 card themes; light/dark mode |
| Scoring reference | Sidebar **Scoring rules (v4)** dialog |

```bash
cd poc && npm install && npm run dev
```

See [`poc/README.md`](../poc/README.md) and [`technical-design.en.md`](technical-design.en.md).

---

*v4 from 20,000-game Monte Carlo (`--compare`); report draft-2, PoC section poc-2.*
