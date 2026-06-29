"""5×5 grid with adjacency rules and scoring lines."""

from __future__ import annotations

from dataclasses import dataclass, field

from quintet.card import Card

SIZE = 5


def all_lines() -> list[tuple[str, list[tuple[int, int]]]]:
    lines: list[tuple[str, list[tuple[int, int]]]] = []
    for r in range(SIZE):
        lines.append((f"row_{r}", [(r, c) for c in range(SIZE)]))
    for c in range(SIZE):
        lines.append((f"col_{c}", [(r, c) for r in range(SIZE)]))
    lines.append(("diag_main", [(i, i) for i in range(SIZE)]))
    lines.append(("diag_anti", [(i, SIZE - 1 - i) for i in range(SIZE)]))
    return lines


LINES = all_lines()


@dataclass
class Grid:
    cells: list[Card | None] = field(default_factory=lambda: [None] * (SIZE * SIZE))

    def _idx(self, row: int, col: int) -> int:
        return row * SIZE + col

    def get(self, row: int, col: int) -> Card | None:
        return self.cells[self._idx(row, col)]

    def place(self, row: int, col: int, card: Card) -> None:
        if not (0 <= row < SIZE and 0 <= col < SIZE):
            raise ValueError("Out of bounds")
        if self.cells[self._idx(row, col)] is not None:
            raise ValueError("Cell occupied")
        if self.count() > 0 and not self._has_adjacent(row, col):
            raise ValueError("Must be adjacent to an existing card")
        self.cells[self._idx(row, col)] = card

    def _has_adjacent(self, row: int, col: int) -> bool:
        for dr, dc in (
            (-1, 0),
            (1, 0),
            (0, -1),
            (0, 1),
            (-1, -1),
            (-1, 1),
            (1, -1),
            (1, 1),
        ):
            nr, nc = row + dr, col + dc
            if 0 <= nr < SIZE and 0 <= nc < SIZE and self.get(nr, nc) is not None:
                return True
        return False

    def count(self) -> int:
        return sum(1 for c in self.cells if c is not None)

    def is_full(self) -> bool:
        return self.count() == SIZE * SIZE

    def legal_positions(self) -> list[tuple[int, int]]:
        if self.count() == 0:
            return [(r, c) for r in range(SIZE) for c in range(SIZE)]
        return [
            (r, c)
            for r in range(SIZE)
            for c in range(SIZE)
            if self.get(r, c) is None and self._has_adjacent(r, c)
        ]

    def line_cards(self, positions: list[tuple[int, int]]) -> list[Card]:
        cards = [self.get(r, c) for r, c in positions]
        if any(c is None for c in cards):
            raise ValueError("Line incomplete")
        return cards  # type: ignore[return-value]

    def render(self) -> str:
        rows: list[str] = []
        for r in range(SIZE):
            parts: list[str] = []
            for c in range(SIZE):
                card = self.get(r, c)
                parts.append(f"{card!s:>3}" if card else "  ·")
            rows.append(" ".join(parts))
        return "\n".join(rows)
