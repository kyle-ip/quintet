"""Playing card model."""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum


class Suit(str, Enum):
    CLUBS = "c"
    DIAMONDS = "d"
    HEARTS = "h"
    SPADES = "s"

    def symbol(self) -> str:
        return {"c": "♣", "d": "♦", "h": "♥", "s": "♠"}[self.value]


class Rank(int, Enum):
    TWO = 2
    THREE = 3
    FOUR = 4
    FIVE = 5
    SIX = 6
    SEVEN = 7
    EIGHT = 8
    NINE = 9
    TEN = 10
    JACK = 11
    QUEEN = 12
    KING = 13
    ACE = 14

    def label(self) -> str:
        if self.value <= 10:
            return str(self.value)
        return {11: "J", 12: "Q", 13: "K", 14: "A"}[self.value]


@dataclass(frozen=True, slots=True)
class Card:
    rank: Rank
    suit: Suit

    def __str__(self) -> str:
        return f"{self.rank.label()}{self.suit.symbol()}"

    @classmethod
    def from_str(cls, text: str) -> Card:
        text = text.strip().upper()
        rank_map = {
            "2": Rank.TWO,
            "3": Rank.THREE,
            "4": Rank.FOUR,
            "5": Rank.FIVE,
            "6": Rank.SIX,
            "7": Rank.SEVEN,
            "8": Rank.EIGHT,
            "9": Rank.NINE,
            "10": Rank.TEN,
            "T": Rank.TEN,
            "J": Rank.JACK,
            "Q": Rank.QUEEN,
            "K": Rank.KING,
            "A": Rank.ACE,
        }
        suit_map = {
            "C": Suit.CLUBS,
            "D": Suit.DIAMONDS,
            "H": Suit.HEARTS,
            "S": Suit.SPADES,
            "♣": Suit.CLUBS,
            "♦": Suit.DIAMONDS,
            "♥": Suit.HEARTS,
            "♠": Suit.SPADES,
        }
        if len(text) == 3 and text[:2] == "10":
            rank_part, suit_part = text[:2], text[2]
        else:
            rank_part, suit_part = text[0], text[1]
        return cls(rank=rank_map[rank_part], suit=suit_map[suit_part])
