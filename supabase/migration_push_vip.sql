-- ============================================================
-- NOTIFICATIONS PUSH VIP
-- Stocke les abonnements push (Web Push / VAPID) des utilisateurs.
-- A executer dans l'editeur SQL de Supabase.
-- ============================================================

create table if not exists push_subscriptions (
  id bigint generated always as identity primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_push_subscriptions_user on push_subscriptions (user_id);

alter table push_subscriptions enable row level security;

create policy "push_subscriptions_select_own" on push_subscriptions
  for select using (auth.uid() = user_id);

create policy "push_subscriptions_insert_own" on push_subscriptions
  for insert with check (auth.uid() = user_id);

create policy "push_subscriptions_delete_own" on push_subscriptions
  for delete using (auth.uid() = user_id);
