"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BadgeCheck, Pin } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Post, Quartier, Ville } from "@/lib/database.types";
import { FilterBar, type FeedFilter } from "./filter-bar";
import { PostCard } from "./post-card";

const HUB_STORAGE_KEY = "flashmarket_public_hub";

interface FeedViewProps {
  initialPosts: (Post & { quartier_nom?: string })[];
  villes: Ville[];
  quartiers: Quartier[];
  quartierId?: number;
  quartierNom?: string;
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
  villes,
  quartiers,
  quartierId,
  quartierNom,
  prenom,
  isPro,
  currentUserId,
  likedPostIds,
}: FeedViewProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [filter, setFilter] = useState<FeedFilter>("tout");
  const [liked] = useState<Set<number>>(new Set(likedPostIds));

  // Sélection ville/quartier pour les visiteurs non connectés
  const [hubVilleId, setHubVilleId] = useState<string>("");
  const [hubQuartierId, setHubQuartierId] = useState<string>("");

  useEffect(() => {
    if (currentUserId) return;
    try {
      const raw = localStorage.getItem(HUB_STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { villeId?: string; quartierId?: string };
        setHubVilleId(saved.villeId ?? "");
        setHubQuartierId(saved.quartierId ?? "");
      }
    } catch {
      // ignore
    }
  }, [currentUserId]);

  function updateHub(villeId: string, quartierIdValue: string) {
    setHubVilleId(villeId);
    setHubQuartierId(quartierIdValue);
    try {
      localStorage.setItem(
        HUB_STORAGE_KEY,
        JSON.stringify({ villeId, quartierId: quartierIdValue })
      );
    } catch {
      // ignore
    }
  }

  // Abonnement temps réel : uniquement pour un fil rattaché à un quartier précis
  const realtimeQuartierId = currentUserId
    ? quartierId
    : hubQuartierId
      ? Number(hubQuartierId)
      : null;

  useEffect(() => {
    if (!realtimeQuartierId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`posts-quartier-${realtimeQuartierId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "posts",
          filter: `quartier_id=eq.${realtimeQuartierId}`,
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
              return prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p));
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
  }, [realtimeQuartierId]);

  const isBoostActive = (p: Post) =>
    p.is_boosted && (!p.boost_expire_at || new Date(p.boost_expire_at) > new Date());

  // Filtre ville/quartier (visiteurs non connectés uniquement)
  const hubFiltered = useMemo(() => {
    if (currentUserId) return posts;
    if (hubQuartierId) return posts.filter((p) => p.quartier_id === Number(hubQuartierId));
    if (hubVilleId) return posts.filter((p) => p.ville_id === Number(hubVilleId));
    return posts;
  }, [posts, currentUserId, hubVilleId, hubQuartierId]);

  const sortedFiltered = useMemo(() => {
    const filtered =
      filter === "tout" ? hubFiltered : hubFiltered.filter((p) => p.type === filter);

    return [...filtered].sort((a, b) => {
      const aBoosted = isBoostActive(a);
      const bBoosted = isBoostActive(b);
      if (aBoosted !== bBoosted) return aBoosted ? -1 : 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [hubFiltered, filter]);

  const featured = useMemo(() => hubFiltered.filter(isBoostActive).slice(0, 8), [hubFiltered]);

  const counts = useMemo(
    () => ({
      flash: hubFiltered.filter((p) => p.type === "flash").length,
      event: hubFiltered.filter((p) => p.type === "event").length,
      formation: hubFiltered.filter((p) => p.type === "formation").length,
    }),
    [hubFiltered]
  );

  const heureDuJour = new Date().getHours();
  const salutation = heureDuJour < 18 ? "Bonjour" : "Bonsoir";

  const quartiersDeLaVille = useMemo(
    () => quartiers.filter((q) => String(q.ville_id) === hubVilleId),
    [quartiers, hubVilleId]
  );

  return (
    <div className="px-4">
      <header className="flex items-center justify-between pt-4">
        {currentUserId ? (
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
        ) : (
          <div>
            <h1 className="text-xl font-bold text-primary">FlashMarket</h1>
            <p className="text-sm text-muted">Le fil local de Côte d&apos;Ivoire</p>
          </div>
        )}

        {currentUserId ? (
          <Link
            href="/create"
            className="rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            + Publier
          </Link>
        ) : (
          <Link
            href="/onboarding"
            className="rounded-2xl border border-primary px-4 py-2 text-sm font-semibold text-primary"
          >
            Connexion
          </Link>
        )}
      </header>

      {!currentUserId && (
        <div className="mt-3 grid grid-cols-2 gap-2 md:max-w-md">
          <select
            value={hubVilleId}
            onChange={(e) => updateHub(e.target.value, "")}
            className="w-full rounded-2xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
          >
            <option value="">Toutes les villes</option>
            {villes.map((v) => (
              <option key={v.id} value={v.id}>
                {v.nom}
              </option>
            ))}
          </select>
          <select
            value={hubQuartierId}
            onChange={(e) => updateHub(hubVilleId, e.target.value)}
            disabled={!hubVilleId}
            className="w-full rounded-2xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary disabled:opacity-50"
          >
            <option value="">Tous les quartiers</option>
            {quartiersDeLaVille.map((q) => (
              <option key={q.id} value={q.id}>
                {q.nom}
              </option>
            ))}
          </select>
        </div>
      )}

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

      <div className="grid grid-cols-1 gap-4 pb-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sortedFiltered.length === 0 && (
          <p className="col-span-full py-12 text-center text-sm text-muted">
            Aucune publication pour le moment dans cette zone.
          </p>
        )}
        {sortedFiltered.map((post) => (
          <PostCard
            key={post.id}
            post={{
              ...post,
              quartier_nom:
                quartierNom ??
                (post as Post & { quartier_nom?: string }).quartier_nom,
            }}
            liked={liked.has(post.id)}
            currentUserId={currentUserId}
          />
        ))}
      </div>
    </div>
  );
}
