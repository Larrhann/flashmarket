"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Post } from "@/lib/database.types";
import { FilterBar, type FeedFilter } from "./filter-bar";
import { PostCard } from "./post-card";

interface FeedViewProps {
  initialPosts: Post[];
  quartierId: number;
  quartierNom: string;
  currentUserId: string | null;
  likedPostIds: number[];
}

export function FeedView({
  initialPosts,
  quartierId,
  quartierNom,
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

  const sortedFiltered = useMemo(() => {
    const filtered =
      filter === "tout" ? posts : posts.filter((p) => p.type === filter);

    return [...filtered].sort((a, b) => {
      const aBoosted = a.is_boosted && (!a.boost_expire_at || new Date(a.boost_expire_at) > new Date());
      const bBoosted = b.is_boosted && (!b.boost_expire_at || new Date(b.boost_expire_at) > new Date());
      if (aBoosted !== bBoosted) return aBoosted ? -1 : 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [posts, filter]);

  return (
    <div className="px-4">
      <header className="pt-4">
        <p className="text-xs text-muted">Ton fil local</p>
        <h1 className="text-xl font-bold">{quartierNom}</h1>
      </header>

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
