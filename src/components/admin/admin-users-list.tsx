"use client";

import { useState } from "react";
import { AlertTriangle, BadgeCheck, Sparkles } from "lucide-react";

interface AdminUser {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  is_pro: boolean;
  vip_alertes: boolean;
  verification_statut: string;
  created_at: string;
}

export function AdminUsersList({ users: initial }: { users: AdminUser[] }) {
  const [users] = useState(initial);
  const [warnTarget, setWarnTarget] = useState<AdminUser | null>(null);
  const [warnMessage, setWarnMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function handleWarn() {
    if (!warnTarget || !warnMessage.trim()) return;
    setSending(true);
    await fetch("/api/admin/warn", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: warnTarget.id,
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
            <p className="mb-3 text-sm text-muted">
              Pour : {warnTarget.prenom} {warnTarget.nom}
            </p>
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
        {users.length === 0 && (
          <p className="py-8 text-center text-sm text-muted">Aucun utilisateur.</p>
        )}
        {users.map((u) => (
          <div key={u.id} className="rounded-2xl border border-border bg-card p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-sm font-semibold">
                    {u.prenom} {u.nom}
                  </p>
                  {u.is_pro && <Sparkles size={14} className="shrink-0 text-primary" />}
                  {u.vip_alertes && <BadgeCheck size={14} className="shrink-0 text-accent" />}
                  {u.verification_statut === "verifie" && (
                    <BadgeCheck size={14} className="shrink-0 text-green-500" />
                  )}
                </div>
                <p className="text-xs text-muted">{u.telephone}</p>
                <p className="text-xs text-muted">
                  Inscrit le {new Date(u.created_at).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <button
                onClick={() => setWarnTarget(u)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-yellow-500"
                title="Envoyer un avertissement"
              >
                <AlertTriangle size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
