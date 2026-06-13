"use client";

import clsx from "clsx";
import { Crown } from "lucide-react";

export type FeedFilter = "tout" | "flash" | "event" | "formation";

const filters: { value: FeedFilter; label: string; pro?: boolean }[] = [
  { value: "tout", label: "Tout" },
  { value: "flash", label: "🛍️ Flash Marché" },
  { value: "event", label: "📅 Événements & Sorties", pro: true },
  { value: "formation", label: "🎓 Formations & Services", pro: true },
];

export function FilterBar({
  active,
  onChange,
}: {
  active: FeedFilter;
  onChange: (f: FeedFilter) => void;
}) {
  return (
    <div className="sticky top-0 z-30 -mx-4 flex gap-2 overflow-x-auto bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      {filters.map((f) => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          className={clsx(
            "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
            active === f.value
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-foreground"
          )}
        >
          {f.label}
          {f.pro && <Crown size={12} className="inline-block translate-y-[-1px]" />}
        </button>
      ))}
    </div>
  );
}
