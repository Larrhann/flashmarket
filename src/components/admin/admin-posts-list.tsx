"use client";

import { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";

interface AdminPost {
  id: number;
  titre: string;
  type: string;
  prix: number | null;
  statut: string;
  created_at: string;
  user_id: string;
  auteur: string;
  quartier: string;
}

const typeLabels: Record<string, string> = {
  flash: "Flash",
  event: "Événement",
  formation: "Formation",
};

export function AdminPostsList({ posts: initial }: { posts: AdminPost[] }) {
  const [posts, setPosts] = useState(initial);
  const [warnTarget, setWarnTarget] = useState<AdminPost | null>(null);
  const [warnMessage, setWarnMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function handleDelete(id: number) {
    if (!confirm("Supprimer cette publication ?")) return;
    await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  async function handleWarn() {
    if (!warnTarget || !warnMessage.trim()) return;
    setSending(true);
    await fetch("/api/admin/warn", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: warnTarget.user_id,
        titre: "Avertissement FlashMarket",
        message: warnMessage.trim(),
      }),
    });
    setSending(false);
    setWarnTarget(null);
    setWarnMessage("");
  }

  return (
    <div>
      {warnTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-3xl bg-card p-6">
            <h2 className="mb-1 text-base font-bold">Avertissement</h2>
            <p className="mb-3 text-sm text-muted">Pour : {warnTarget.auteur}</p>
            <textarea
              className="w-full rounded-2xl border border-border bg-background p-3 text-sm"
              rows={4}
              placeholder="Message à envoyer à l'utilisateur..."
              value={warnMessage}
              onChange={(e) => setWarnMessage(e.target.value)}
            />
            <div className="mt-3 flex gap-2">
              <button
                onClick={handleWarn}
                disabled={sending || !warnMessage.trim()}
                className="flex-1 rounded-2xl bg-primary py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                {sending ? "Envoi..." : "Envoyer"}
              </button>
              <button
                onClick={() => { setWarnTarget(null); setWarnMessage(""); }}
                className="flex-1 rounded-2xl border border-border py-2 text-sm font-semibold"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {posts.length === 0 && (
          <p className="py-8 text-center text-sm text-muted">Aucune publication.</p>
        )}
        {posts.map((post) => (
          <div key={post.id} className="rounded-2xl border border-border bg-card p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{post.titre}</p>
                <p className="text-xs text-muted">
                  {typeLabels[post.type]} · {post.auteur} · {post.quartier}
                  {post.prix != null && ` · ${new Intl.NumberFormat("fr-FR").format(post.prix)} FCFA`}
                </p>
                <p className="text-xs text-muted">
                  {new Date(post.created_at).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  onClick={() => setWarnTarget(post)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-yellow-500"
                  title="Avertir l'auteur"
                >
                  <AlertTriangle size={15} />
                </button>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-red-500"
                  title="Supprimer"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
