"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  LogOut,
  MapPin,
  Bell,
  Lock,
  Palette,
  HelpCircle,
  BadgeCheck,
  Sparkles,
  Trash2,
  ShieldCheck,
  Clock,
  ShieldAlert,
  Shield,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "@/components/theme-provider";
import { Toggle } from "@/components/ui/toggle";
import { Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ACCENT_COLORS, PRICING } from "@/lib/constants";
import { VipPushToggle } from "./vip-push-toggle";
import type { Profile, Quartier, Ville } from "@/lib/database.types";

export function SettingsView({
  profile,
  villes,
}: {
  profile: Profile;
  villes: Ville[];
}) {
  const router = useRouter();
  const { theme, setTheme, accent, setAccent } = useTheme();

  const [telephoneMasque, setTelephoneMasque] = useState(profile.telephone_masque);
  const [notifPush, setNotifPush] = useState(profile.notif_push);
  const [notifSms, setNotifSms] = useState(profile.notif_sms);

  const [villeId, setVilleId] = useState(String(profile.ville_id ?? ""));
  const [quartierId, setQuartierId] = useState(String(profile.quartier_id ?? ""));
  const [quartiers, setQuartiers] = useState<Quartier[]>([]);
  const [savingHub, setSavingHub] = useState(false);

  const [verificationStatut, setVerificationStatut] = useState(profile.verification_statut);
  const [rectoFile, setRectoFile] = useState<File | null>(null);
  const [versoFile, setVersoFile] = useState<File | null>(null);
  const [uploadingCni, setUploadingCni] = useState(false);
  const [cniError, setCniError] = useState<string | null>(null);
  const rectoInputRef = useRef<HTMLInputElement>(null);
  const versoInputRef = useRef<HTMLInputElement>(null);

  const isProActive =
    profile.is_pro && (!profile.pro_expire_at || new Date(profile.pro_expire_at) > new Date());
  const isVipActive =
    profile.vip_alertes && (!profile.vip_expire_at || new Date(profile.vip_expire_at) > new Date());

  useEffect(() => {
    const initialVilleId = profile.ville_id;
    if (!initialVilleId) return;
    const supabase = createClient();
    supabase
      .from("quartiers")
      .select("*")
      .eq("ville_id", initialVilleId)
      .order("nom")
      .then(({ data }) => setQuartiers(data ?? []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  async function updateProfile(fields: Partial<Profile>) {
    const supabase = createClient();
    await supabase.from("profiles").update(fields).eq("id", profile.id);
  }

  async function handleSaveHub() {
    setSavingHub(true);
    await updateProfile({
      ville_id: Number(villeId),
      quartier_id: Number(quartierId),
    });
    setSavingHub(false);
    router.refresh();
  }

  async function handleCniSubmit() {
    if (!rectoFile || !versoFile) return;

    setCniError(null);
    setUploadingCni(true);

    const supabase = createClient();

    const uploadOne = async (file: File, side: string) => {
      const ext = file.name.split(".").pop();
      const path = `${profile.id}/${side}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("cni-documents").upload(path, file);
      if (error) throw error;
      return path;
    };

    try {
      const [rectoPath, versoPath] = await Promise.all([
        uploadOne(rectoFile, "recto"),
        uploadOne(versoFile, "verso"),
      ]);

      const res = await fetch("/api/verification/cni", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rectoPath, versoPath }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error ?? "Erreur lors de la vérification.");

      setVerificationStatut(result.statut);
    } catch (err) {
      setCniError(err instanceof Error ? err.message : "Erreur lors de l'envoi.");
    } finally {
      setUploadingCni(false);
    }
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/onboarding");
    router.refresh();
  }

  return (
    <main className="px-4 py-4 md:mx-auto md:max-w-2xl">
      <h1 className="mb-4 text-xl font-bold">Réglages</h1>

      {/* Compte / Hub Local */}
      <Section title="Compte & Hub Local" icon={<MapPin size={16} />}>
        <div className="space-y-3 p-4">
          <div>
            <p className="mb-2 text-sm font-medium">
              {profile.prenom} {profile.nom} · {profile.telephone}
            </p>
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted">Ville</label>
            <Select value={villeId} onChange={(e) => handleVilleChange(e.target.value)}>
              <option value="">Sélectionner</option>
              {villes.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.nom}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted">Quartier</label>
            <Select
              value={quartierId}
              onChange={(e) => setQuartierId(e.target.value)}
              disabled={!villeId}
            >
              <option value="">Sélectionner</option>
              {quartiers.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.nom}
                </option>
              ))}
            </Select>
          </div>

          <Button
            variant="secondary"
            onClick={handleSaveHub}
            loading={savingHub}
            disabled={
              String(profile.ville_id) === villeId &&
              String(profile.quartier_id) === quartierId
            }
          >
            Enregistrer le Hub Local
          </Button>
        </div>
      </Section>

      {/* Abonnements */}
      <Section title="Abonnements" icon={<Sparkles size={16} />}>
        <Row
          label="Compte Pro"
          description={`Publications illimitées + badge certifié — ${PRICING.PRO_MONTHLY} FCFA/mois`}
          right={
            isProActive ? (
              <span className="flex items-center gap-1 text-xs font-semibold text-accent">
                <BadgeCheck size={16} /> Actif
              </span>
            ) : (
              <Link href="/settings/abonnement/pro" className="text-xs font-semibold text-primary">
                Activer
              </Link>
            )
          }
        />
        <Row
          label="Alertes VIP"
          description={`Reçois une notification dans l'app à chaque nouveau Flash du quartier — ${PRICING.VIP_MONTHLY} FCFA/mois`}
          right={
            isVipActive ? (
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs font-semibold text-accent">Actif</span>
                <VipPushToggle />
              </div>
            ) : (
              <Link href="/settings/abonnement/vip" className="text-xs font-semibold text-primary">
                Activer
              </Link>
            )
          }
        />
      </Section>

      {/* Confidentialité */}
      <Section title="Confidentialité" icon={<Lock size={16} />}>
        <Row
          label="Masquer mon numéro"
          description="Ton numéro ne sera pas affiché publiquement"
          right={
            <Toggle
              checked={telephoneMasque}
              onChange={(v) => {
                setTelephoneMasque(v);
                updateProfile({ telephone_masque: v });
              }}
            />
          }
        />
      </Section>

      {/* Vérification d'identité */}
      <Section title="Vérification d'identité" icon={<ShieldCheck size={16} />}>
        <div className="space-y-3 p-4">
          {verificationStatut === "verifie" && (
            <div className="flex items-center gap-2 rounded-2xl bg-accent/10 p-3 text-sm font-semibold text-accent">
              <ShieldCheck size={18} /> Identité vérifiée
            </div>
          )}
          {verificationStatut === "en_attente" && (
            <div className="flex items-center gap-2 rounded-2xl bg-primary/10 p-3 text-sm font-semibold text-primary">
              <Clock size={18} /> Vérification en cours
            </div>
          )}
          {verificationStatut === "refuse" && (
            <div className="flex items-center gap-2 rounded-2xl bg-red-500/10 p-3 text-sm font-semibold text-red-500">
              <ShieldAlert size={18} /> Document refusé, réessaie
            </div>
          )}

          {(verificationStatut === "non_verifie" || verificationStatut === "refuse") && (
            <>
              <p className="text-xs text-muted">
                Envoie les deux faces de ta CNI. Si le nom correspond à celui de ton profil, ton
                compte est vérifié automatiquement.
              </p>

              <input
                ref={rectoInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => setRectoFile(e.target.files?.[0] ?? null)}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => rectoInputRef.current?.click()}
                className="flex w-full items-center justify-between rounded-2xl border border-dashed border-border bg-card p-3 text-left text-sm"
              >
                <span>Photo recto</span>
                <span className={rectoFile ? "text-accent" : "text-muted"}>
                  {rectoFile ? rectoFile.name : "Choisir..."}
                </span>
              </button>

              <input
                ref={versoInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => setVersoFile(e.target.files?.[0] ?? null)}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => versoInputRef.current?.click()}
                className="flex w-full items-center justify-between rounded-2xl border border-dashed border-border bg-card p-3 text-left text-sm"
              >
                <span>Photo verso</span>
                <span className={versoFile ? "text-accent" : "text-muted"}>
                  {versoFile ? versoFile.name : "Choisir..."}
                </span>
              </button>

              <Button
                variant="secondary"
                onClick={handleCniSubmit}
                loading={uploadingCni}
                disabled={!rectoFile || !versoFile}
              >
                Envoyer pour vérification
              </Button>
              {cniError && <p className="text-sm text-red-500">{cniError}</p>}
            </>
          )}
        </div>
      </Section>

      {/* Notifications */}
      <Section title="Notifications" icon={<Bell size={16} />}>
        <Row
          label="Notifications Push"
          description="Likes, alertes et mises à jour"
          right={
            <Toggle
              checked={notifPush}
              onChange={(v) => {
                setNotifPush(v);
                updateProfile({ notif_push: v });
              }}
            />
          }
        />
        <Row
          label="Notifications SMS"
          description="Alertes importantes par SMS"
          right={
            <Toggle
              checked={notifSms}
              onChange={(v) => {
                setNotifSms(v);
                updateProfile({ notif_sms: v });
              }}
            />
          }
        />
      </Section>

      {/* Apparence */}
      <Section title="Apparence" icon={<Palette size={16} />}>
        <div className="flex gap-2 p-4">
          {(["light", "dark", "system"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`flex-1 rounded-2xl border px-3 py-2 text-sm font-medium ${
                theme === t
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground"
              }`}
            >
              {t === "light" ? "Clair" : t === "dark" ? "Sombre" : "Système"}
            </button>
          ))}
        </div>
        <div className="border-t border-border p-4">
          <p className="mb-3 text-xs text-muted">Couleur d&apos;accent</p>
          <div className="flex gap-3">
            {ACCENT_COLORS.map((c) => (
              <button
                key={c.id}
                onClick={() => setAccent(c.id)}
                aria-label={c.label}
                className={`h-9 w-9 rounded-full border-2 transition-transform ${
                  accent === c.id ? "scale-110 border-foreground" : "border-transparent"
                }`}
                style={{ backgroundColor: c.value }}
              />
            ))}
          </div>
        </div>
      </Section>

      {/* Admin */}
      {profile.is_admin && (
        <Section title="Administration" icon={<Shield size={16} />}>
          <Link href="/admin" className="flex items-center justify-between p-4 text-sm font-medium">
            Dashboard admin
            <ChevronRight size={18} className="text-muted" />
          </Link>
          <Link href="/admin/posts" className="flex items-center justify-between border-t border-border p-4 text-sm font-medium">
            Gérer les publications
            <ChevronRight size={18} className="text-muted" />
          </Link>
          <Link href="/admin/users" className="flex items-center justify-between border-t border-border p-4 text-sm font-medium">
            Gérer les utilisateurs
            <ChevronRight size={18} className="text-muted" />
          </Link>
          <Link href="/admin/verifications" className="flex items-center justify-between border-t border-border p-4 text-sm font-medium">
            Vérifications CNI
            <ChevronRight size={18} className="text-muted" />
          </Link>
        </Section>
      )}

      {/* Support */}
      <Section title="Support" icon={<HelpCircle size={16} />}>
        <a
          href="https://wa.me/2250000000000"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-4 text-sm font-medium"
        >
          Contacter le support (WhatsApp)
          <ChevronRight size={18} className="text-muted" />
        </a>
      </Section>

      {/* Sécurité */}
      <Section title="Sécurité" icon={<Lock size={16} />}>
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-between p-4 text-sm font-medium text-red-500"
        >
          Déconnexion
          <LogOut size={18} />
        </button>
        <button
          onClick={() => alert("Contacte le support pour supprimer ton compte.")}
          className="flex w-full items-center justify-between border-t border-border p-4 text-sm font-medium text-red-500"
        >
          Supprimer mon compte
          <Trash2 size={18} />
        </button>
      </Section>
    </main>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <div className="mb-1 flex items-center gap-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted">
        {icon}
        {title}
      </div>
      <div className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-card">
        {children}
      </div>
    </div>
  );
}

function Row({
  label,
  description,
  right,
}: {
  label: string;
  description?: string;
  right: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 p-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted">{description}</p>}
      </div>
      {right}
    </div>
  );
}
