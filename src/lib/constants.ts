// Tarifs par défaut (en FCFA) — à ajuster selon ta stratégie de prix.
export const PRICING = {
  FLASH_PUBLICATION: 200, // micro-paiement au-delà de 2 flashs gratuits/semaine
  BOOST_4H: 300,
  BOOST_24H: 1000,
  PRO_MONTHLY: 3000,
  VIP_MONTHLY: 500,
} as const;

export const FREE_FLASH_PER_WEEK = 2;

// Lundi de la semaine en cours, format YYYY-MM-DD (clé de quota hebdomadaire)
export function getCurrentWeekKey(date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay(); // 0 = dimanche
  const diff = (day === 0 ? -6 : 1) - day; // recule jusqu'au lundi
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}
