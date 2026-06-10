"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, Heart, Pin, Trash2, BadgeCheck, Settings as SettingsIcon } from "lucide-react";
import clsx from "clsx";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import type { Post, Profile, Database } from "@/lib/database.types";

type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];

interface ProfileViewProps {
  profile: Profile;
  posts: Post[];
  subscriptions: Subscription[];
  quartierNom: string;
  villeNom: string;
}

const typeLabels: Record<string, string> = {
  flash: "🛍️ Flash",
  event: "📅 Événement",
  formation: "🎓 Formation",
};

export function ProfileView({
  profile,
  posts: initialPosts,
  subscriptions,
  quartierNom,
  villeNom,
}: ProfileViewProps) {
  const [posts, setPosts] = useState(initialPosts);

  const totalVues = posts.reduce((sum, p) => sum + p.vues_count, 0);
  const totalLikes = posts.reduce((sum, p) => sum + p.likes_count, 0);
  const actifs = posts.filter((p) => p.statut === "actif").length;

  const vipActif =
    profile.vip_alertes && (!profile.vip_expire_at || new Date(profile.vip_expire_at) > new Date());

  async function handleDelete(postId: number) {
    if (!confirm("Supprimer cette publication ?")) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("posts")
      .update({ statut: "supprime" })
      .eq("id", postId);
    if (!error) {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    }
  }

  return (
    <main className="px-4 py-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">
              {profile.prenom} {profile.nom}
            </h1>
            {profile.is_pro && (
              <BadgeCheck size={20} className="text-accent" />
            )}
          </div>
          <p className="text-sm text-muted">
            {quartierNom}, {villeNom}
          </p>
          {!profile.telephone_masque && (
            <p className="text-sm text-muted">{profile.telephone}</p>
          )}
        </div>
        <Link
          href="/settings"
          className="rounded-full border border-border p-2 text-foreground"
        >
          <SettingsIcon size={20} />
        </Link>
      </div>

      {/* Badges abonnements */}
      <div className="mb-4 flex flex-wrap gap-2">
        {profile.is_pro && (
          <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">
            Compte Pro certifié
          </span>
        )}
        {vipActif && (
          <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
            Alertes VIP actives
          </span>
        )}
        {!profile.is_pro && !vipActif && (
          <Link
            href="/settings"
            className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted"
          >
            Découvrir les abonnements →
          </Link>
        )}
      </div>

      {/* Statistiques */}
      <div className="mb-6 grid grid-cols-3 gap-2">
        <Stat label="Annonces actives" value={actifs} />
        <Stat label="Vues totales" value={totalVues} icon={<Eye size={14} />} />
        <Stat label="Likes totaux" value={totalLikes} icon={<Heart size={14} />} />
      </div>

      <h2 className="mb-2 text-base font-bold">Mes publications</h2>
      <div className="space-y-3">
        {posts.length === 0 && (
          <p className="py-8 text-center text-sm text-muted">
            Tu n&apos;as encore rien publié.
          </p>
        )}
        {posts.map((post) => (
          <div
            key={post.id}
            className="rounded-2xl border border-border bg-card p-3"
          >
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-semibold text-primary">
                {typeLabels[post.type]}
              </span>
              <span
                className={clsx(
                  "text-xs font-medium",
                  post.statut === "actif" ? "text-accent" : "text-muted"
                )}
              >
                {post.statut === "actif" ? "Actif" : "Expiré"}
              </span>
            </div>
            <h3 className="font-semibold">{post.titre}</h3>
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-3 text-sm text-muted">
                <span className="flex items-center gap-1">
                  <Eye size={14} /> {post.vues_count}
                </span>
                <span className="flex items-center gap-1">
                  <Heart size={14} /> {post.likes_count}
                </span>
                {post.is_boosted && (
                  <span className="flex items-center gap-1 text-accent">
                    <Pin size={14} /> Boosté
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {post.statut === "actif" && !post.is_boosted && (
                  <Link href={`/create/boost?post=${post.id}`}>
                    <Button variant="secondary" className="!w-auto px-3 py-1.5 text-xs">
                      Booster
                    </Button>
                  </Link>
                )}
                <button
                  onClick={() => handleDelete(post.id)}
                  className="rounded-lg border border-border p-1.5 text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {subscriptions.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-2 text-base font-bold">Abonnements</h2>
          <div className="space-y-2">
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center justify-between rounded-xl border border-border bg-card p-3 text-sm"
              >
                <span className="font-medium">
                  {sub.type === "pro" ? "Compte Pro" : "Alertes VIP"}
                </span>
                <span className="text-muted">
                  jusqu&apos;au {new Date(sub.date_fin).toLocaleDateString("fr-FR")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 text-center">
      <div className="flex items-center justify-center gap-1 text-lg font-bold">
        {icon}
        {value}
      </div>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
