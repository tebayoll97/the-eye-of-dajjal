-- DAJJAL ID: verified multi-account Darkwar linking foundation.
-- Game identities may only be created/verified by a trusted server after an
-- officially supported Darkwar authorization flow succeeds. Never accept
-- player-submitted profile data as verified.

create table if not exists public.game_accounts (
  id uuid primary key default gen_random_uuid(),
  game_provider text not null default 'darkwar',
  game_player_id text not null,
  server_number integer not null,
  player_name text,
  avatar_url text,
  player_level integer,
  verification_status text not null default 'unverified'
    check (verification_status in ('unverified', 'verified', 'revoked')),
  verified_at timestamptz,
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint game_accounts_provider_player_server_unique
    unique (game_provider, game_player_id, server_number),
  constraint game_accounts_player_id_nonempty check (length(trim(game_player_id)) > 0),
  constraint game_accounts_server_positive check (server_number > 0)
);

create table if not exists public.user_game_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  game_account_id uuid not null references public.game_accounts(id) on delete cascade,
  linked_at timestamptz not null default now(),
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  constraint user_game_accounts_one_owner_per_game unique (game_account_id),
  constraint user_game_accounts_user_game_unique unique (user_id, game_account_id)
);

create unique index if not exists user_game_accounts_one_primary_per_user
  on public.user_game_accounts(user_id) where is_primary = true;

create table if not exists public.game_link_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null default 'darkwar',
  state_hash text not null unique,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'verified', 'denied', 'expired', 'failed')),
  expires_at timestamptz not null default (now() + interval '5 minutes'),
  completed_at timestamptz,
  game_account_id uuid references public.game_accounts(id) on delete set null,
  failure_code text,
  created_at timestamptz not null default now(),
  constraint game_link_transactions_state_hash_nonempty check (length(state_hash) >= 32)
);

create index if not exists game_link_transactions_user_created_idx
  on public.game_link_transactions(user_id, created_at desc);
create index if not exists game_link_transactions_expiry_idx
  on public.game_link_transactions(expires_at) where status = 'pending';
create index if not exists user_game_accounts_user_idx
  on public.user_game_accounts(user_id, linked_at desc);

alter table public.game_accounts enable row level security;
alter table public.user_game_accounts enable row level security;
alter table public.game_link_transactions enable row level security;

create policy "Users can view game accounts linked to them"
  on public.game_accounts for select to authenticated
  using (exists (
    select 1 from public.user_game_accounts uga
    where uga.game_account_id = game_accounts.id
      and uga.user_id = (select auth.uid())
  ));

create policy "Users can view their game links"
  on public.user_game_accounts for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Users can unlink their own game accounts"
  on public.user_game_accounts for delete to authenticated
  using (user_id = (select auth.uid()));

create policy "Users can view their own link transactions"
  on public.game_link_transactions for select to authenticated
  using (user_id = (select auth.uid()));

revoke all on public.game_accounts from anon, authenticated;
revoke all on public.user_game_accounts from anon, authenticated;
revoke all on public.game_link_transactions from anon, authenticated;

grant select on public.game_accounts to authenticated;
grant select, delete on public.user_game_accounts to authenticated;
grant select on public.game_link_transactions to authenticated;

comment on table public.game_accounts is
  'Canonical Dark War game identities. Only a trusted server may create or verify these after official game authorization.';
comment on table public.user_game_accounts is
  'Links one verified game identity to one DAJJAL ID user. Multiple game identities per website user are supported.';
comment on table public.game_link_transactions is
  'Short-lived server-created linking attempts. Stores a state hash, never raw state or game credentials.';
