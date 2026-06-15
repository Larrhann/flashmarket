-- ============================================================
-- EXPIRATION AUTOMATIQUE DES PUBLICATIONS
-- Passe le statut des posts a 'expire' une fois expires_at depasse,
-- ce qui les retire du fil (policy posts_select_actifs).
-- A executer dans l'editeur SQL de Supabase.
-- ============================================================

create extension if not exists pg_cron;

create or replace function expire_old_posts()
returns void
language sql
security definer
as $$
  update posts
  set statut = 'expire'
  where statut = 'actif' and expires_at < now();
$$;

select cron.unschedule(jobid) from cron.job where jobname = 'expire_old_posts_hourly';

select cron.schedule(
  'expire_old_posts_hourly',
  '0 * * * *',
  $$select expire_old_posts();$$
);
