-- Table des notifications admin (avertissements envoyés aux utilisateurs)
create table if not exists admin_notifications (
  id bigint generated always as identity primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  titre text not null,
  message text not null,
  lu boolean not null default false,
  created_at timestamptz not null default now()
);

alter table admin_notifications enable row level security;

create policy "select_own" on admin_notifications for select using (auth.uid() = user_id);
create policy "update_own" on admin_notifications for update using (auth.uid() = user_id);

create index if not exists idx_admin_notifications_user_id on admin_notifications(user_id);
create index if not exists idx_admin_notifications_lu on admin_notifications(lu) where lu = false;
