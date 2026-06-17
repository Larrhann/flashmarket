"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function OnboardingPage() {
  const router = useRouter();
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!nom.trim() || !prenom.trim() || !telephone.trim() || !email.trim() || !password.trim()) {
      setError("Merci de remplir tous les champs.");
      return;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    const phone = telephone.trim().startsWith("+")
      ? telephone.trim()
      : `+225${telephone.trim().replace(/^0/, "")}`;

    setLoading(true);

    const res = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), nom: nom.trim(), prenom: prenom.trim(), telephone: phone, password }),
    });

    const json = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(json.error ?? "Erreur lors de l'envoi du code.");
      return;
    }

    // Sauvegarder email + password pour la page OTP
    sessionStorage.setItem(
      "flashmarket_signup",
      JSON.stringify({ email: email.trim(), password })
    );
    router.push("/onboarding/otp");
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Panneau gauche — branding */}
      <div className="relative hidden md:flex md:w-1/2 flex-col items-center justify-center min-h-screen bg-white border-r border-border">
        <img src="/logo.png" alt="FlashMarket" className="w-40 h-40 object-contain" />
        <p className="mt-4 text-2xl font-extrabold tracking-tight">FlashMarket</p>
        <p className="mt-2 max-w-xs text-center text-sm text-muted">
          Le fil local de ton quartier : annonces, événements et bons plans en Côte d&apos;Ivoire.
        </p>
      </div>

      {/* Panneau droit — formulaire */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 md:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <h1 className="mb-1 text-2xl font-bold">Créer mon compte</h1>
          <p className="mb-8 text-sm text-muted">
            Rejoins ta communauté de quartier.
          </p>

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
              <label className="mb-1 block text-sm font-medium">Téléphone</label>
              <Input
                type="tel"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                placeholder="07 00 00 00 00"
                autoComplete="tel"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="awa@example.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Mot de passe</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 caractères"
                autoComplete="new-password"
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" loading={loading}>
              Recevoir le code de vérification
            </Button>
          </form>

          <p className="mt-6 text-sm text-muted">
            Déjà un compte ?{" "}
            <a href="/login" className="text-teal-600 hover:underline font-medium">
              Se connecter
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
