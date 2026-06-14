"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Pin } from "lucide-react";
import clsx from "clsx";
import type { Post } from "@/lib/database.types";

interface HeroSliderProps {
  posts: Post[];
  onSelect: (post: Post) => void;
}

function formatPrix(prix: number | null) {
  if (prix == null) return null;
  return new Intl.NumberFormat("fr-FR").format(prix) + " FCFA";
}

const typeLabels: Record<string, string> = {
  flash: "🛍️ Flash Marché",
  event: "📅 Événement",
  formation: "🎓 Formation",
};

export function HeroSlider({ posts, onSelect }: HeroSliderProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (posts.length < 2) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % posts.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [posts.length]);

  useEffect(() => {
    if (index >= posts.length) setIndex(0);
  }, [posts.length, index]);

  if (posts.length === 0) return null;

  const post = posts[index];

  return (
    <div className="relative mt-3 h-44 w-full overflow-hidden rounded-3xl md:h-64">
      <button
        onClick={() => onSelect(post)}
        className="absolute inset-0 h-full w-full text-left"
      >
        {post.photos?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.photos[0]}
            alt={post.titre}
            className="h-full w-full object-cover transition-opacity duration-500"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary/40 to-accent/40" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span className="rounded-full bg-card/90 px-3 py-1 text-xs font-semibold text-primary">
            {typeLabels[post.type]}
          </span>
          {post.is_boosted && (
            <span className="flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
              <Pin size={12} /> Sponsorisé
            </span>
          )}
        </div>

        <div className="absolute bottom-4 left-4 right-16">
          <p className="line-clamp-1 text-lg font-bold text-white md:text-2xl">{post.titre}</p>
          {post.prix != null && (
            <p className="mt-1 text-sm font-semibold text-white/90 md:text-base">
              {formatPrix(post.prix)}
            </p>
          )}
        </div>
      </button>

      {posts.length > 1 && (
        <>
          <button
            onClick={() => setIndex((i) => (i - 1 + posts.length) % posts.length)}
            className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white"
            aria-label="Précédent"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => setIndex((i) => (i + 1) % posts.length)}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white"
            aria-label="Suivant"
          >
            <ChevronRight size={18} />
          </button>
          <div className="absolute bottom-3 right-4 flex gap-1.5">
            {posts.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={clsx(
                  "h-1.5 w-5 rounded-full transition-colors",
                  i === index ? "bg-white" : "bg-white/40"
                )}
                aria-label={`Aller à la diapositive ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
