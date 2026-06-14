"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

interface VerificationItem {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  rectoUrl: string | null;
  versoUrl: string | null;
}

export function AdminVerificationList({ items: initialItems }: { items: VerificationItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function handleDecision(id: string, statut: "verifie" | "refuse") {
    setPendingId(id);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ verification_statut: statut })
      .eq("id", id);

    setPendingId(null);
    if (!error) {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }
  }

  return (
    <main className="px-4 py-4 md:mx-auto md:max-w-2xl">
      <h1 className="mb-4 text-xl font-bold">Vérifications CNI en attente</h1>

      {items.length === 0 && (
        <p className="py-12 text-center text-sm text-muted">Aucune demande en attente.</p>
      )}

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="rounded-3xl border border-border bg-card p-4">
            <p className="mb-1 font-semibold">
              {item.prenom} {item.nom}
            </p>
            <p className="mb-3 text-sm text-muted">{item.telephone}</p>

            <div className="mb-3 grid grid-cols-2 gap-2">
              {item.rectoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.rectoUrl}
                  alt="CNI recto"
                  className="h-32 w-full rounded-2xl object-cover"
                />
              )}
              {item.versoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.versoUrl}
                  alt="CNI verso"
                  className="h-32 w-full rounded-2xl object-cover"
                />
              )}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => handleDecision(item.id, "verifie")}
                loading={pendingId === item.id}
                className="!w-auto flex-1"
              >
                <Check size={16} className="mr-1 inline" /> Approuver
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleDecision(item.id, "refuse")}
                loading={pendingId === item.id}
                className="!w-auto flex-1"
              >
                <X size={16} className="mr-1 inline" /> Refuser
              </Button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
