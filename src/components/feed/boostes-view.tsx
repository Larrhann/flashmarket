"use client";

import { useMemo, useState } from "react";
import { Rocket } from "lucide-react";
import type { Post } from "@/lib/database.types";
import { PostCard } from "./post-card";
import { PostDetailModal } from "./post-detail-modal";

interface BoostesViewProps {
  posts: (Post & { quartier_nom?: string })[];
  currentUserId: string | null;
  likedPostIds: number[];
}

export function BoostesView({ posts, currentUserId, likedPostIds }: BoostesViewProps) {
  const [liked] = useState<Set<number>>(new Set(likedPostIds));
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

  const selectedPost = useMemo(
    () => posts.find((p) => p.id === selectedPostId) ?? null,
    [posts, selectedPostId]
  );

  return (
    <div className="px-4">
      <header className="pt-4">
        <h1 className="flex items-center gap-2 text-xl font-bold">
          <Rocket size={20} className="text-accent" />
          Publications Boostées
        </h1>
        <p className="text-sm text-muted">
          Les annonces et événements mis en avant en ce moment.
        </p>
      </header>

      <div className="mt-3 grid grid-cols-1 gap-4 pb-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {posts.length === 0 && (
          <p className="col-span-full py-12 text-center text-sm text-muted">
            Aucune publication boostée pour le moment.
          </p>
        )}
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            liked={liked.has(post.id)}
            currentUserId={currentUserId}
            onOpen={() => setSelectedPostId(post.id)}
          />
        ))}
      </div>

      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          liked={liked.has(selectedPost.id)}
          currentUserId={currentUserId}
          onClose={() => setSelectedPostId(null)}
        />
      )}
    </div>
  );
}
