-- ============================================================
-- VÉRIFICATION D'IDENTITÉ (CNI)
-- À exécuter dans l'éditeur SQL de Supabase
-- ============================================================

alter table profiles
  add column if not exists verification_statut text not null default 'non_verifie'
    check (verification_statut in ('non_verifie', 'en_attente', 'verifie', 'refuse')),
  add column if not exists cni_photo_url text,
  add column if not exists cni_photo_url_verso text,
  add column if not exists is_admin boolean not null default false;

-- Bucket privé pour les photos de CNI (non public)
insert into storage.buckets (id, name, public)
values ('cni-documents', 'cni-documents', false)
on conflict (id) do nothing;

create policy "cni_upload_own" on storage.objects
  for insert with check (bucket_id = 'cni-documents' and owner = auth.uid());

create policy "cni_select_own" on storage.objects
  for select using (bucket_id = 'cni-documents' and owner = auth.uid());

create policy "cni_delete_own" on storage.objects
  for delete using (bucket_id = 'cni-documents' and owner = auth.uid());

-- Permet à un admin de changer le statut de vérification de n'importe quel profil
create or replace function is_admin()
returns boolean
language sql
security definer
stable
as $$
  select coalesce((select is_admin from profiles where id = auth.uid()), false);
$$;

create policy "profiles_update_admin" on profiles for update
  using (is_admin());

-- ============================================================
-- Pour te donner les droits admin (gestion des vérifications CNI) :
-- remplace le numéro par le tien (format +225...) et exécute cette ligne une fois.
-- ============================================================
-- update profiles set is_admin = true where telephone = '+225XXXXXXXXXX';
