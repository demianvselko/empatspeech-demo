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
  easy: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
  medium: "bg-amber-500/15 text-amber-300 border-amber-500/40",
  hard: "bg-rose-500/15 text-rose-300 border-rose-500/40",
};

export function MemoryCard({
  label,
  imageUrl,
  type,
  difficulty,
  field,
}: Readonly<Props>) {
  const isWordOnly = type === "word" && !imageUrl;

  return (
    <Card
      className={[
        "group relative flex h-52 w-40 flex-col overflow-hidden border bg-slate-800/80 text-slate-50 shadow-md transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl",
        isWordOnly ? "border-sky-500/60 bg-sky-950/70" : "border-slate-700",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-2 p-2 pb-1">
        <Badge
          variant="outline"
          className={`border px-2 py-0.5 text-[10px] uppercase tracking-wide ${difficultyStyle[difficulty]}`}
        >
          {difficulty}
        </Badge>
        <Badge
          variant="outline"
          className="border-slate-600 bg-slate-900/40 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-300"
        >
          {field}
        </Badge>
      </div>

      <CardContent className="flex flex-1 flex-col items-center justify-center gap-2 px-2 pb-3 pt-0 text-center">
        {imageUrl && (
          <div className="relative h-20 w-20 overflow-hidden rounded-xl border border-slate-700 bg-slate-900/60">
            <Image src={imageUrl} alt={label} fill className="object-contain" />
          </div>
        )}

        {(type === "word" || type === "image+word") && (
          <span
            className={[
              "font-semibold tracking-wide",
              isWordOnly ? "text-lg md:text-xl" : "text-sm",
            ].join(" ")}
          >
            {label}
          </span>
        )}
      </CardContent>
    </Card>
  );
}
