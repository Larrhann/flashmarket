"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function OnboardingPage() {
  const router = useRouter();
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!nom.trim() || !prenom.trim() || !telephone.trim()) {
      setError("Merci de remplir tous les champs.");
      return;
    }

    // Numéro au format international, ex: +2250102030405
    const phone = telephone.trim().startsWith("+")
      ? telephone.trim()
      : `+225${telephone.trim().replace(/^0/, "")}`;

    setLoading(true);
    const supabase = createClient();
    const { error: otpError } = await supabase.auth.signInWithOtp({ phone });
    setLoading(false);

    if (otpError) {
      setError(otpError.message);
      return;
    }

    sessionStorage.setItem(
      "flashmarket_signup",
      JSON.stringify({ nom, prenom, telephone: phone })
    );
    router.push("/onboarding/otp");
  }

  return (
    <main className="flex flex-1 flex-col justify-center px-6 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-primary">FlashMarket</h1>
        <p className="mt-2 text-sm text-muted">
          Le fil local de ton quartier : annonces, événements et bons plans.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Prénom</label>
          <Input
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            placeholder="Awa"
            autoComplete="given-name"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Nom</label>
          <Input
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="Koné"
            autoComplete="family-name"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Numéro de téléphone
          </label>
          <Input
            type="tel"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            placeholder="07 00 00 00 00"
            autoComplete="tel"
          />
          <p className="mt-1 text-xs text-muted">
            Un code de vérification te sera envoyé par SMS.
          </p>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" loading={loading}>
          Recevoir le code
        </Button>
      </form>
    </main>
  );
}
