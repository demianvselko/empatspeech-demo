// apps/frontend/src/components/game/memoryCard.tsx
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Difficulty } from "@/shared/cards/types";

type Props = {
  label: string;
  imageUrl?: string;
  type: "image" | "word" | "image+word";
  difficulty: Difficulty;
  field: string;
};

const difficultyStyle: Record<Difficulty, string> = {
  easy: "bg-emerald-50 text-emerald-700 border-emerald-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  hard: "bg-rose-50 text-rose-700 border-rose-200",
};

const difficultyLabel: Record<Difficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

export function MemoryCard({
  label,
  imageUrl,
  type,
  difficulty,
  field,
}: Readonly<Props>) {
  const isWordOnly = type === "word" && !imageUrl;

  const baseCardClasses =
    "group relative flex h-56 w-44 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-900 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg";
  const variantClasses = isWordOnly ? "ring-1 ring-sky-200 bg-sky-50/80" : "";
  const textSizeClass = isWordOnly ? "text-lg md:text-xl" : "text-sm";

  return (
    <Card className={`${baseCardClasses} ${variantClasses}`}>
      <div className="flex items-center justify-between gap-2 px-2 pt-2 pb-1">
        <Badge
          variant="outline"
          className={`border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${difficultyStyle[difficulty]}`}
        >
          {difficultyLabel[difficulty]}
        </Badge>

        <Badge
          variant="outline"
          className="border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-600"
        >
          {field}
        </Badge>
      </div>

      <CardContent className="flex flex-1 flex-col items-center justify-center gap-2 px-3 pb-3 pt-1 text-center">
        {imageUrl && (
          <div className="relative h-24 w-24 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            <Image src={imageUrl} alt={label} fill className="object-contain" />
          </div>
        )}

        {(type === "word" || type === "image+word") && (
          <span
            className={`font-semibold tracking-wide text-slate-900 ${textSizeClass}`}
          >
            {label}
          </span>
        )}
      </CardContent>
    </Card>
  );
}
