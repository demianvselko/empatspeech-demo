export type CardType = "image" | "word";

export type Difficulty = "easy" | "medium" | "hard";

export type SemanticField =
  | "animals"
  | "food"
  | "objects"
  | "actions"
  | "countries"
  | "school";

export type GameCard = {
  id: string;
  pairKey: string;
  type: CardType;
  label: string;
  imageUrl?: string;
  audioUrl?: string;
  difficulty: Difficulty;
  field: SemanticField;
};
