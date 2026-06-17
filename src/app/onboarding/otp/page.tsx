"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function OtpPage() {
  const router = useRouter();
  const [signupData, setSignupData] = useState<{ email: string; password: string } | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("flashmarket_signup");
    if (!raw) { router.replace("/onboarding"); return; }
    setSignupData(JSON.parse(raw));
  }, [router]);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!signupData) return;
    setError(null);
    setLoading(true);

    // 1. Vérifier le code via notre API
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code.trim() }),
    });
    const json = await res.json();

    if (!res.ok) {
      setLoading(false);
      setError(json.error ?? "Code invalide.");
      return;
    }

    // 2. Connecter avec email + mot de passe
    const supabase = createClient();
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: signupData.email,
      password: signupData.password,
    });

    setLoading(false);

    if (signInErr) {
      setError(signInErr.message);
      return;
    }

    sessionStorage.removeItem("flashmarket_signup");
    router.push("/onboarding/location");
  }

  async function handleResend() {
    const raw = sessionStorage.getItem("flashmarket_signup");
    if (!raw) return;
    setError(null);
    setResending(true);
    // On ne peut pas renvoyer sans les données complètes — rediriger vers onboarding
    setResending(false);
    setError("Pour renvoyer le code, retourne à l'étape précédente et soumets à nouveau.");
  }

  if (!signupData) return null;

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <div className="relative hidden md:flex md:w-1/2 flex-col items-center justify-center min-h-screen bg-white border-r border-border">
        <img src="/logo.png" alt="FlashMarket" className="w-40 h-40 object-contain" />
        <p className="mt-4 text-2xl font-extrabold tracking-tight">FlashMarket</p>
      </div>

      <div className="flex flex-1 flex-col justify-center px-6 py-12 md:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <h1 className="mb-1 text-2xl font-bold">Vérification</h1>
          <p className="mb-2 text-sm text-muted">
            Un code à 6 chiffres a été envoyé à
          </p>
          <p className="mb-8 font-semibold text-sm">{signupData?.email}</p>

          <form onSubmit={handleVerify} className="space-y-4">
            <Input
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className="text-center text-2xl tracking-[0.5em]"
            />

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" loading={loading} disabled={code.length !== 6}>
              Valider mon compte
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={handleResend}
              loading={resending}
              className="text-sm"
            >
              Je n&apos;ai pas reçu le code
            </Button>
          </form>

          <p className="mt-4 text-xs text-muted text-center">
            Le code expire dans 10 minutes.
          </p>
        </div>
      </div>
    </div>
  );
}
