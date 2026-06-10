-- ============================================================
-- FlashMarket — Schéma de base de données Supabase
-- À exécuter dans : Supabase Dashboard > SQL Editor
-- ============================================================

-- Extension pour la géolocalisation (optionnel mais recommandé)
create extension if not exists postgis;

-- ============================================================
-- LOCALISATION : Villes & Quartiers
-- ============================================================
create table villes (
  id bigint generated always as identity primary key,
  nom text not null unique
);

create table quartiers (
  id bigint generated always as identity primary key,
  ville_id bigint not null references villes(id) on delete cascade,
  nom text not null,
  unique (ville_id, nom)
);

-- ============================================================
-- UTILISATEURS (étend auth.users de Supabase)
-- ============================================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nom text not null,
  prenom text not null,
  telephone text not null unique,
  quartier_id bigint references quartiers(id),
  ville_id bigint references villes(id),
  is_pro boolean not null default false,
  pro_expire_at timestamptz,
  telephone_masque boolean not null default false,
  theme text not null default 'system' check (theme in ('light','dark','system')),
  notif_push boolean not null default true,
  notif_sms boolean not null default false,
  vip_alertes boolean not null default false,
  vip_expire_at timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================================
-- PUBLICATIONS (Flash Marché + Agenda + Formations)
-- ============================================================
create table posts (
  id bigint generated always as identity primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  type text not null check (type in ('flash','event','formation')),
  titre text not null,
  description text,
  prix numeric,
  photos text[] default '{}',
  quartier_id bigint not null references quartiers(id),
  ville_id bigint not null references villes(id),
  whatsapp_numero text,
  appel_numero text,
  is_boosted boolean not null default false,
  boost_expire_at timestamptz,
  likes_count integer not null default 0,
  vues_count integer not null default 0,
  statut text not null default 'actif' check (statut in ('actif','expire','supprime')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days')
);

create index idx_posts_feed on posts (quartier_id, statut, created_at desc);
create index idx_posts_boost on posts (quartier_id, is_boosted, created_at desc);

-- ============================================================
-- LIKES (sans commentaires)
-- ============================================================
create table likes (
  id bigint generated always as identity primary key,
  post_id bigint not null references posts(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

-- ============================================================
-- QUOTAS DE PUBLICATION (2 flashs gratuits / semaine)
-- ============================================================
create table publication_quota (
  user_id uuid not null references profiles(id) on delete cascade,
  semaine date not null, -- date du lundi de la semaine en cours
  nb_publies integer not null default 0,
  primary key (user_id, semaine)
);

-- ============================================================
-- ABONNEMENTS (Pro, VIP Alertes)
-- ============================================================
create table subscriptions (
  id bigint generated always as identity primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  type text not null check (type in ('pro','vip_alertes')),
  statut text not null default 'actif' check (statut in ('actif','expire','annule')),
  date_debut timestamptz not null default now(),
  date_fin timestamptz not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- TRANSACTIONS (paiements via CinetPay/Hub2)
-- ============================================================
create table transactions (
  id bigint generated always as identity primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  type text not null check (type in ('publication','boost','abonnement_pro','abonnement_vip')),
  montant numeric not null,
  statut text not null default 'en_attente' check (statut in ('en_attente','reussi','echoue')),
  provider_ref text,
  post_id bigint references posts(id) on delete set null,
  payload jsonb,
  created_at timestamptz not null default now()
);

-- ============================================================
-- DONNÉES DE BASE : Villes & Quartiers (exemple Côte d'Ivoire)
-- ============================================================
insert into villes (nom) values
  ('Abidjan'),
  ('Bouaké'),
  ('Yamoussoukro');

insert into quartiers (ville_id, nom)
select id, q from villes, unnest(array[
  'Cocody','Yopougon','Plateau','Marcory','Treichville','Abobo','Koumassi','Adjamé'
]) as q where villes.nom = 'Abidjan';

insert into quartiers (ville_id, nom)
select id, q from villes, unnest(array[
  'Air France','Belleville','Dar Es Salam','Koko'
]) as q where villes.nom = 'Bouaké';

insert into quartiers (ville_id, nom)
select id, q from villes, unnest(array[
  'Habitat','Millionnaire','Kokrenou'
]) as q where villes.nom = 'Yamoussoukro';

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table profiles enable row level security;
alter table posts enable row level security;
alter table likes enable row level security;
alter table publication_quota enable row level security;
alter table subscriptions enable row level security;
alter table transactions enable row level security;
alter table villes enable row level security;
alter table quartiers enable row level security;

-- Villes/Quartiers : lecture publique
create policy "villes_lecture_publique" on villes for select using (true);
create policy "quartiers_lecture_publique" on quartiers for select using (true);

-- Profiles : chacun lit/modifie son propre profil ; lecture publique limitée via vue (voir plus bas)
create policy "profiles_select_own" on profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);
create policy "profiles_insert_own" on profiles for insert with check (auth.uid() = id);

-- Posts : lecture publique des posts actifs, écriture par le propriétaire
create policy "posts_select_actifs" on posts for select using (statut = 'actif' or auth.uid() = user_id);
create policy "posts_insert_own" on posts for insert with check (auth.uid() = user_id);
create policy "posts_update_own" on posts for update using (auth.uid() = user_id);
create policy "posts_delete_own" on posts for delete using (auth.uid() = user_id);

-- Likes : lecture publique, écriture par soi-même
create policy "likes_select_all" on likes for select using (true);
create policy "likes_insert_own" on likes for insert with check (auth.uid() = user_id);
create policy "likes_delete_own" on likes for delete using (auth.uid() = user_id);

-- Quota : chacun lit/écrit le sien
create policy "quota_select_own" on publication_quota for select using (auth.uid() = user_id);
create policy "quota_upsert_own" on publication_quota for insert with check (auth.uid() = user_id);
create policy "quota_update_own" on publication_quota for update using (auth.uid() = user_id);

-- Subscriptions / Transactions : chacun lit les siennes
create policy "subscriptions_select_own" on subscriptions for select using (auth.uid() = user_id);
create policy "transactions_select_own" on transactions for select using (auth.uid() = user_id);
create policy "transactions_insert_own" on transactions for insert with check (auth.uid() = user_id);

-- ============================================================
-- FONCTIONS : Like / Unlike avec compteur synchronisé
-- ============================================================
create or replace function toggle_like(p_post_id bigint)
returns boolean
language plpgsql
security definer
as $$
declare
  v_exists boolean;
begin
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

-- ============================================================
-- FONCTION : Incrémenter le compteur de vues
-- ============================================================
create or replace function increment_vues(p_post_id bigint)
returns void
language sql
security definer
as $$
  update posts set vues_count = vues_count + 1 where id = p_post_id;
$$;

-- ============================================================
-- STORAGE : Bucket pour les photos des publications
-- ============================================================
insert into storage.buckets (id, name, public)
values ('post-photos', 'post-photos', true)
on conflict (id) do nothing;

create policy "post_photos_lecture_publique" on storage.objects
  for select using (bucket_id = 'post-photos');

create policy "post_photos_upload_auth" on storage.objects
  for insert with check (bucket_id = 'post-photos' and auth.role() = 'authenticated');

create policy "post_photos_delete_own" on storage.objects
  for delete using (bucket_id = 'post-photos' and owner = auth.uid());
