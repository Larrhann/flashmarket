"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function OnboardingPage() {
  const router = useRouter();
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!nom.trim() || !prenom.trim() || !telephone.trim() || !email.trim()) {
      setError("Merci de remplir tous les champs.");
      return;
    }

    const phone = telephone.trim().startsWith("+")
      ? telephone.trim()
      : `+225${telephone.trim().replace(/^0/, "")}`;

    setLoading(true);
    const supabase = createClient();
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
    });
    setLoading(false);

    if (otpError) {
      setError(otpError.message);
      return;
    }

    sessionStorage.setItem(
      "flashmarket_signup",
      JSON.stringify({ nom, prenom, telephone: phone, email: email.trim() })
    );
    router.push("/onboarding/otp");
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Panneau gauche — branding */}
      <div
        className="relative hidden md:flex md:w-1/2 flex-col items-center justify-center min-h-screen overflow-hidden"
        style={{
          backgroundImage: "url('/logo.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Overlay teal pour lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d9488]/75 via-[#0f766e]/65 to-[#134e4a]/85" />
        {/* Texte par-dessus */}
        <div className="relative z-10 flex flex-col items-center text-center px-8">
          <p className="text-3xl font-extrabold text-white drop-shadow-lg tracking-tight">FlashMarket</p>
          <p className="mt-3 max-w-xs text-base font-medium text-white/85">
            Le fil local de ton quartier : annonces, événements et bons plans en Côte d&apos;Ivoire.
          </p>
        </div>
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
              <p className="mt-1 text-xs text-muted">
                Utilisé pour te contacter sur tes publications.
              </p>
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
              <p className="mt-1 text-xs text-muted">
                Un code de vérification te sera envoyé.
              </p>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" loading={loading}>
              Recevoir le code
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
