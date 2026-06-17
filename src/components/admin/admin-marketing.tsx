"use client";

import { useState } from "react";
import { Send, Users, Megaphone } from "lucide-react";

type Tab = "message" | "sms";

export function AdminMarketing({ vipCount, proCount }: { vipCount: number; proCount: number }) {
  const [tab, setTab] = useState<Tab>("message");
  const [target, setTarget] = useState<"all" | "vip" | "pro">("all");
  const [titre, setTitre] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSend() {
    if (!message.trim()) return;
    setSending(true);
    setDone(false);
    await fetch("/api/admin/broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: tab, target, titre: titre.trim() || "Message de FlashMarket", message: message.trim() }),
    });
    setSending(false);
    setDone(true);
    setTitre("");
    setMessage("");
  }

  const tabs: { key: Tab; label: string; icon: typeof Send }[] = [
    { key: "message", label: "Message in-app", icon: Megaphone },
    { key: "sms", label: "Blast SMS", icon: Users },
  ];

  return (
    <div>
      {/* Tabs */}
      <div className="mb-4 flex gap-2">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 rounded-2xl border px-3 py-2 text-sm font-medium transition-colors ${tab === key ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}>
            <Icon size={15} />{label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="mb-4 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-border bg-card p-3 text-center">
          <p className="text-xl font-bold">{vipCount + proCount}</p>
          <p className="text-xs text-muted">Total</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-3 text-center">
          <p className="text-xl font-bold text-purple-500">{vipCount}</p>
          <p className="text-xs text-muted">VIP</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-3 text-center">
          <p className="text-xl font-bold text-yellow-500">{proCount}</p>
          <p className="text-xs text-muted">Pro</p>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-3xl border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold">
          {tab === "message" ? "Envoyer une notification in-app" : "Envoyer un SMS"}
        </h2>

        <label className="mb-1 block text-xs text-muted">Destinataires</label>
        <select value={target} onChange={(e) => setTarget(e.target.value as typeof target)}
          className="mb-3 w-full rounded-2xl border border-border bg-background p-3 text-sm">
          <option value="all">Tous les abonnés ({vipCount + proCount})</option>
          <option value="vip">VIP uniquement ({vipCount})</option>
          <option value="pro">Pro uniquement ({proCount})</option>
        </select>

        <label className="mb-1 block text-xs text-muted">Titre</label>
        <input className="mb-3 w-full rounded-2xl border border-border bg-background p-3 text-sm"
          placeholder="Ex : Nouveau sur FlashMarket !" value={titre} onChange={(e) => setTitre(e.target.value)} />

        <label className="mb-1 block text-xs text-muted">Message</label>
        <textarea rows={4} className="mb-3 w-full rounded-2xl border border-border bg-background p-3 text-sm"
          placeholder="Votre message..." value={message} onChange={(e) => setMessage(e.target.value)} />

        {done && (
          <p className="mb-3 text-sm font-semibold text-green-500">Message envoyé avec succès !</p>
        )}

        <button onClick={handleSend} disabled={sending || !message.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50">
          <Send size={16} />
          {sending ? "Envoi en cours..." : "Envoyer"}
        </button>
      </div>
    </div>
  );
}
