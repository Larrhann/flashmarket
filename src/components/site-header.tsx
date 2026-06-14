"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, User, Settings } from "lucide-react";
import clsx from "clsx";

const items = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/create", label: "Publier", icon: PlusCircle },
  { href: "/profile", label: "Profil", icon: User },
  { href: "/settings", label: "Réglages", icon: Settings },
];

export function SiteHeader() {
  const pathname = usePathname();

  if (pathname.startsWith("/onboarding")) return null;

  return (
    <header className="sticky top-0 z-40 hidden border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 md:block">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-3">
        <Link href="/" className="text-lg font-bold text-primary">
          FlashMarket
        </Link>

        <nav className="flex items-center gap-1">
          {items.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  "flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted hover:text-foreground"
                )}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
