"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (err) {
      if (err.message.includes("Invalid login credentials")) {
        setError("Email ou mot de passe incorrect.");
      } else if (err.message.includes("Email not confirmed")) {
        setError("Email non vérifié. Vérifie ta boîte mail.");
      } else {
        setError(err.message);
      }
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <div className="relative hidden md:flex md:w-1/2 flex-col items-center justify-center min-h-screen bg-white border-r border-border">
        <img src="/logo.png" alt="FlashMarket" className="w-40 h-40 object-contain" />
        <p className="mt-4 text-2xl font-extrabold tracking-tight">FlashMarket</p>
        <p className="mt-2 max-w-xs text-center text-sm text-muted">
          Le fil local de ton quartier : annonces, événements et bons plans en Côte d&apos;Ivoire.
        </p>
      </div>

      <div className="flex flex-1 flex-col justify-center px-6 py-12 md:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <h1 className="mb-1 text-2xl font-bold">Connexion</h1>
          <p className="mb-8 text-sm text-muted">Accède à ton compte FlashMarket.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="toi@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Mot de passe</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ton mot de passe"
                autoComplete="current-password"
                required
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" loading={loading}>
              Se connecter
            </Button>
          </form>

          <p className="mt-6 text-sm text-muted">
            Pas encore de compte ?{" "}
            <a href="/onboarding" className="text-teal-600 hover:underline font-medium">
              Créer un compte
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
