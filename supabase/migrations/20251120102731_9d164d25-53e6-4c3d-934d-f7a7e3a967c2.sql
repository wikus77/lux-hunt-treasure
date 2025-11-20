-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- P2: Notification Preferences + Archive + Rewards Claims

-- ========== A) USER_NOTIFICATION_PREFS ==========
-- Permite agli utenti di mutare notifiche per tipo (buzz, reward, system, etc.)
create table if not exists public.user_notification_prefs (
  user_id uuid not null references auth.users(id) on delete cascade,
  notif_type text not null,             -- es: 'buzz','reward','system','mission'
  muted boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, notif_type)
);

alter table public.user_notification_prefs enable row level security;

drop policy if exists "prefs owner rw" on public.user_notification_prefs;
create policy "prefs owner rw"
  on public.user_notification_prefs
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

comment on table public.user_notification_prefs is 'P2: User notification preferences (mute per type)';

-- ========== B) USER_NOTIFICATIONS ARCHIVE COLUMN ==========
-- Aggiunge colonna archived_at per archiviare notifiche senza eliminarle
alter table public.user_notifications
add column if not exists archived_at timestamptz;

comment on column public.user_notifications.archived_at is 'P2: Timestamp when notification was archived by user';

-- ========== C) USER_REWARD_CLAIMS ==========
-- Traccia claim di marker/reward per evitare duplicati concorrenti
create table if not exists public.user_reward_claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reward_key text not null,                   -- es: "marker:<id>" o "qr:<code>" o "prize:<id>"
  claimed_at timestamptz not null default now(),
  metadata jsonb default '{}'::jsonb,         -- Eventuali dati aggiuntivi (tipo reward, amount, etc.)
  unique (user_id, reward_key)
);

alter table public.user_reward_claims enable row level security;

drop policy if exists "claims owner rw" on public.user_reward_claims;
create policy "claims owner rw"
  on public.user_reward_claims
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_reward_key on public.user_reward_claims(reward_key);
create index if not exists idx_user_reward_claims_user_id on public.user_reward_claims(user_id);

comment on table public.user_reward_claims is 'P2: Tracks claimed rewards to prevent duplicate claims (concurrency-safe)';

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
