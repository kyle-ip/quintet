import { describe, expect, it } from "vitest";
import fixture from "../../../fixtures/golden-scores.json";
import { parseCard } from "@/engine/card";
import { Grid } from "@/engine/grid";
import { evaluateFive } from "@/engine/hand";
import { roundScore, scoreGridComplete, scoreLine, scoreV4 } from "@/engine/scoring";

interface GoldenLineCase {
  id: string;
  cards?: string[];
  hand?: string;
  points?: number;
  cells?: string[];
  grid_total?: number;
  line_totals?: number[];
}

interface GoldenFixture {
  version: string;
  lines: GoldenLineCase[];
}

const golden: GoldenFixture = fixture;

describe("golden score parity (v4)", () => {
  it("fixture version is v4", () => {
    expect(fixture.version).toBe("v4");
  });

  for (const item of fixture.lines) {
    if (item.cards) {
      it(`${item.id} line score matches fixture`, () => {
        const cards = item.cards!.map(parseCard);
        const { hand, points } = scoreLine(cards);
        expect(hand.name).toBe(item.hand);
        expect(roundScore(points)).toBe(item.points);
        expect(roundScore(scoreV4(evaluateFive(cards)))).toBe(item.points);
      });
    }
  }

  it("grid_seed_42 total matches fixture", () => {
    const gridCase = fixture.lines.find((l) => l.id === "grid_seed_42");
    expect(gridCase?.cells).toHaveLength(25);
    const grid = Grid.fromCells(gridCase!.cells!.map(parseCard));
    const result = scoreGridComplete(grid);
    expect(result.total).toBe(gridCase!.grid_total);
    expect(result.lines.map((l) => l.points)).toEqual(gridCase!.line_totals);
  });
});
