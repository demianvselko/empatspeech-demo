import { MemoryCard } from "./memoryCard";
import { getDeckByLabel } from "@/shared/cards/decks";

type CardGridProps = {
  seedLabel?: string;
};

export function CardGrid({ seedLabel }: Readonly<CardGridProps>) {
  const deckLabel = seedLabel && seedLabel.length > 0 ? seedLabel : "animals";
  const deck = getDeckByLabel(deckLabel);

  return (
    <div className="flex w-full justify-center overflow-x-auto">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-5">
        {deck.map((card) => (
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
    </div>
  );
}
