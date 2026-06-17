"use client";

import { useState } from "react";
import { CheckCircle, Edit2, Trash2, AlertTriangle } from "lucide-react";

interface SuspiciousPost {
  id: number;
  titre: string;
  type: string;
  prix: number | null;
  description: string | null;
  created_at: string;
  user_id: string;
  auteur: string;
  quartier: string;
}

export function AdminModerationList({ posts: initial }: { posts: SuspiciousPost[] }) {
  const [posts, setPosts] = useState(initial);
  const [editTarget, setEditTarget] = useState<SuspiciousPost | null>(null);
  const [newPrice, setNewPrice] = useState("");
  const [warnTarget, setWarnTarget] = useState<SuspiciousPost | null>(null);
  const [warnMsg, setWarnMsg] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleApprove(id: number) {
    await fetch(`/api/admin/posts/${id}/approve`, { method: "POST" });
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  async function handleDelete(id: number) {
    if (!confirm("Supprimer cette publication ?")) return;
    await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  async function handleEditPrice() {
    if (!editTarget) return;
    setSaving(true);
    await fetch(`/api/admin/posts/${editTarget.id}/price`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prix: Number(newPrice) }),
    });
    setPosts((prev) => prev.map((p) => p.id === editTarget.id ? { ...p, prix: Number(newPrice) } : p));
    setSaving(false);
    setEditTarget(null);
    setNewPrice("");
  }

  async function handleWarn() {
    if (!warnTarget || !warnMsg.trim()) return;
    setSaving(true);
    await fetch("/api/admin/warn", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: warnTarget.user_id, titre: "Avertissement — Prix manquant", message: warnMsg.trim() }),
    });
    setSaving(false);
    setWarnTarget(null);
    setWarnMsg("");
  }

  return (
    <div>
      {/* Edit price modal */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-card p-6">
            <h2 className="mb-3 text-base font-bold">Modifier le prix</h2>
            <p className="mb-3 text-sm text-muted truncate">{editTarget.titre}</p>
            <input
              type="number"
              className="w-full rounded-2xl border border-border bg-background p-3 text-sm"
              placeholder="Nouveau prix en FCFA"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
            />
            <div className="mt-3 flex gap-2">
              <button onClick={handleEditPrice} disabled={saving || !newPrice}
                className="flex-1 rounded-2xl bg-primary py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">
                {saving ? "Sauvegarde..." : "Valider"}
              </button>
              <button onClick={() => { setEditTarget(null); setNewPrice(""); }}
                className="flex-1 rounded-2xl border border-border py-2 text-sm font-semibold">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Warn modal */}
      {warnTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-card p-6">
            <h2 className="mb-1 text-base font-bold">Avertir l&apos;utilisateur</h2>
            <p className="mb-3 text-sm text-muted">{warnTarget.auteur}</p>
            <textarea rows={4} className="w-full rounded-2xl border border-border bg-background p-3 text-sm"
              placeholder="Message d'avertissement..."
              value={warnMsg} onChange={(e) => setWarnMsg(e.target.value)} />
            <div className="mt-3 flex gap-2">
              <button onClick={handleWarn} disabled={saving || !warnMsg.trim()}
                className="flex-1 rounded-2xl bg-yellow-500 py-2 text-sm font-semibold text-white disabled:opacity-50">
                {saving ? "Envoi..." : "Envoyer"}
              </button>
              <button onClick={() => { setWarnTarget(null); setWarnMsg(""); }}
                className="flex-1 rounded-2xl border border-border py-2 text-sm font-semibold">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {posts.length === 0 && (
        <div className="flex flex-col items-center py-12 text-center">
          <CheckCircle size={40} className="mb-3 text-green-500" />
          <p className="font-semibold">Aucune publication suspecte</p>
          <p className="text-sm text-muted">Tout est en ordre.</p>
        </div>
      )}

      <div className="space-y-3">
        {posts.map((post) => (
          <div key={post.id} className="rounded-2xl border border-yellow-500/30 bg-yellow-500/5 p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} className="shrink-0 text-yellow-500" />
                  <p className="truncate text-sm font-semibold">{post.titre}</p>
                </div>
                <p className="mt-0.5 text-xs text-muted">
                  {post.auteur} · {post.quartier} · {new Date(post.created_at).toLocaleDateString("fr-FR")}
                </p>
                <p className="mt-1 text-xs font-bold text-yellow-600">
                  Prix affiché : {post.prix != null ? `${new Intl.NumberFormat("fr-FR").format(post.prix)} FCFA` : "non renseigné"}
                </p>
                {post.description && (
                  <p className="mt-1 line-clamp-2 text-xs text-muted">{post.description}</p>
                )}
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={() => handleApprove(post.id)}
                className="flex items-center gap-1 rounded-xl bg-green-500/10 px-3 py-1.5 text-xs font-semibold text-green-600">
                <CheckCircle size={13} /> Approuver
              </button>
              <button onClick={() => { setEditTarget(post); setNewPrice(String(post.prix ?? "")); }}
                className="flex items-center gap-1 rounded-xl bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-600">
                <Edit2 size={13} /> Modifier prix
              </button>
              <button onClick={() => { setWarnTarget(post); setWarnMsg(`Ta publication "${post.titre}" a été signalée car le prix n'est pas renseigné. Merci de le corriger.`); }}
                className="flex items-center gap-1 rounded-xl bg-yellow-500/10 px-3 py-1.5 text-xs font-semibold text-yellow-600">
                <AlertTriangle size={13} /> Avertir
              </button>
              <button onClick={() => handleDelete(post.id)}
                className="flex items-center gap-1 rounded-xl bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-600">
                <Trash2 size={13} /> Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
