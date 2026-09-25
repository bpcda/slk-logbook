# Data model proposto

> Questo schema è una proposta iniziale. Codex deve prima eseguire l'audit del workbook e può modificarlo se l'Excel contiene esigenze non rappresentate qui.

## Principi

- UUID come primary key.
- `created_at` e `updated_at` ovunque sia utile.
- `user_id` per tutte le entità private anche se oggi esiste un solo utente.
- RLS basata su `auth.uid() = user_id`.
- Numeri monetari con `numeric`, non floating point.
- Odometro come integer >= 0.
- Date reali in `date` o `timestamptz`.
- Vincoli DB per valori impossibili.

## vehicle

Una sola riga in v1.

Campi suggeriti:

```text
id uuid pk
user_id uuid not null
name text
manufacturer text
model text
chassis text
variant text
vin text
model_year integer
registration_date date nullable
fuel_types text[]
current_odometer_km integer
notes text
created_at timestamptz
updated_at timestamptz
```

Valori iniziali possono essere compilati dall'utente dopo import.

## trips

```text
id uuid pk
user_id uuid not null
vehicle_id uuid fk
started_at timestamptz
ended_at timestamptz nullable
origin text nullable
destination text nullable
odometer_start_km integer
odometer_end_km integer nullable
distance_km integer generated/calculated
trip_type text nullable
tolls_eur numeric(10,2) default 0
parking_eur numeric(10,2) default 0
notes text nullable
source text default 'web'
source_ref text nullable
created_at timestamptz
updated_at timestamptz
```

`distance_km = odometer_end_km - odometer_start_km` quando entrambi presenti.

## fuel_entries

```text
id uuid pk
user_id uuid not null
vehicle_id uuid fk
filled_at timestamptz
odometer_km integer
fuel_type text check in ('petrol','lpg','other')
liters numeric(8,3)
price_per_liter_eur numeric(8,4) nullable
total_cost_eur numeric(10,2)
is_full_tank boolean default false
station text nullable
location text nullable
notes text nullable
source text default 'web'
source_ref text nullable
created_at timestamptz
updated_at timestamptz
```

Non memorizzare consumi derivati se sono facilmente ricalcolabili.

## maintenance_events

```text
id uuid pk
user_id uuid not null
vehicle_id uuid fk
performed_at date
odometer_km integer nullable
category text
title text
description text nullable
performed_by text nullable
labor_cost_eur numeric(10,2) default 0
parts_cost_eur numeric(10,2) default 0
other_cost_eur numeric(10,2) default 0
total_cost_eur numeric(10,2)
next_due_date date nullable
next_due_odometer_km integer nullable
notes text nullable
source text default 'web'
source_ref text nullable
created_at timestamptz
updated_at timestamptz
```

Valutare se `total_cost_eur` sia generato oppure calcolato nell'app.

## parts

```text
id uuid pk
user_id uuid not null
vehicle_id uuid fk
name text
oem_part_number text nullable
manufacturer text nullable
aftermarket_part_number text nullable
quantity numeric(8,2) default 1
unit_cost_eur numeric(10,2) nullable
total_cost_eur numeric(10,2) nullable
purchased_at date nullable
installed_at date nullable
installed_odometer_km integer nullable
supplier text nullable
status text check in ('purchased','installed','stock','returned')
notes text nullable
created_at timestamptz
updated_at timestamptz
```

## maintenance_parts

Join table:

```text
maintenance_event_id uuid fk
part_id uuid fk
quantity numeric(8,2)
primary key (maintenance_event_id, part_id)
```

## issues

```text
id uuid pk
user_id uuid not null
vehicle_id uuid fk
detected_at date
odometer_km integer nullable
area text nullable
title text
description text nullable
severity text check in ('info','check','urgent')
status text check in ('open','diagnosing','resolved','ignored')
resolved_at date nullable
resolved_by_maintenance_event_id uuid nullable fk
notes text nullable
created_at timestamptz
updated_at timestamptz
```

## reminders

```text
id uuid pk
user_id uuid not null
vehicle_id uuid fk
title text
reminder_type text nullable
due_date date nullable
due_odometer_km integer nullable
completed_at timestamptz nullable
related_maintenance_event_id uuid nullable fk
notes text nullable
created_at timestamptz
updated_at timestamptz
```

Almeno uno tra `due_date` e `due_odometer_km` deve essere valorizzato.

## odometer_entries

Valutare dopo audit Excel.

Può essere utile se il workbook ha registrazioni km che non corrispondono ad altri eventi:

```text
id uuid pk
user_id uuid not null
vehicle_id uuid fk
recorded_at timestamptz
odometer_km integer
reason text nullable
notes text nullable
created_at timestamptz
```

Non creare questa tabella se è ridondante rispetto ai dati reali.

## attachments — opzionale v2

Non implementare in v1 salvo che il workbook dimostri che ricevute/documenti sono una parte essenziale.

Se implementata:

- Supabase Storage bucket privato;
- tabella metadata;
- signed URL;
- RLS/storage policies.

## RLS

Pattern per ogni tabella:

```sql
alter table public.trips enable row level security;

create policy "users can read own trips"
on public.trips
for select
using (auth.uid() = user_id);

create policy "users can insert own trips"
on public.trips
for insert
with check (auth.uid() = user_id);

create policy "users can update own trips"
on public.trips
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "users can delete own trips"
on public.trips
for delete
using (auth.uid() = user_id);
```

Applicare la stessa logica alle altre entità.

## Indici

Creare almeno indici su:

- `(user_id, performed_at desc)`
- `(user_id, filled_at desc)`
- `(user_id, started_at desc)`
- `(user_id, status)`
- odometro per le tabelle che lo usano.

Non creare indici prematuramente su ogni colonna.
