import { ANIMALS_DECK_ES } from "@/shared/cards/animalsDeck";
import { MemoryCard } from "./memoryCard";

export function CardGrid() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
      {ANIMALS_DECK_ES.map((card) => (
        <MemoryCard
          key={card.id}
          label={card.label}
          imageUrl={card.imageUrl}
          type={card.type}
          difficulty={card.difficulty}
          field={card.field}
        />
      ))}
    </div>
  );
}
