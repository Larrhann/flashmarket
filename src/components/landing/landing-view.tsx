import Link from "next/link";
import { Sparkles, MapPin, Megaphone, ShieldCheck } from "lucide-react";

export function LandingView() {
  return (
    <main className="flex flex-1 flex-col px-6 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-primary">FlashMarket</h1>
        <p className="mt-2 text-sm text-muted">
          Le fil local de ton quartier : annonces, événements et bons plans,
          près de chez toi.
        </p>
      </div>

      <div className="mb-10 space-y-3">
        <Feature
          icon={<MapPin size={18} />}
          title="100% local"
          description="Vois uniquement ce qui se passe dans ton quartier."
        />
        <Feature
          icon={<Megaphone size={18} />}
          title="Annonces & bons plans"
          description="Achète, vends ou propose tes services facilement."
        />
        <Feature
          icon={<Sparkles size={18} />}
          title="Événements & formations"
          description="Découvre ce qui bouge près de chez toi."
        />
        <Feature
          icon={<ShieldCheck size={18} />}
          title="Profils vérifiés"
          description="Échange en confiance avec ton voisinage."
        />
      </div>

      <Link
        href="/onboarding"
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
      >
        Connexion
      </Link>
      <p className="mt-3 text-center text-xs text-muted">
        Pas encore de compte ? La connexion par SMS en crée un automatiquement.
      </p>
    </main>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-3">
      <div className="mt-0.5 text-primary">{icon}</div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted">{description}</p>
      </div>
    </div>
  );
}
