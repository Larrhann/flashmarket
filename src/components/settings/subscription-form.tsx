"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function SubscriptionForm({
  type,
  title,
  price,
  benefits,
}: {
  type: "abonnement_pro" | "abonnement_vip";
  title: string;
  price: number;
  benefits: string[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        type,
        montant: price,
        statut: "en_attente",
        payload: { type },
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
      <h1 className="mb-1 text-xl font-bold">{title}</h1>
      <p className="mb-6 text-2xl font-extrabold text-primary">
        {price} FCFA<span className="text-sm font-medium text-muted">/mois</span>
      </p>

      <ul className="mb-8 space-y-3">
        {benefits.map((b) => (
          <li key={b} className="flex items-start gap-2 text-sm">
            <Check size={18} className="mt-0.5 shrink-0 text-accent" />
            {b}
          </li>
        ))}
      </ul>

      {error && <p className="mb-2 text-sm text-red-500">{error}</p>}

      <Button onClick={handlePay} loading={loading}>
        S&apos;abonner — {price} FCFA/mois
      </Button>
    </main>
  );
}
