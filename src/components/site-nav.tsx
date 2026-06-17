"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, User, Settings, Rocket } from "lucide-react";
import clsx from "clsx";

const items = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/boostes", label: "Boostés", icon: Rocket },
  { href: "/create", label: "Publier", icon: PlusCircle },
  { href: "/profile", label: "Profil", icon: User },
  { href: "/settings", label: "Réglages", icon: Settings },
];

export function SiteNav() {
  const pathname = usePathname();
  return (
    <nav className="flex items-center gap-1">
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={clsx(
              "flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition-colors",
              active ? "bg-primary/10 text-primary" : "text-muted hover:text-foreground"
            )}
          >
            <Icon size={18} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
