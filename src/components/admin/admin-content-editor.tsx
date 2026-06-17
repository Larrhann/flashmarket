"use client";

import { useState } from "react";
import { Save } from "lucide-react";

interface ContentEntry { key: string; value: string }

const LABELS: Record<string, string> = {
  pricing_flash_gratuit: "Flash gratuit",
  pricing_flash_payant: "Flash payant",
  pricing_boost_journalier: "Boost journalier",
  pricing_vip: "Abonnement VIP",
  pricing_pro: "Abonnement Pro",
  howto_intro: "Introduction \"Comment ça marche\"",
  howto_step1: "Étape 1",
  howto_step2: "Étape 2",
  howto_step3: "Étape 3",
};

export function AdminContentEditor({ entries: initial }: { entries: ContentEntry[] }) {
  const [entries, setEntries] = useState(initial);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  function update(key: string, value: string) {
    setEntries((prev) => prev.map((e) => e.key === key ? { ...e, value } : e));
  }

  async function save(key: string, value: string) {
    setSaving(key);
    await fetch("/api/admin/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
    setSaving(null);
    setSaved(key);
    setTimeout(() => setSaved(null), 2000);
  }

  const pricingKeys = Object.keys(LABELS).filter((k) => k.startsWith("pricing_"));
  const howtoKeys = Object.keys(LABELS).filter((k) => k.startsWith("howto_"));

  function renderSection(keys: string[], title: string) {
    const items = entries.filter((e) => keys.includes(e.key));
    return (
      <div className="mb-6">
        <h2 className="mb-3 text-sm font-bold">{title}</h2>
        <div className="space-y-3">
          {items.map(({ key, value }) => (
            <div key={key} className="rounded-2xl border border-border bg-card p-3">
              <label className="mb-1 block text-xs font-semibold text-muted">{LABELS[key] ?? key}</label>
              <textarea rows={key.startsWith("howto") ? 4 : 2}
                className="w-full resize-none rounded-xl bg-background p-2 text-sm focus:outline-none"
                value={value}
                onChange={(e) => update(key, e.target.value)}
              />
              <div className="mt-2 flex items-center justify-end gap-2">
                {saved === key && <span className="text-xs text-green-500">Sauvegardé !</span>}
                <button onClick={() => save(key, value)} disabled={saving === key}
                  className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-50">
                  <Save size={12} />
                  {saving === key ? "..." : "Sauvegarder"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {renderSection(pricingKeys, "Tarifs")}
      {renderSection(howtoKeys, "Comment ça marche")}
    </div>
  );
}
