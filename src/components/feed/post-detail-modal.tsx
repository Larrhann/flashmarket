"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageCircle,
  Phone,
  Pin,
  MapPin,
  Calendar,
} from "lucide-react";
import clsx from "clsx";
import { createClient } from "@/lib/supabase/client";
import type { Post } from "@/lib/database.types";

interface PostDetailModalProps {
  post: Post & { quartier_nom?: string };
  liked: boolean;
  currentUserId: string | null;
  onClose: () => void;
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

export function PostDetailModal({ post, liked: initialLiked, currentUserId, onClose }: PostDetailModalProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [pending, setPending] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  const photos = post.photos ?? [];

  async function handleLike() {
    if (!currentUserId) {
      router.push("/onboarding");
      return;
    }
    if (pending) return;
    setPending(true);

    setLiked((prev) => !prev);
    setLikesCount((prev) => (liked ? prev - 1 : prev + 1));

    const supabase = createClient();
    const { error } = await supabase.rpc("toggle_like", { p_post_id: post.id });

    if (error) {
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

  const isBoostActive =
    post.is_boosted && (!post.boost_expire_at || new Date(post.boost_expire_at) > new Date());

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm md:items-center md:p-6"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-card md:max-w-2xl md:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          {photos.length > 0 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photos[photoIndex]}
              alt={post.titre}
              className="h-64 w-full object-cover md:h-80"
            />
          ) : (
            <div className="h-64 w-full bg-gradient-to-br from-primary/20 to-accent/20 md:h-80" />
          )}

          <button
            onClick={onClose}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white"
            aria-label="Fermer"
          >
            <X size={20} />
          </button>

          {photos.length > 1 && (
            <>
              <button
                onClick={() => setPhotoIndex((i) => (i - 1 + photos.length) % photos.length)}
                className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white"
                aria-label="Photo précédente"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setPhotoIndex((i) => (i + 1) % photos.length)}
                className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white"
                aria-label="Photo suivante"
              >
                <ChevronRight size={20} />
              </button>
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                {photos.map((_, i) => (
                  <span
                    key={i}
                    className={clsx(
                      "h-1.5 w-1.5 rounded-full",
                      i === photoIndex ? "bg-white" : "bg-white/40"
                    )}
                  />
                ))}
              </div>
            </>
          )}

          {isBoostActive && (
            <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-accent px-2 py-1 text-xs font-semibold text-accent-foreground shadow-sm">
              <Pin size={12} /> Boosté
            </span>
          )}
        </div>

        <div className="p-5">
          <span className="text-xs font-semibold text-primary">{typeLabels[post.type]}</span>

          <h2 className="mt-1 text-xl font-bold leading-snug">{post.titre}</h2>

          {post.prix != null && (
            <p className="mt-2 text-2xl font-bold text-primary">{formatPrix(post.prix)}</p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted">
            {post.quartier_nom && (
              <span className="flex items-center gap-1">
                <MapPin size={16} />
                {post.quartier_nom}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar size={16} />
              {new Date(post.created_at).toLocaleDateString("fr-FR")}
            </span>
          </div>

          {post.description && (
            <p className="mt-4 whitespace-pre-line text-sm text-foreground">{post.description}</p>
          )}

          <div className="mt-5 space-y-2">
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
                    className="flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-2xl bg-accent px-3 py-2.5 text-sm font-semibold text-accent-foreground"
                  >
                    <MessageCircle size={18} className="shrink-0" />
                    <span className="truncate">WhatsApp</span>
                  </a>
                )}

                {callLink && (
                  <a
                    href={callLink}
                    className="flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-2xl bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground"
                  >
                    <Phone size={18} className="shrink-0" />
                    <span className="truncate">Appeler</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
