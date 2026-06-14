-- ============================================================
-- RUBRIQUES / CATÉGORIES (Flash Marché)
-- À exécuter dans l'éditeur SQL de Supabase
-- ============================================================

alter table posts
  add column if not exists categorie text;
