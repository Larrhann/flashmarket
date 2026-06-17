create table if not exists content_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

-- Contenu par défaut de la page "Comment ça marche"
insert into content_settings (key, value) values
('pricing_flash_gratuit', '1 Flash gratuit par semaine, visible 48h'),
('pricing_flash_payant', '100 FCFA — Flash payant visible 7 jours'),
('pricing_boost_journalier', '150 FCFA/jour — Reste en tête du fil sans abonnement'),
('pricing_vip', '1 000 FCFA/mois — SMS promotionnel envoyé à toute la communauté'),
('pricing_pro', '4 000 FCFA/mois — Boost permanent en tête de fil + SMS campagne inclus'),
('howto_intro', 'FlashMarket est le fil local de ton quartier. Publie tes annonces, événements et bons plans en Côte d''Ivoire.')
on conflict (key) do nothing;
