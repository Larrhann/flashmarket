"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import type { Quartier, Ville } from "@/lib/database.types";

export default function LocationPage() {
  const router = useRouter();
  const [villes, setVilles] = useState<Ville[]>([]);
  const [quartiers, setQuartiers] = useState<Quartier[]>([]);
  const [villeId, setVilleId] = useState<string>("");
  const [quartierId, setQuartierId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("villes")
      .select("*")
      .order("nom")
      .then(({ data }) => setVilles(data ?? []));
  }, []);

  async function handleVilleChange(value: string) {
    setVilleId(value);
    setQuartierId("");

    if (!value) {
      setQuartiers([]);
      return;
    }

    const supabase = createClient();
    const { data } = await supabase
      .from("quartiers")
      .select("*")
      .eq("ville_id", Number(value))
      .order("nom");
    setQuartiers(data ?? []);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!villeId || !quartierId) {
      setError("Choisis ta ville et ton quartier.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setLoading(false);
      router.replace("/onboarding");
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ ville_id: Number(villeId), quartier_id: Number(quartierId) })
      .eq("id", userData.user.id);

    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.push("/");
  }

  return (
    <main className="flex flex-1 flex-col justify-center px-6 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold">Ton Hub Local</h1>
        <p className="mt-2 text-sm text-muted">
          Choisis ta ville et ton quartier pour découvrir ce qui se passe
          près de toi.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Ville</label>
          <Select value={villeId} onChange={(e) => handleVilleChange(e.target.value)}>
            <option value="">Sélectionner une ville</option>
            {villes.map((v) => (
              <option key={v.id} value={v.id}>
                {v.nom}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Quartier</label>
          <Select
            value={quartierId}
            onChange={(e) => setQuartierId(e.target.value)}
            disabled={!villeId}
          >
            <option value="">Sélectionner un quartier</option>
            {quartiers.map((q) => (
              <option key={q.id} value={q.id}>
                {q.nom}
              </option>
            ))}
          </Select>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" loading={loading}>
          Continuer
        </Button>
      </form>
    </main>
  );
}
