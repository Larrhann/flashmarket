-- ============================================================
-- VÉRIFICATION D'IDENTITÉ (CNI)
-- À exécuter dans l'éditeur SQL de Supabase
-- ============================================================

alter table profiles
  add column if not exists verification_statut text not null default 'non_verifie'
    check (verification_statut in ('non_verifie', 'en_attente', 'verifie', 'refuse')),
  add column if not exists cni_photo_url text;

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
