import type { GameCard } from "./types";
import { ANIMALS_DECK_ES } from "./animalsDeck";
import { COUNTRIES_DECK_ES } from "./countriesDeck";

export const DECKS = {
  animals: {
    id: 1,
    cards: ANIMALS_DECK_ES,
  },
  countries: {
    id: 2,
    cards: COUNTRIES_DECK_ES,
  },
} as const;

export type DeckKey = keyof typeof DECKS;

export type DeckConfig = {
  id: number;
  cards: GameCard[];
};

// Mapeos para seed <-> número (si querés, podrías usar esto también en el form)
export const SEED_LABEL_TO_ID = Object.fromEntries(
  Object.entries(DECKS).map(([label, cfg]) => [label, cfg.id]),
) as Record<DeckKey, number>;

export type SeedLabel = DeckKey;
export type SeedId = (typeof DECKS)[DeckKey]["id"];

export const SEED_ID_TO_LABEL = Object.fromEntries(
  Object.entries(DECKS).map(([label, cfg]) => [cfg.id, label]),
) as Record<SeedId, SeedLabel>;

// Deck por label (para Phaser)
export function getDeckByLabel(label: string | null | undefined): GameCard[] {
  if (!label) {
    return DECKS.animals.cards;
  }

  if (label in DECKS) {
    const key = label as DeckKey;
    return DECKS[key].cards;
  }

  return DECKS.animals.cards;
}
