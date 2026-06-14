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

export function BottomNav() {
  const pathname = usePathname();

  if (pathname.startsWith("/onboarding")) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 md:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-around py-2">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex flex-col items-center gap-1 px-4 py-1 text-xs font-medium transition-colors",
                active ? "text-primary" : "text-muted"
              )}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
