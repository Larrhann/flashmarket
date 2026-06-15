"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Lock, X } from "lucide-react";
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
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const eventLocked = (type === "event" || type === "formation") && !isPro;
  const quotaAtteint = type === "flash" && flashPubliesCetteSemaine >= FREE_FLASH_PER_WEEK;

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    const combined = [...photoFiles, ...files].slice(0, 5);
    setPhotoFiles(combined);
    setPhotoPreviews(combined.map((f) => URL.createObjectURL(f)));
    e.target.value = "";
  }

  function removePhoto(index: number) {
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
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

    // Upload des photos (1 à 5). Avec 2 photos ou plus, l'effet motion
    // (diaporama animé) s'active automatiquement sur les publications boostées.
    const photoUrls: string[] = [];
    for (const file of photoFiles) {
      const ext = file.name.split(".").pop();
      const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("post-photos").upload(path, file);

      if (uploadError) {
        setLoading(false);
        setError(uploadError.message);
        return;
      }
      const { data: publicUrl } = supabase.storage.from("post-photos").getPublicUrl(path);
      photoUrls.push(publicUrl.publicUrl);
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
            photos: photoUrls,
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

    const { data: inserted, error: insertError } = await supabase
      .from("posts")
      .insert({
        user_id: userId,
        type,
        categorie: type === "flash" ? categorie || null : null,
        titre: titre.trim(),
        description: description.trim() || null,
        prix: prix ? Number(prix) : null,
        photos: photoUrls,
        quartier_id: quartierId,
        ville_id: villeId,
        whatsapp_numero: whatsapp.trim() || null,
        appel_numero: appel.trim() || null,
        expires_at: expiresAt,
      })
      .select("id")
      .single();

    if (insertError) {
      setLoading(false);
      setError(insertError.message);
      return;
    }

    if (inserted) {
      fetch("/api/posts/notify-vip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: inserted.id }),
      }).catch(() => {});
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
            <label className="mb-1 block text-sm font-medium">Photos</label>
            <p className="mb-2 text-xs text-muted">
              Ajoute 3 à 5 photos : si tu boostes ta publication, elles seront
              affichées en diaporama animé (effet motion).
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoChange}
              className="hidden"
            />
            <div className="grid grid-cols-3 gap-2">
              {photoPreviews.map((src, i) => (
                <div key={i} className="relative h-24 overflow-hidden rounded-2xl border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`Aperçu ${i + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white"
                    aria-label="Retirer la photo"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              {photoFiles.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-24 w-full items-center justify-center rounded-2xl border border-dashed border-border bg-card"
                >
                  <span className="flex flex-col items-center gap-1 text-xs text-muted">
                    <ImagePlus size={20} />
                    Ajouter
                  </span>
                </button>
              )}
            </div>
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
