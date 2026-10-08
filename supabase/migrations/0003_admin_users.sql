-- ---------------------------------------------------------------------------
-- admin_users table for username + password login
-- ---------------------------------------------------------------------------

create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique check (length(btrim(username)) between 1 and 60),
  password_hash text not null,
  role text not null default 'admin',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists admin_users_updated_at on admin_users;
create trigger admin_users_updated_at before update on admin_users
  for each row execute function set_updated_at();

alter table admin_users enable row level security;
-- No anon policy: only the service-role key can touch admin_users.
