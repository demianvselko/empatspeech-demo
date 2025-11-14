export type CardKind = "image" | "text";

export type CardDefinition = {
  id: string;
  label: string;
  pairId: string;
  kind: CardKind;
};

export type CardOnBoard = CardDefinition & {
  x: number;
  y: number;
  faceUp: boolean;
  matched: boolean;
};

export type Difficulty = "easy" | "medium" | "hard";

export type BoardConfig = {
  cols: number;
  rows: number;
  pairCount: number;
};

export const difficultyPresets: Record<Difficulty, BoardConfig> = {
  easy: { cols: 4, rows: 3, pairCount: 6 }, // 12 fichas
  medium: { cols: 6, rows: 4, pairCount: 12 }, // 24 fichas
  hard: { cols: 8, rows: 6, pairCount: 24 }, // 48 fichas
};

const basePairs: Array<{ word: string; icon: string }> = [
  { word: "Bike", icon: "🚲" },
  { word: "Cat", icon: "🐱" },
  { word: "Dog", icon: "🐶" },
  { word: "Sun", icon: "☀️" },
  { word: "Moon", icon: "🌙" },
  { word: "Car", icon: "🚗" },
  { word: "Book", icon: "📘" },
  { word: "Tree", icon: "🌳" },
  { word: "Ball", icon: "⚽" },
  { word: "Star", icon: "⭐" },
  { word: "Fish", icon: "🐟" },
  { word: "Plane", icon: "✈️" },
];

export function pickPairs(
  count: number,
): Array<{ word: string; icon: string }> {
  return basePairs.slice(0, count);
}

// --- PRNG determinístico basado en string (sessionId) ---

function hashStringToSeed(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0 || 1;
}

function mulberry32(a: number) {
  return () => {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffleDeterministic<T>(items: T[], seed: string): T[] {
  const out = [...items];
  const rng = mulberry32(hashStringToSeed(seed));
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
