-- Template Marketplace — initial Supabase schema
--
-- Supabase is the source of truth. The generated registry (site/registry.json)
-- is a derived public snapshot and never writes back to these tables.
--
-- Apply with `npm run db:migrate` (needs SUPABASE_DB_URL) or paste into the
-- Supabase SQL editor. Safe to re-run: every statement is idempotent.

create extension if not exists pg_trgm;

-- ---------------------------------------------------------------------------
-- Shared helpers
-- ---------------------------------------------------------------------------

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function slugify(value text)
returns text
language sql
immutable
as $$
  select trim(
    both '.' from trim(
      both '-' from regexp_replace(lower(coalesce(value, '')), '[^a-z0-9.]+', '-', 'g')
    )
  );
$$;

-- ---------------------------------------------------------------------------
-- publishers
-- ---------------------------------------------------------------------------

create table if not exists publishers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug = slugify(slug) and length(slug) between 1 and 80),
  name text not null check (length(btrim(name)) between 1 and 120),
  description text not null default '',
  website_url text,
  avatar_url text,
  enabled boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists publishers_updated_at on publishers;
create trigger publishers_updated_at before update on publishers
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug = slugify(slug) and length(slug) between 1 and 80),
  name text not null check (length(btrim(name)) between 1 and 80),
  description text not null default '',
  enabled boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists categories_updated_at on categories;
create trigger categories_updated_at before update on categories
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- tags
-- ---------------------------------------------------------------------------

create table if not exists tags (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug = slugify(slug) and length(slug) between 1 and 80),
  name text not null check (length(btrim(name)) between 1 and 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists tags_updated_at on tags;
create trigger tags_updated_at before update on tags
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- templates
-- ---------------------------------------------------------------------------

create table if not exists templates (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug = slugify(slug) and length(slug) between 1 and 80),
  name text not null check (length(btrim(name)) between 1 and 160),
  description text not null default '',
  long_description text not null default '',
  publisher_id uuid references publishers (id) on delete restrict,
  category_id uuid references categories (id) on delete set null,
  version text not null default '1.0.0',
  license text not null default '',
  repository_url text,
  documentation_url text,
  download_url text,
  preview_image text,
  preview_images text[] not null default '{}',
  sample_file text,
  status text not null default 'draft'
    check (status in ('draft', 'pending', 'published', 'rejected', 'archived')),
  verified boolean not null default false,
  verification_status text not null default 'unverified'
    check (verification_status in ('unverified', 'pending', 'verified', 'rejected')),
  verification_method text not null default 'manual',
  verification_score numeric,
  verification_reason text,
  verified_at timestamptz,
  verification_metadata jsonb not null default '{}'::jsonb,
  featured boolean not null default false,
  views bigint not null default 0 check (views >= 0),
  downloads bigint not null default 0 check (downloads >= 0),
  source text not null default 'manual',
  metadata jsonb not null default '{}'::jsonb,
  search_text text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

drop trigger if exists templates_updated_at on templates;
create trigger templates_updated_at before update on templates
  for each row execute function set_updated_at();

create index if not exists templates_status_idx on templates (status);
create index if not exists templates_category_idx on templates (category_id);
create index if not exists templates_publisher_idx on templates (publisher_id);
create index if not exists templates_featured_idx on templates (featured) where featured;
create index if not exists templates_verified_idx on templates (verified) where verified;
create index if not exists templates_created_at_idx on templates (created_at desc);
create index if not exists templates_published_at_idx on templates (published_at desc);
create index if not exists templates_views_idx on templates (views desc);
create index if not exists templates_downloads_idx on templates (downloads desc);
create index if not exists templates_search_trgm_idx on templates using gin (search_text gin_trgm_ops);

create table if not exists template_tags (
  template_id uuid not null references templates (id) on delete cascade,
  tag_id uuid not null references tags (id) on delete cascade,
  primary key (template_id, tag_id)
);

create index if not exists template_tags_tag_idx on template_tags (tag_id);

-- search_text is a denormalised, lowercased haystack covering the template
-- name, description, long description, category, publisher and tags so the
-- public search endpoint can filter with a single indexed ILIKE.
create or replace function refresh_template_search(target uuid)
returns void
language plpgsql
as $$
declare
  haystack text;
begin
  select lower(concat_ws(' ',
    t.name,
    t.slug,
    t.description,
    t.long_description,
    t.version,
    t.license,
    coalesce(c.name, ''),
    coalesce(c.slug, ''),
    coalesce(p.name, ''),
    coalesce(p.slug, ''),
    coalesce(string_agg(concat(tag.name, ' ', tag.slug), ' '), '')
  ))
  into haystack
  from templates t
  left join categories c on c.id = t.category_id
  left join publishers p on p.id = t.publisher_id
  left join template_tags tt on tt.template_id = t.id
  left join tags tag on tag.id = tt.tag_id
  where t.id = target
  group by t.id, c.name, c.slug, p.name, p.slug;

  update templates set search_text = coalesce(haystack, '') where id = target;
end;
$$;

create or replace function refresh_template_search_for_template()
returns trigger
language plpgsql
as $$
begin
  if tg_table_name = 'template_tags' then
    perform refresh_template_search(coalesce(new.template_id, old.template_id));
  else
    perform refresh_template_search(coalesce(new.id, old.id));
  end if;
  return null;
end;
$$;

drop trigger if exists templates_search_refresh on templates;
create trigger templates_search_refresh
  after insert or update of name, slug, description, long_description, version, license, category_id, publisher_id
  on templates
  for each row execute function refresh_template_search_for_template();

drop trigger if exists template_tags_search_refresh on template_tags;
create trigger template_tags_search_refresh
  after insert or delete on template_tags
  for each row execute function refresh_template_search_for_template();

-- Taxonomy edits re-index every template that uses them.
create or replace function refresh_template_search_for_taxonomy()
returns trigger
language plpgsql
as $$
declare
  template uuid;
begin
  if tg_table_name = 'categories' then
    for template in select id from templates where category_id = coalesce(new.id, old.id) loop
      perform refresh_template_search(template);
    end loop;
  elsif tg_table_name = 'tags' then
    for template in select template_id from template_tags where tag_id = coalesce(new.id, old.id) loop
      perform refresh_template_search(template);
    end loop;
  elsif tg_table_name = 'publishers' then
    for template in select id from templates where publisher_id = coalesce(new.id, old.id) loop
      perform refresh_template_search(template);
    end loop;
  end if;
  return null;
end;
$$;

drop trigger if exists categories_search_refresh on categories;
create trigger categories_search_refresh after insert or update or delete on categories
  for each row execute function refresh_template_search_for_taxonomy();

drop trigger if exists tags_search_refresh on tags;
create trigger tags_search_refresh after insert or update or delete on tags
  for each row execute function refresh_template_search_for_taxonomy();

drop trigger if exists publishers_search_refresh on publishers;
create trigger publishers_search_refresh after insert or update or delete on publishers
  for each row execute function refresh_template_search_for_taxonomy();

-- ---------------------------------------------------------------------------
-- submissions (public, unauthenticated)
-- ---------------------------------------------------------------------------

create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(btrim(name)) between 1 and 160),
  description text not null default '',
  long_description text not null default '',
  category_id uuid references categories (id) on delete set null,
  publisher_id uuid references publishers (id) on delete set null,
  publisher_name text not null default '',
  submitter_name text not null default '',
  submitter_email text,
  version text not null default '1.0.0',
  license text not null default '',
  repository_url text,
  documentation_url text,
  download_url text,
  preview_image text,
  preview_images text[] not null default '{}',
  sample_file text,
  tags text[] not null default '{}',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reject_reason text,
  template_id uuid references templates (id) on delete set null,
  reviewed_at timestamptz,
  reviewed_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists submissions_updated_at on submissions;
