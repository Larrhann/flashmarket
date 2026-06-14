"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle, Phone, Pin, MapPin, Calendar, Rocket } from "lucide-react";
import clsx from "clsx";
import { createClient } from "@/lib/supabase/client";
import type { Post } from "@/lib/database.types";

interface PostCardProps {
  post: Post & { quartier_nom?: string; auteur_nom?: string };
  liked: boolean;
  currentUserId: string | null;
}

const typeLabels: Record<string, string> = {
  flash: "🛍️ Flash Marché",
  event: "📅 Événement",
  formation: "🎓 Formation",
};

function formatPrix(prix: number | null) {
  if (prix == null) return null;
  return new Intl.NumberFormat("fr-FR").format(prix) + " FCFA";
}

function timeAgo(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days} j`;
}

export function PostCard({ post, liked: initialLiked, currentUserId }: PostCardProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [pending, setPending] = useState(false);

  async function handleLike() {
    if (!currentUserId) {
      router.push("/onboarding");
      return;
    }
    if (pending) return;
    setPending(true);

    // Optimistic update
    setLiked((prev) => !prev);
    setLikesCount((prev) => (liked ? prev - 1 : prev + 1));

    const supabase = createClient();
    const { error } = await supabase.rpc("toggle_like", { p_post_id: post.id });

    if (error) {
      // Rollback en cas d'erreur
      setLiked((prev) => !prev);
      setLikesCount((prev) => (liked ? prev + 1 : prev - 1));
    }
    setPending(false);
  }

  const whatsappLink = post.whatsapp_numero
    ? `https://wa.me/${post.whatsapp_numero.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
        `Bonjour, je suis intéressé(e) par votre publication "${post.titre}" sur FlashMarket.`
      )}`
    : null;

  const callLink = post.appel_numero ? `tel:${post.appel_numero}` : null;

  const isOwner = currentUserId && post.user_id === currentUserId;
  const isBoostActive =
    post.is_boosted && (!post.boost_expire_at || new Date(post.boost_expire_at) > new Date());

  return (
    <article className="rounded-3xl border border-border bg-card overflow-hidden">
      {post.photos?.[0] && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.photos[0]}
          alt={post.titre}
          className="h-48 w-full object-cover"
        />
      )}

      <div className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-primary">
            {typeLabels[post.type]}
          </span>
          <div className="flex items-center gap-2">
            {post.is_boosted && (
              <span className="flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent">
                <Pin size={12} /> Boosté
              </span>
            )}
            <span className="text-xs text-muted">{timeAgo(post.created_at)}</span>
          </div>
        </div>

        <h3 className="text-base font-bold leading-snug">{post.titre}</h3>

        {post.description && (
          <p className="mt-1 line-clamp-2 text-sm text-muted">{post.description}</p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
          {post.prix != null && (
            <span className="font-bold text-primary">{formatPrix(post.prix)}</span>
          )}
          {post.type !== "flash" && (
            <span className="flex items-center gap-1 text-muted">
              <Calendar size={14} />
              {new Date(post.created_at).toLocaleDateString("fr-FR")}
            </span>
          )}
          {post.quartier_nom && (
            <span className="flex items-center gap-1 text-muted">
              <MapPin size={14} />
              {post.quartier_nom}
            </span>
          )}
        </div>

        <div className="mt-4 space-y-2">
          <button
            onClick={handleLike}
            className={clsx(
              "flex items-center gap-1.5 rounded-2xl border border-border px-3 py-2 text-sm font-medium transition-colors",
              liked ? "border-primary text-primary" : "text-foreground"
            )}
          >
            <Heart size={18} fill={liked ? "currentColor" : "none"} />
            {likesCount}
          </button>

          {(whatsappLink || callLink) && (
            <div className="flex items-center gap-2">
              {whatsappLink && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-2xl bg-accent px-3 py-2 text-sm font-semibold text-accent-foreground"
                >
                  <MessageCircle size={18} className="shrink-0" />
                  <span className="truncate">WhatsApp</span>
                </a>
              )}

              {callLink && (
                <a
                  href={callLink}
                  className="flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-2xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
                >
                  <Phone size={18} className="shrink-0" />
                  <span className="truncate">Appeler</span>
                </a>
              )}
            </div>
          )}
        </div>

        {isOwner && !isBoostActive && (
          <Link
            href={`/create/boost?post=${post.id}`}
            className="mt-2 flex items-center justify-center gap-1.5 rounded-2xl border border-dashed border-accent/40 bg-accent/10 px-3 py-2 text-sm font-semibold text-accent"
          >
            <Rocket size={16} />
            Booster cette publication
          </Link>
        )}
      </div>
    </article>
  );
}
