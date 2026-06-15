"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Lock } from "lucide-react";
import clsx from "clsx";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORIES, FLASH_DURATION_HOURS, FREE_FLASH_PER_WEEK, PRICING } from "@/lib/constants";
import type { PostType } from "@/lib/database.types";

interface CreateFormProps {
  quartierId: number;
  villeId: number;
  defaultPhone: string;
  isPro: boolean;
  flashPubliesCetteSemaine: number;
  semaine: string;
}

const typeOptions: { value: PostType; label: string }[] = [
  { value: "flash", label: "🛍️ Flash Marché" },
  { value: "event", label: "📅 Événement" },
  { value: "formation", label: "🎓 Formation" },
];

export function CreateForm({
  quartierId,
  villeId,
  defaultPhone,
  isPro,
  flashPubliesCetteSemaine,
  semaine,
}: CreateFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [type, setType] = useState<PostType>("flash");
  const [categorie, setCategorie] = useState("");
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [prix, setPrix] = useState("");
  const [whatsapp, setWhatsapp] = useState(defaultPhone);
  const [appel, setAppel] = useState(defaultPhone);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const eventLocked = (type === "event" || type === "formation") && !isPro;
  const quotaAtteint = type === "flash" && flashPubliesCetteSemaine >= FREE_FLASH_PER_WEEK;

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!titre.trim()) {
      setError("Le titre est obligatoire.");
      return;
    }
    if (eventLocked) return;

    setLoading(true);
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) {
      setLoading(false);
      router.replace("/onboarding");
      return;
    }

    // Upload photo (si fournie)
    let photoUrl: string | null = null;
    if (photoFile) {
      const ext = photoFile.name.split(".").pop();
      const path = `${userId}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("post-photos")
        .upload(path, photoFile);

      if (uploadError) {
        setLoading(false);
        setError(uploadError.message);
        return;
      }
      const { data: publicUrl } = supabase.storage.from("post-photos").getPublicUrl(path);
      photoUrl = publicUrl.publicUrl;
    }

    // Durée de visibilité : 48h pour un Flash gratuit, 7 jours pour un Flash
    // payant (ou pour les événements/formations Pro).
    const dureeHeures = type === "flash" && !quotaAtteint ? FLASH_DURATION_HOURS.FREE : FLASH_DURATION_HOURS.PAID;
    const expiresAt = new Date(Date.now() + dureeHeures * 60 * 60 * 1000).toISOString();

    // Si paywall atteint pour les Flash, on enregistre une transaction en
    // attente avec le brouillon de la publication, puis on redirige vers le
    // paiement (CinetPay). Le post est créé par le webhook après paiement.
    if (quotaAtteint) {
      const { data: tx, error: txError } = await supabase
        .from("transactions")
        .insert({
          user_id: userId,
          type: "publication",
          montant: PRICING.FLASH_PUBLICATION,
          statut: "en_attente",
          payload: {
            type,
            categorie: type === "flash" ? categorie || null : null,
            titre: titre.trim(),
            description: description.trim() || null,
            prix: prix ? Number(prix) : null,
            photos: photoUrl ? [photoUrl] : [],
            quartier_id: quartierId,
            ville_id: villeId,
            whatsapp_numero: whatsapp.trim() || null,
            appel_numero: appel.trim() || null,
            expires_at: expiresAt,
          },
        })
        .select()
        .single();

      setLoading(false);

      if (txError) {
        setError(txError.message);
        return;
      }

      router.push(`/create/payer?tx=${tx.id}`);
      return;
    }

    const { error: insertError } = await supabase.from("posts").insert({
      user_id: userId,
      type,
      categorie: type === "flash" ? categorie || null : null,
      titre: titre.trim(),
      description: description.trim() || null,
      prix: prix ? Number(prix) : null,
      photos: photoUrl ? [photoUrl] : [],
      quartier_id: quartierId,
      ville_id: villeId,
      whatsapp_numero: whatsapp.trim() || null,
      appel_numero: appel.trim() || null,
      expires_at: expiresAt,
    });

    if (insertError) {
      setLoading(false);
      setError(insertError.message);
      return;
    }

    // Met à jour le quota hebdomadaire pour les Flash gratuits
    if (type === "flash") {
      await supabase.from("publication_quota").upsert(
        {
          user_id: userId,
          semaine,
          nb_publies: flashPubliesCetteSemaine + 1,
        },
        { onConflict: "user_id,semaine" }
      );
    }

    setLoading(false);
    router.push("/");
    router.refresh();
  }

  return (
    <main className="px-4 py-4 md:mx-auto md:max-w-2xl">
      <h1 className="mb-4 text-xl font-bold">Nouvelle publication</h1>

      {/* Sélecteur de type */}
      <div className="mb-4 flex gap-2">
        {typeOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setType(opt.value)}
            className={clsx(
              "flex-1 rounded-2xl border px-2 py-3 text-xs font-semibold transition-colors",
              type === opt.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {eventLocked ? (
        <div className="rounded-3xl border border-border bg-card p-6 text-center">
          <Lock className="mx-auto mb-3 text-primary" size={32} />
          <h2 className="mb-1 text-base font-bold">Compte Pro requis</h2>
          <p className="mb-4 text-sm text-muted">
            La publication d&apos;événements et de formations en illimité est
            réservée aux comptes Pro ({PRICING.PRO_MONTHLY} FCFA/mois), avec
            un badge de certification.
          </p>
          <Button onClick={() => router.push("/settings")}>
            Passer au compte Pro
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {quotaAtteint && (
            <div className="rounded-2xl border border-primary/30 bg-primary/10 p-3 text-sm">
              Tu as utilisé ton Flash gratuit cette semaine (visible 48h). La
              publication suivante coûte{" "}
              <strong>{PRICING.FLASH_PUBLICATION} FCFA</strong> et reste en
              ligne 7 jours.
            </div>
          )}

          {type === "flash" && (
            <div>
              <label className="mb-1 block text-sm font-medium">Rubrique</label>
              <Select value={categorie} onChange={(e) => setCategorie(e.target.value)}>
                <option value="">Sélectionner une rubrique (optionnel)</option>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium">Titre</label>
            <Input
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              placeholder={
                type === "flash"
                  ? "Ex: iPhone 12, comme neuf"
                  : type === "event"
                    ? "Ex: Soirée quartier samedi"
                    : "Ex: Cours de couture débutant"
              }
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Description</label>
            <Textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Détails, date, lieu, conditions..."
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Prix {type !== "flash" && "(optionnel)"}
            </label>
            <Input
              type="number"
              inputMode="numeric"
              value={prix}
              onChange={(e) => setPrix(e.target.value)}
              placeholder="0 = gratuit"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Photo</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-32 w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border bg-card"
            >
              {photoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoPreview} alt="Aperçu" className="h-full w-full object-cover" />
              ) : (
                <span className="flex flex-col items-center gap-1 text-sm text-muted">
                  <ImagePlus size={24} />
                  Ajouter une photo
                </span>
              )}
            </button>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Numéro WhatsApp (contact direct)
            </label>
            <Input
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="+225 07 00 00 00 00"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Numéro d&apos;appel (optionnel)
            </label>
            <Input
              type="tel"
              value={appel}
              onChange={(e) => setAppel(e.target.value)}
              placeholder="+225 07 00 00 00 00"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" loading={loading}>
            {quotaAtteint ? `Payer ${PRICING.FLASH_PUBLICATION} FCFA et publier` : "Publier"}
          </Button>
        </form>
      )}
    </main>
  );
}
