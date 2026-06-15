-- ============================================================
-- SÉCURITÉ : empêcher un utilisateur de modifier lui-même les
-- champs sensibles de ses publications (boost, statut, date
-- d'expiration, compteurs) via la policy "posts_update_own",
-- tout en laissant fonctionner toggle_like / increment_vues.
-- À exécuter dans l'éditeur SQL de Supabase
-- ============================================================

create or replace function posts_protect_sensitive_columns()
returns trigger
language plpgsql
as $$
begin
  if auth.role() <> 'service_role'
     and coalesce(current_setting('app.bypass_posts_protection', true), 'false') <> 'true' then
    new.is_boosted := old.is_boosted;
    new.boost_expire_at := old.boost_expire_at;
    new.likes_count := old.likes_count;
    new.vues_count := old.vues_count;
    new.statut := old.statut;
    new.expires_at := old.expires_at;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_posts_protect_sensitive_columns on posts;

create trigger trg_posts_protect_sensitive_columns
  before update on posts
  for each row
  execute function posts_protect_sensitive_columns();

-- Autoriser toggle_like / increment_vues à modifier les compteurs
create or replace function toggle_like(p_post_id bigint)
returns boolean
language plpgsql
security definer
as $$
declare
  v_exists boolean;
begin
  perform set_config('app.bypass_posts_protection', 'true', true);

  select exists(select 1 from likes where post_id = p_post_id and user_id = auth.uid()) into v_exists;

  if v_exists then
    delete from likes where post_id = p_post_id and user_id = auth.uid();
    update posts set likes_count = likes_count - 1 where id = p_post_id;
    return false;
  else
    insert into likes (post_id, user_id) values (p_post_id, auth.uid());
    update posts set likes_count = likes_count + 1 where id = p_post_id;
    return true;
  end if;
end;
$$;

create or replace function increment_vues(p_post_id bigint)
returns void
language plpgsql
security definer
as $$
begin
  perform set_config('app.bypass_posts_protection', 'true', true);
  update posts set vues_count = vues_count + 1 where id = p_post_id;
end;
$$;
