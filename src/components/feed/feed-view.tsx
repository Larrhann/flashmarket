"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BadgeCheck, Pin } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Post } from "@/lib/database.types";
import { FilterBar, type FeedFilter } from "./filter-bar";
import { PostCard } from "./post-card";

interface FeedViewProps {
  initialPosts: Post[];
  quartierId: number;
  quartierNom: string;
  prenom?: string;
  isPro?: boolean;
  currentUserId: string | null;
  likedPostIds: number[];
}

function formatPrix(prix: number | null) {
  if (prix == null) return null;
  return new Intl.NumberFormat("fr-FR").format(prix) + " FCFA";
}

export function FeedView({
  initialPosts,
  quartierId,
  quartierNom,
  prenom,
  isPro,
  currentUserId,
  likedPostIds,
}: FeedViewProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [filter, setFilter] = useState<FeedFilter>("tout");
  const [liked] = useState<Set<number>>(new Set(likedPostIds));

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`posts-quartier-${quartierId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "posts",
          filter: `quartier_id=eq.${quartierId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newPost = payload.new as Post;
            if (newPost.statut !== "actif") return;
            setPosts((prev) => [newPost, ...prev.filter((p) => p.id !== newPost.id)]);
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as Post;
            setPosts((prev) => {
              if (updated.statut !== "actif") {
                return prev.filter((p) => p.id !== updated.id);
              }
              return prev.map((p) => (p.id === updated.id ? updated : p));
            });
          } else if (payload.eventType === "DELETE") {
            const oldPost = payload.old as Post;
            setPosts((prev) => prev.filter((p) => p.id !== oldPost.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [quartierId]);

  const isBoostActive = (p: Post) =>
    p.is_boosted && (!p.boost_expire_at || new Date(p.boost_expire_at) > new Date());

  const sortedFiltered = useMemo(() => {
    const filtered =
      filter === "tout" ? posts : posts.filter((p) => p.type === filter);

    return [...filtered].sort((a, b) => {
      const aBoosted = isBoostActive(a);
      const bBoosted = isBoostActive(b);
      if (aBoosted !== bBoosted) return aBoosted ? -1 : 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [posts, filter]);

  const featured = useMemo(() => posts.filter(isBoostActive).slice(0, 8), [posts]);

  const counts = useMemo(
    () => ({
      flash: posts.filter((p) => p.type === "flash").length,
      event: posts.filter((p) => p.type === "event").length,
      formation: posts.filter((p) => p.type === "formation").length,
    }),
    [posts]
  );

  const heureDuJour = new Date().getHours();
  const salutation = heureDuJour < 18 ? "Bonjour" : "Bonsoir";

  return (
    <div className="px-4">
      <header className="flex items-center justify-between pt-4">
        <div>
          <p className="text-sm text-muted">
            {salutation}{prenom ? `, ${prenom}` : ""} 👋
          </p>
          <h1 className="flex items-center gap-1.5 text-xl font-bold">
            {quartierNom}
            {isPro && (
              <BadgeCheck size={18} className="text-accent" aria-label="Compte Pro" />
            )}
          </h1>
        </div>
        <Link
          href="/create"
          className="rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          + Publier
        </Link>
      </header>

      {featured.length > 0 && (
        <div className="mt-3 -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
          {featured.map((post) => (
            <Link
              key={post.id}
              href={`/?post=${post.id}`}
              className="relative h-32 w-44 shrink-0 overflow-hidden rounded-3xl bg-card"
            >
              {post.photos?.[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.photos[0]}
                  alt={post.titre}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-primary/30 to-accent/30" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-accent/90 px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">
                <Pin size={10} /> Boosté
              </span>
              <div className="absolute bottom-2 left-2 right-2">
                <p className="line-clamp-1 text-sm font-bold text-white">{post.titre}</p>
                {post.prix != null && (
                  <p className="text-xs font-semibold text-white/90">{formatPrix(post.prix)}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-3 grid grid-cols-3 gap-2">
        <button
          onClick={() => setFilter("flash")}
          className="rounded-2xl border border-border bg-card p-3 text-left"
        >
          <p className="text-lg font-bold text-primary">{counts.flash}</p>
          <p className="text-xs text-muted">🛍️ Flash Marché</p>
        </button>
        <button
          onClick={() => setFilter("event")}
          className="rounded-2xl border border-border bg-card p-3 text-left"
        >
          <p className="text-lg font-bold text-primary">{counts.event}</p>
          <p className="text-xs text-muted">📅 Événements</p>
        </button>
        <button
          onClick={() => setFilter("formation")}
          className="rounded-2xl border border-border bg-card p-3 text-left"
        >
          <p className="text-lg font-bold text-primary">{counts.formation}</p>
          <p className="text-xs text-muted">🎓 Formations</p>
        </button>
      </div>

      <FilterBar active={filter} onChange={setFilter} />

      <div className="space-y-4 pb-6">
        {sortedFiltered.length === 0 && (
          <p className="py-12 text-center text-sm text-muted">
            Aucune publication pour le moment dans ce quartier.
          </p>
        )}
        {sortedFiltered.map((post) => (
          <PostCard
            key={post.id}
            post={{ ...post, quartier_nom: quartierNom }}
            liked={liked.has(post.id)}
            currentUserId={currentUserId}
          />
        ))}
      </div>
    </div>
  );
}
