"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "@/components/theme-provider";
import { Toggle } from "@/components/ui/toggle";
import { Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PRICING } from "@/lib/constants";
import type { Profile, Quartier, Ville } from "@/lib/database.types";

export function SettingsView({
  profile,
  villes,
}: {
  profile: Profile;
  villes: Ville[];
}) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const [telephoneMasque, setTelephoneMasque] = useState(profile.telephone_masque);
  const [notifPush, setNotifPush] = useState(profile.notif_push);
  const [notifSms, setNotifSms] = useState(profile.notif_sms);

  const [villeId, setVilleId] = useState(String(profile.ville_id ?? ""));
  const [quartierId, setQuartierId] = useState(String(profile.quartier_id ?? ""));
  const [quartiers, setQuartiers] = useState<Quartier[]>([]);
  const [savingHub, setSavingHub] = useState(false);

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

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/onboarding");
    router.refresh();
  }

  return (
    <main className="px-4 py-4">
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
          description={`Reçois les nouveautés du quartier par SMS — ${PRICING.VIP_MONTHLY} FCFA/mois`}
          right={
            isVipActive ? (
              <span className="text-xs font-semibold text-accent">Actif</span>
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
              className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium ${
                theme === t
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground"
              }`}
            >
              {t === "light" ? "Clair" : t === "dark" ? "Sombre" : "Système"}
            </button>
          ))}
        </div>
      </Section>

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
      <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
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