create trigger submissions_updated_at before update on submissions
  for each row execute function set_updated_at();

create index if not exists submissions_status_idx on submissions (status, created_at desc);

-- ---------------------------------------------------------------------------
-- analytics
-- ---------------------------------------------------------------------------

create table if not exists analytics_events (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references templates (id) on delete cascade,
  event_type text not null check (event_type in ('view', 'download')),
  occurred_at timestamptz not null default now()
);

create index if not exists analytics_events_template_idx on analytics_events (template_id, event_type, occurred_at desc);
create index if not exists analytics_events_occurred_idx on analytics_events (occurred_at desc);

-- Atomic counter helper used by POST /api/templates/:id/view and /download.
create or replace function increment_template_stat(template_id uuid, stat text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if stat = 'views' then
    update templates set views = views + 1 where id = increment_template_stat.template_id;
  elsif stat = 'downloads' then
    update templates set downloads = downloads + 1 where id = increment_template_stat.template_id;
  else
    raise exception 'unknown statistic: %', stat;
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- settings + admin activity log
-- ---------------------------------------------------------------------------

create table if not exists settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

drop trigger if exists settings_updated_at on settings;
create trigger settings_updated_at before update on settings
  for each row execute function set_updated_at();

create table if not exists admin_activity_logs (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  entity text not null,
  entity_id text,
  actor text not null default 'admin',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_activity_logs_created_idx on admin_activity_logs (created_at desc);
create index if not exists admin_activity_logs_entity_idx on admin_activity_logs (entity, entity_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- The server uses the service-role key and bypasses RLS. The anon key only
-- ever receives the public read policies below, and no write policy at all:
-- submissions and admin writes stay server-side.
-- ---------------------------------------------------------------------------

alter table publishers enable row level security;
alter table categories enable row level security;
alter table tags enable row level security;
alter table templates enable row level security;
alter table template_tags enable row level security;
alter table submissions enable row level security;
alter table analytics_events enable row level security;
alter table settings enable row level security;
alter table admin_activity_logs enable row level security;

drop policy if exists public_read_publishers on publishers;
create policy public_read_publishers on publishers for select using (enabled);

drop policy if exists public_read_categories on categories;
create policy public_read_categories on categories for select using (enabled);

drop policy if exists public_read_tags on tags;
create policy public_read_tags on tags for select using (true);

drop policy if exists public_read_templates on templates;
create policy public_read_templates on templates for select using (status = 'published');

drop policy if exists public_read_template_tags on template_tags;
create policy public_read_template_tags on template_tags for select using (true);

-- Everything else (submissions, settings, activity logs, all writes) has no
-- anon policy: only the service-role key can touch it.
