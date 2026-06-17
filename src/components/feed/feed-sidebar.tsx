"use client";

import clsx from "clsx";
import {
  LayoutGrid, ShoppingBag, CalendarDays, GraduationCap,
  Smartphone, Tv, Refrigerator, Sofa, Laptop, Shirt,
  ShoppingCart, Sparkles, Baby, Tractor, MoreHorizontal,
  Store, Zap, Sun, UtensilsCrossed, BedDouble, Trees,
  Home, Building2, MapPin, Car, Bike, Truck, HardHat, Wrench, Sailboat,
  ShoppingBasket, Package, Scissors, Gem, Flower2, Apple, Coffee,
  ChefHat, Construction, Plug, Fish, Leaf, Briefcase, Send, Monitor,
  Palette, BookOpen, Music, GamepadIcon, Heart, Shield, Dumbbell,
  TicketCheck, Gamepad2, PaintbrushIcon,
} from "lucide-react";
import { CATEGORIES, type CategoryId } from "@/lib/constants";
import type { FeedFilter } from "./filter-bar";

const categories: { value: FeedFilter; label: string; icon: typeof LayoutGrid }[] = [
  { value: "tout", label: "Tout", icon: LayoutGrid },
  { value: "flash", label: "Flash Marché", icon: ShoppingBag },
  { value: "event", label: "Événements & Sorties", icon: CalendarDays },
  { value: "formation", label: "Formations & Services", icon: GraduationCap },
];

const rubriqueIcons: Record<CategoryId, typeof LayoutGrid> = {
  telephones: Smartphone,
  informatique: Laptop,
  tv_electronique: Tv,
  accessoires_tech: Monitor,
  electromenager: Refrigerator,
  engins_electriques: Zap,
  panneaux_solaires: Sun,
  meubles: Sofa,
  cuisine: UtensilsCrossed,
  literie: BedDouble,
  jardin: Trees,
  maisons: Home,
  appartements: Building2,
  terrains: MapPin,
  bureaux_commerces: Briefcase,
  location: Building2,
  voitures: Car,
  motos: Bike,
  camions: Truck,
  engins_chantier: HardHat,
  pieces_auto: Wrench,
  bateaux: Sailboat,
  mode_homme: Shirt,
  mode_femme: ShoppingCart,
  mode_enfant: Baby,
  chaussures: Package,
  bijoux: Gem,
  beaute_hygiene: Sparkles,
  perruques_cheveux: Scissors,
  parfums: Flower2,
  alimentation: ShoppingBasket,
  fruits_legumes: Apple,
  boissons: Coffee,
  restauration: ChefHat,
  materiaux: Construction,
  outillage: Wrench,
  plomberie: Package,
  electricite: Plug,
  agriculture: Tractor,
  elevage: Leaf,
  peche: Fish,
  semences: Leaf,
  emploi: Briefcase,
  services_dom: Home,
  transport: Truck,
  informatique_serv: Monitor,
  couture_mode_serv: Scissors,
  coiffure_serv: Sparkles,
  reparation: Wrench,
  nettoyage: Package,
  sante: Heart,
  sport: Dumbbell,
  bien_etre: Shield,
  loisirs: TicketCheck,
  livres_musique: BookOpen,
  instruments: Music,
  jeux_jouets: Gamepad2,
  art_artisanat: PaintbrushIcon,
  bebes: Baby,
  jeux_enfants: Gamepad2,
  boutiques: Store,
  autres: MoreHorizontal,
};

interface FeedSidebarProps {
  active: FeedFilter;
  onChange: (f: FeedFilter) => void;
  counts: { flash: number; event: number; formation: number; total: number };
  activeCategorie: string | null;
  onChangeCategorie: (c: string | null) => void;
}

export function FeedSidebar({
  active,
  onChange,
  counts,
  activeCategorie,
  onChangeCategorie,
}: FeedSidebarProps) {
  const countFor: Record<FeedFilter, number> = {
    tout: counts.total,
    flash: counts.flash,
    event: counts.event,
    formation: counts.formation,
  };

  return (
    <nav className="sticky top-20 rounded-2xl border border-border bg-card p-3">
      <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-muted">
        Catégories
      </p>
      <ul className="space-y-1">
        {categories.map(({ value, label, icon: Icon }) => (
          <li key={value}>
            <button
              onClick={() => onChange(value)}
              className={clsx(
                "flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                active === value
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-background"
              )}
            >
              <span className="flex items-center gap-2">
                <Icon size={18} />
                {label}
              </span>
              <span
                className={clsx(
                  "rounded-full px-2 py-0.5 text-xs font-semibold",
                  active === value
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-background text-muted"
                )}
              >
                {countFor[value]}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <p className="mt-3 px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-muted">
        Rubriques
      </p>
      <ul className="space-y-1 max-h-[60vh] overflow-y-auto pr-1">
        <li>
          <button
            onClick={() => onChangeCategorie(null)}
            className={clsx(
              "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
              activeCategorie === null
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-background"
            )}
          >
            <LayoutGrid size={18} />
            Toutes les rubriques
          </button>
        </li>
        {CATEGORIES.map(({ id, label }) => {
          const Icon = rubriqueIcons[id] ?? MoreHorizontal;
          return (
            <li key={id}>
              <button
                onClick={() => onChangeCategorie(id)}
                className={clsx(
                  "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                  activeCategorie === id
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-background"
                )}
              >
                <Icon size={18} />
                {label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
