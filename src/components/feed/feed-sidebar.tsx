"use client";

import clsx from "clsx";
import { LayoutGrid, ShoppingBag, CalendarDays, GraduationCap } from "lucide-react";
import type { FeedFilter } from "./filter-bar";

const categories: { value: FeedFilter; label: string; icon: typeof LayoutGrid }[] = [
  { value: "tout", label: "Tout", icon: LayoutGrid },
  { value: "flash", label: "Flash Marché", icon: ShoppingBag },
  { value: "event", label: "Événements & Sorties", icon: CalendarDays },
  { value: "formation", label: "Formations & Services", icon: GraduationCap },
];

interface FeedSidebarProps {
  active: FeedFilter;
  onChange: (f: FeedFilter) => void;
  counts: { flash: number; event: number; formation: number; total: number };
}

export function FeedSidebar({ active, onChange, counts }: FeedSidebarProps) {
  const countFor: Record<FeedFilter, number> = {
    tout: counts.total,
    flash: counts.flash,
    event: counts.event,
    formation: counts.formation,
  };

  return (
    <nav className="sticky top-20 rounded-2xl border border-border bg-card p-3">
      <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-muted">
        Catégories
      </p>
      <ul className="space-y-1">
        {categories.map(({ value, label, icon: Icon }) => (
          <li key={value}>
            <button
              onClick={() => onChange(value)}
              className={clsx(
                "flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                active === value
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-background"
              )}
            >
              <span className="flex items-center gap-2">
                <Icon size={18} />
                {label}
              </span>
              <span
                className={clsx(
                  "rounded-full px-2 py-0.5 text-xs font-semibold",
                  active === value
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-background text-muted"
                )}
              >
                {countFor[value]}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
