"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteFooter() {
  const pathname = usePathname();

  if (pathname.startsWith("/onboarding")) return null;

  return (
    <footer className="hidden border-t border-border bg-card md:block">
      <div className="mx-auto grid max-w-6xl grid-cols-4 gap-8 px-8 py-10 text-sm">
        <div>
          <p className="mb-3 text-lg font-bold text-primary">FlashMarket</p>
          <p className="text-muted">Le fil local de Côte d&apos;Ivoire : annonces, événements et bons plans près de chez toi.</p>
        </div>
        <div>
          <p className="mb-3 font-semibold">À la une</p>
          <ul className="space-y-2 text-muted">
            <li><Link href="/?filter=flash" className="hover:text-primary">Flash Marché</Link></li>
            <li><Link href="/?filter=event" className="hover:text-primary">Événements & Sorties</Link></li>
            <li><Link href="/?filter=formation" className="hover:text-primary">Formations & Services</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 font-semibold">Compte</p>
          <ul className="space-y-2 text-muted">
            <li><Link href="/create" className="hover:text-primary">Publier une annonce</Link></li>
            <li><Link href="/profile" className="hover:text-primary">Mon profil</Link></li>
            <li><Link href="/settings" className="hover:text-primary">Réglages</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 font-semibold">Informations</p>
          <ul className="space-y-2 text-muted">
            <li><Link href="/onboarding" className="hover:text-primary">Connexion / Inscription</Link></li>
            <li className="text-muted">Côte d&apos;Ivoire</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} FlashMarket. Tous droits réservés.
      </div>
    </footer>
  );
}
