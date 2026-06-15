"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SignupData {
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
}

export default function OtpPage() {
  const router = useRouter();
  const [data] = useState<SignupData | null>(() => {
    if (typeof window === "undefined") return null;
    const raw = sessionStorage.getItem("flashmarket_signup");
    return raw ? JSON.parse(raw) : null;
  });
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!data) router.replace("/onboarding");
  }, [data, router]);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!data) return;
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
      email: data.email,
      token: code,
      type: "email",
    });

    if (verifyError || !verifyData.user) {
      setLoading(false);
      setError(verifyError?.message ?? "Code invalide.");
      return;
    }

    // Crée le profil (nom, prénom, téléphone) — la localisation est ajoutée à l'étape suivante
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: verifyData.user.id,
      nom: data.nom,
      prenom: data.prenom,
      telephone: data.telephone,
    });

    setLoading(false);

    if (profileError) {
      setError(profileError.message);
      return;
    }

    sessionStorage.removeItem("flashmarket_signup");
    router.push("/onboarding/location");
  }

  async function handleResend() {
    if (!data) return;
    setError(null);
    setResending(true);
    const supabase = createClient();
    const { error: resendError } = await supabase.auth.signInWithOtp({
      email: data.email,
    });
    setResending(false);
    if (resendError) setError(resendError.message);
  }

  if (!data) return null;

  return (
    <main className="flex flex-1 flex-col justify-center px-6 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold">Vérification</h1>
        <p className="mt-2 text-sm text-muted">
          Entre le code reçu par email à {data.email}
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-4">
        <Input
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="123456"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="text-center text-2xl tracking-[0.5em]"
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" loading={loading}>
          Valider
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={handleResend}
          loading={resending}
        >
          Renvoyer le code
        </Button>
      </form>
    </main>
  );
}
