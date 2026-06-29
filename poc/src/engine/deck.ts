import type { Card } from "./card";
import { standardDeck } from "./card";

export class Deck {
  cards: Card[];

  constructor(cards: Card[] = standardDeck()) {
    this.cards = [...cards];
  }

  shuffle(rng: () => number = Math.random): void {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  draw(n = 1): Card[] {
    if (n > this.cards.length) {
      throw new Error(`Cannot draw ${n} cards; only ${this.cards.length} remain`);
    }
    const drawn = this.cards.slice(0, n);
    this.cards = this.cards.slice(n);
    return drawn;
  }

  get remaining(): number {
    return this.cards.length;
  }
}
