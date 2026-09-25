create extension if not exists pgcrypto;

create function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'SLK R170',
  manufacturer text not null default 'Mercedes-Benz',
  model text not null default 'SLK R170',
  chassis text,
  variant text,
  vin text,
  model_year integer check (model_year between 1900 and 2100),
  registration_date date,
  fuel_types text[] not null default array['petrol', 'lpg'],
  current_odometer_km integer not null default 0 check (current_odometer_km >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create table public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  started_at timestamptz not null,
  ended_at timestamptz,
  origin text,
  destination text,
  odometer_start_km integer not null check (odometer_start_km >= 0),
  odometer_end_km integer check (odometer_end_km >= odometer_start_km),
  distance_km integer generated always as (odometer_end_km - odometer_start_km) stored,
  trip_type text,
  primary_fuel_type text check (primary_fuel_type in ('petrol', 'lpg', 'other')),
  reported_consumption numeric(8,3) check (reported_consumption >= 0),
  tolls_eur numeric(10,2) not null default 0 check (tolls_eur >= 0),
  parking_eur numeric(10,2) not null default 0 check (parking_eur >= 0),
  other_cost_eur numeric(10,2) not null default 0 check (other_cost_eur >= 0),
  conditions text,
  anomalies text,
  notes text,
  source text not null default 'web',
  source_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ended_at is null or ended_at >= started_at)
);

create table public.fuel_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  filled_at timestamptz not null,
  odometer_km integer not null check (odometer_km >= 0),
  fuel_type text not null check (fuel_type in ('petrol', 'lpg', 'other')),
  liters numeric(8,3) not null check (liters > 0),
  price_per_liter_eur numeric(8,4) check (price_per_liter_eur >= 0),
  total_cost_eur numeric(10,2) not null check (total_cost_eur >= 0),
  is_full_tank boolean not null default false,
  station text,
  location text,
  notes text,
  source text not null default 'web',
  source_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.maintenance_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  performed_at date not null,
  odometer_km integer check (odometer_km >= 0),
  category text not null,
  title text not null,
  description text,
  performed_by text,
  labor_cost_eur numeric(10,2) not null default 0 check (labor_cost_eur >= 0),
  parts_cost_eur numeric(10,2) not null default 0 check (parts_cost_eur >= 0),
  other_cost_eur numeric(10,2) not null default 0 check (other_cost_eur >= 0),
  total_cost_eur numeric(10,2) not null default 0 check (total_cost_eur >= 0),
  next_due_date date,
  next_due_odometer_km integer check (next_due_odometer_km >= 0),
  removed_part_status text,
  notes text,
  source text not null default 'web',
  source_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.parts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  category text,
  name text not null,
  oem_part_number text,
  manufacturer text,
  aftermarket_part_number text,
  quantity numeric(8,2) not null default 1 check (quantity > 0),
  unit_cost_eur numeric(10,2) check (unit_cost_eur >= 0),
  total_cost_eur numeric(10,2) check (total_cost_eur >= 0),
  purchased_at date,
  installed_at date,
  installed_odometer_km integer check (installed_odometer_km >= 0),
  supplier text,
  status text not null default 'stock' check (status in ('purchased', 'installed', 'stock', 'returned')),
  is_on_board boolean not null default false,
  last_verified_at date,
  notes text,
  source text not null default 'web',
  source_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.maintenance_parts (
  maintenance_event_id uuid not null references public.maintenance_events(id) on delete cascade,
  part_id uuid not null references public.parts(id) on delete restrict,
  quantity numeric(8,2) not null default 1 check (quantity > 0),
  primary key (maintenance_event_id, part_id)
);

create table public.issues (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  detected_at date not null,
  odometer_km integer check (odometer_km >= 0),
  area text,
  title text not null,
  description text,
  dtc_code text,
  occurrence_condition text,
  fuel_type text check (fuel_type in ('petrol', 'lpg', 'other')),
  severity text not null default 'check' check (severity in ('info', 'check', 'urgent')),
  status text not null default 'open' check (status in ('open', 'diagnosing', 'resolved', 'ignored')),
  resolution text,
  resolved_at date,
  resolved_by_maintenance_event_id uuid references public.maintenance_events(id) on delete set null,
  notes text,
  source text not null default 'web',
  source_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  title text not null,
  reminder_type text,
  due_date date,
  due_odometer_km integer check (due_odometer_km >= 0),
  completed_at timestamptz,
  related_maintenance_event_id uuid references public.maintenance_events(id) on delete set null,
  notes text,
  source text not null default 'web',
  source_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (due_date is not null or due_odometer_km is not null)
);

create table public.inspections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  checked_at date not null,
  odometer_km integer check (odometer_km >= 0),
  checks jsonb not null default '{}'::jsonb,
  result text,
  notes text,
  source text not null default 'web',
  source_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index trips_user_date_idx on public.trips (user_id, started_at desc);
create index trips_user_odometer_idx on public.trips (user_id, odometer_end_km desc);
create index fuel_user_date_idx on public.fuel_entries (user_id, filled_at desc);
create index fuel_user_odometer_idx on public.fuel_entries (user_id, odometer_km desc);
create index maintenance_user_date_idx on public.maintenance_events (user_id, performed_at desc);
create index maintenance_user_odometer_idx on public.maintenance_events (user_id, odometer_km desc);
create index issues_user_status_idx on public.issues (user_id, status);
create index reminders_user_due_idx on public.reminders (user_id, due_date);

create unique index trips_source_ref_idx on public.trips (user_id, source_ref) where source_ref is not null;
create unique index fuel_source_ref_idx on public.fuel_entries (user_id, source_ref) where source_ref is not null;
create unique index maintenance_source_ref_idx on public.maintenance_events (user_id, source_ref) where source_ref is not null;
create unique index parts_source_ref_idx on public.parts (user_id, source_ref) where source_ref is not null;
create unique index issues_source_ref_idx on public.issues (user_id, source_ref) where source_ref is not null;
create unique index reminders_source_ref_idx on public.reminders (user_id, source_ref) where source_ref is not null;
create unique index inspections_source_ref_idx on public.inspections (user_id, source_ref) where source_ref is not null;

do $$
declare table_name text;
begin
  foreach table_name in array array['vehicles', 'trips', 'fuel_entries', 'maintenance_events', 'parts', 'issues', 'reminders', 'inspections']
  loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('create policy "owners manage %1$s" on public.%1$I for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)', table_name);
  end loop;
end $$;

alter table public.maintenance_parts enable row level security;
create policy "owners manage maintenance parts" on public.maintenance_parts
for all to authenticated
using (exists (select 1 from public.maintenance_events event where event.id = maintenance_event_id and event.user_id = (select auth.uid())))
with check (
  exists (select 1 from public.maintenance_events event where event.id = maintenance_event_id and event.user_id = (select auth.uid()))
  and exists (select 1 from public.parts part where part.id = part_id and part.user_id = (select auth.uid()))
);

do $$
declare table_name text;
begin
  foreach table_name in array array['vehicles', 'trips', 'fuel_entries', 'maintenance_events', 'parts', 'issues', 'reminders', 'inspections']
  loop
    execute format('create trigger set_%1$s_updated_at before update on public.%1$I for each row execute function public.set_updated_at()', table_name);
  end loop;
end $$;

