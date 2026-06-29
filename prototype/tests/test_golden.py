"""Golden score fixtures — TS/Python parity for v4 scoring."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from quintet.card import Card
from quintet.grid import Grid
from quintet.hand import evaluate_five
from quintet.scoring import SCORING_V4, round_score, score_grid, score_line

FIXTURE_PATH = Path(__file__).resolve().parents[2] / "fixtures" / "golden-scores.json"


@pytest.fixture(scope="module")
def golden_data() -> dict:
    return json.loads(FIXTURE_PATH.read_text(encoding="utf-8"))


def test_fixture_version(golden_data: dict) -> None:
    assert golden_data["version"] == "v4"


@pytest.mark.parametrize(
    "case",
    json.loads(FIXTURE_PATH.read_text(encoding="utf-8"))["lines"],
    ids=lambda c: c["id"],
)
def test_line_golden(case: dict) -> None:
    if "cards" not in case:
        pytest.skip("grid-only case")
    cards = [Card.from_str(c) for c in case["cards"]]
    hand, points = score_line(cards, SCORING_V4)
    assert hand.name == case["hand"]
    assert round_score(points) == case["points"]
    assert round_score(SCORING_V4.score(evaluate_five(cards))) == case["points"]


def test_grid_seed_42_golden(golden_data: dict) -> None:
    case = next(c for c in golden_data["lines"] if c["id"] == "grid_seed_42")
    cells = [Card.from_str(c) for c in case["cells"]]
    grid = Grid()
    for i, card in enumerate(cells):
        grid.place(i // 5, i % 5, card)
    result = score_grid(grid, SCORING_V4)
    assert round(result["total"], 1) == case["grid_total"]
    assert [round(line["points"], 1) for line in result["lines"]] == case["line_totals"]
