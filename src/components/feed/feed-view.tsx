"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BadgeCheck, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Post, Quartier, Ville } from "@/lib/database.types";
import { FilterBar, type FeedFilter } from "./filter-bar";
import { FeedSidebar } from "./feed-sidebar";
import { PostCard } from "./post-card";
import { HeroSlider } from "./hero-slider";
import { PostDetailModal } from "./post-detail-modal";

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
  const [search, setSearch] = useState("");
  const [liked] = useState<Set<number>>(new Set(likedPostIds));

  const searchParams = useSearchParams();
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

  useEffect(() => {
    const postParam = searchParams.get("post");
    if (postParam) setSelectedPostId(Number(postParam));
  }, [searchParams]);

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
    let filtered =
      filter === "tout" ? hubFiltered : hubFiltered.filter((p) => p.type === filter);

    const query = search.trim().toLowerCase();
    if (query) {
      filtered = filtered.filter(
        (p) =>
          p.titre.toLowerCase().includes(query) ||
          (p.description ?? "").toLowerCase().includes(query)
      );
    }

    return [...filtered].sort((a, b) => {
      const aBoosted = isBoostActive(a);
      const bBoosted = isBoostActive(b);
      if (aBoosted !== bBoosted) return aBoosted ? -1 : 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [hubFiltered, filter, search]);

  const heroPosts = useMemo(() => {
    const boosted = hubFiltered.filter(isBoostActive);
    if (boosted.length > 0) return boosted.slice(0, 8);

    const withPhotos = hubFiltered.filter((p) => p.photos && p.photos.length > 0);
    const shuffled = [...withPhotos].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 6);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hubFiltered]);

  const counts = useMemo(
    () => ({
      flash: hubFiltered.filter((p) => p.type === "flash").length,
      event: hubFiltered.filter((p) => p.type === "event").length,
      formation: hubFiltered.filter((p) => p.type === "formation").length,
      total: hubFiltered.length,
    }),
    [hubFiltered]
  );

  const heureDuJour = new Date().getHours();
  const salutation = heureDuJour < 18 ? "Bonjour" : "Bonsoir";

  const quartiersDeLaVille = useMemo(
    () => quartiers.filter((q) => String(q.ville_id) === hubVilleId),
    [quartiers, hubVilleId]
  );

  const selectedPost = useMemo(
    () => posts.find((p) => p.id === selectedPostId) ?? null,
    [posts, selectedPostId]
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

      <div className="relative mt-3">
        <Search
          size={18}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
        />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher une publication..."
          className="w-full rounded-2xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground outline-none focus:border-primary md:max-w-md"
        />
      </div>

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

      {heroPosts.length > 0 && (
        <HeroSlider posts={heroPosts} onSelect={(post) => setSelectedPostId(post.id)} />
      )}

      <div className="mt-3 grid grid-cols-3 gap-2 md:hidden">
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

      <div className="md:hidden">
        <FilterBar active={filter} onChange={setFilter} />
      </div>

      <div className="mt-3 pb-6 md:flex md:gap-6">
        <aside className="hidden md:block md:w-64 shrink-0">
          <FeedSidebar active={filter} onChange={setFilter} counts={counts} />
        </aside>

        <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:self-start">
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
              onOpen={() => setSelectedPostId(post.id)}
            />
          ))}
        </div>
      </div>

      {selectedPost && (
        <PostDetailModal
          post={{
            ...selectedPost,
            quartier_nom:
              quartierNom ??
              (selectedPost as Post & { quartier_nom?: string }).quartier_nom,
          }}
          liked={liked.has(selectedPost.id)}
          currentUserId={currentUserId}
          onClose={() => setSelectedPostId(null)}
        />
      )}
    </div>
  );
}
