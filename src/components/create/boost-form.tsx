"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pin } from "lucide-react";
import clsx from "clsx";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { PRICING } from "@/lib/constants";

const options = [
  { hours: 4, price: PRICING.BOOST_4H, label: "4 heures" },
  { hours: 24, price: PRICING.BOOST_24H, label: "24 heures" },
];

export function BoostForm({
  postId,
  titre,
  alreadyBoosted,
}: {
  postId: number;
  titre: string;
  alreadyBoosted: boolean;
}) {
  const router = useRouter();
  const [hours, setHours] = useState(4);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selected = options.find((o) => o.hours === hours)!;

  async function handlePay() {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) {
      router.replace("/onboarding");
      return;
    }

    const { data: tx, error: txError } = await supabase
      .from("transactions")
      .insert({
        user_id: userId,
        type: "boost",
        montant: selected.price,
        statut: "en_attente",
        post_id: postId,
        payload: { post_id: postId, duration_hours: selected.hours },
      })
      .select()
      .single();

    setLoading(false);

    if (txError) {
      setError(txError.message);
      return;
    }

    router.push(`/create/payer?tx=${tx.id}`);
  }

  return (
    <main className="flex flex-1 flex-col px-4 py-4">
      <h1 className="mb-1 text-xl font-bold">Booster ma publication</h1>
      <p className="mb-6 text-sm text-muted">{titre}</p>

      {alreadyBoosted && (
        <div className="mb-4 rounded-2xl border border-accent/30 bg-accent/10 p-3 text-sm">
          Cette publication est déjà boostée.
        </div>
      )}

      <div className="mb-6 space-y-3">
        {options.map((opt) => (
          <button
            key={opt.hours}
            onClick={() => setHours(opt.hours)}
            className={clsx(
              "flex w-full items-center justify-between rounded-2xl border p-4 text-left transition-colors",
              hours === opt.hours
                ? "border-primary bg-primary/10"
                : "border-border bg-card"
            )}
          >
            <span className="flex items-center gap-2 font-semibold">
              <Pin size={18} />
              Forfait {opt.label}
            </span>
            <span className="font-bold text-primary">{opt.price} FCFA</span>
          </button>
        ))}
      </div>

      <p className="mb-3 text-xs text-muted">
        Ta publication sera épinglée en tête du fil de ton quartier pendant
        toute la durée du forfait.
      </p>

      {error && <p className="mb-2 text-sm text-red-500">{error}</p>}

      <Button onClick={handlePay} loading={loading}>
        Payer {selected.price} FCFA
      </Button>
    </main>
  );
}
