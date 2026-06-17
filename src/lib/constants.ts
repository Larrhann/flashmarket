// Tarifs par défaut (en FCFA) — à ajuster selon ta stratégie de prix.
export const PRICING = {
  FLASH_PUBLICATION: 100, // micro-paiement au-delà du flash gratuit hebdomadaire
  BOOST_DAILY: 150,
  BOOST_MONTHLY: 4000,
  PRO_MONTHLY: 3000,
  VIP_MONTHLY: 1000,
} as const;

export const FREE_FLASH_PER_WEEK = 1;

// Durée de visibilité des Flash : gratuit = 48h, payant = 7 jours
export const FLASH_DURATION_HOURS = {
  FREE: 48,
  PAID: 24 * 7,
} as const;

// Couleurs d'accent personnalisables (Réglages > Apparence)
export const ACCENT_COLORS = [
  { id: "orange", label: "Orange", value: "#ff5722", foreground: "#ffffff" },
  { id: "lime", label: "Lime", value: "#a3e635", foreground: "#14151a" },
  { id: "blue", label: "Bleu", value: "#3b82f6", foreground: "#ffffff" },
  { id: "purple", label: "Violet", value: "#a855f7", foreground: "#ffffff" },
  { id: "red", label: "Rouge", value: "#ef4444", foreground: "#ffffff" },
] as const;

export type AccentColorId = (typeof ACCENT_COLORS)[number]["id"];

// Rubriques (catégories) pour les publications de type "Flash Marché"
export const CATEGORIES = [
  // Télécom & Informatique
  { id: "telephones", label: "Téléphones & Tablettes" },
  { id: "informatique", label: "Informatique & PC" },
  { id: "tv_electronique", label: "TV & Électronique" },
  { id: "accessoires_tech", label: "Accessoires Tech" },
  // Électroménager & Maison
  { id: "electromenager", label: "Électroménager" },
  { id: "engins_electriques", label: "Engins Électriques & Groupes" },
  { id: "panneaux_solaires", label: "Panneaux Solaires & Énergie" },
  { id: "meubles", label: "Meubles & Décoration" },
  { id: "cuisine", label: "Cuisine & Arts de la table" },
  { id: "literie", label: "Literie & Linge de maison" },
  { id: "jardin", label: "Jardin & Extérieur" },
  // Immobilier
  { id: "maisons", label: "Maisons & Villas" },
  { id: "appartements", label: "Appartements" },
  { id: "terrains", label: "Terrains & Parcelles" },
  { id: "bureaux_commerces", label: "Bureaux & Locaux commerciaux" },
  { id: "location", label: "Location / Colocation" },
  // Véhicules
  { id: "voitures", label: "Voitures" },
  { id: "motos", label: "Motos & Scooters" },
  { id: "camions", label: "Camions & Utilitaires" },
  { id: "engins_chantier", label: "Engins de Chantier" },
  { id: "pieces_auto", label: "Pièces Auto & Moto" },
  { id: "bateaux", label: "Bateaux & Pirogues" },
  // Mode & Beauté
  { id: "mode_homme", label: "Mode Homme" },
  { id: "mode_femme", label: "Mode Femme" },
  { id: "mode_enfant", label: "Mode Enfant" },
  { id: "chaussures", label: "Chaussures & Maroquinerie" },
  { id: "bijoux", label: "Bijoux & Montres" },
  { id: "beaute_hygiene", label: "Beauté & Soins" },
  { id: "perruques_cheveux", label: "Perruques & Cheveux" },
  { id: "parfums", label: "Parfums & Cosmétiques" },
  // Alimentation
  { id: "alimentation", label: "Alimentation & Épicerie" },
  { id: "fruits_legumes", label: "Fruits, Légumes & Produits locaux" },
  { id: "boissons", label: "Boissons" },
  { id: "restauration", label: "Restauration & Traiteur" },
  // Construction & BTP
  { id: "materiaux", label: "Matériaux de Construction" },
  { id: "outillage", label: "Outillage & Bricolage" },
  { id: "plomberie", label: "Plomberie & Sanitaire" },
  { id: "electricite", label: "Électricité & Câblage" },
  // Agriculture & Élevage
  { id: "agriculture", label: "Agriculture & Maraîchage" },
  { id: "elevage", label: "Élevage & Animaux" },
  { id: "peche", label: "Pêche & Aquaculture" },
  { id: "semences", label: "Semences & Intrants agricoles" },
  // Services & Emploi
  { id: "emploi", label: "Offres d'emploi" },
  { id: "services_dom", label: "Services à domicile" },
  { id: "transport", label: "Transport & Livraison" },
  { id: "informatique_serv", label: "Informatique & Web (services)" },
  { id: "couture_mode_serv", label: "Couture & Stylisme" },
  { id: "coiffure_serv", label: "Coiffure & Esthétique" },
  { id: "reparation", label: "Réparation & Maintenance" },
  { id: "nettoyage", label: "Nettoyage & Entretien" },
  // Santé & Bien-être
  { id: "sante", label: "Santé & Pharmacie" },
  { id: "sport", label: "Sport & Fitness" },
  { id: "bien_etre", label: "Bien-être & Médecine douce" },
  // Loisirs & Culture
  { id: "loisirs", label: "Loisirs & Divertissement" },
  { id: "livres_musique", label: "Livres, Musique & Films" },
  { id: "instruments", label: "Instruments de musique" },
  { id: "jeux_jouets", label: "Jeux & Jouets" },
  { id: "art_artisanat", label: "Art & Artisanat ivoirien" },
  // Bébés & Enfants
  { id: "bebes", label: "Bébés & Puériculture" },
  { id: "jeux_enfants", label: "Jeux & Fournitures scolaires" },
  // Boutiques
  { id: "boutiques", label: "Boutiques Officielles" },
  { id: "autres", label: "Divers" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

// Lundi de la semaine en cours, format YYYY-MM-DD (clé de quota hebdomadaire)
export function getCurrentWeekKey(date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay(); // 0 = dimanche
  const diff = (day === 0 ? -6 : 1) - day; // recule jusqu'au lundi
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}
