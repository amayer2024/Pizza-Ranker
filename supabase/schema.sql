-- Run this in the Supabase SQL editor to share rankings across devices.

create table if not exists places (
  id text primary key,
  name text not null,
  barrio text not null default 'Madrid',
  address text not null default '',
  price_eur numeric not null default 0,
  wait_min int not null default 0,
  lat double precision not null,
  lng double precision not null,
  google_place_id text unique,
  created_at timestamptz default now()
);

create table if not exists ratings (
  id text primary key,
  place_id text not null references places(id) on delete cascade,
  user_name text not null check (user_name in ('Momo','Ronit','Amit')),
  presentacion numeric not null,
  crust numeric not null,
  sabor numeric not null,
  lugar numeric not null,
  precio numeric not null,
  espera numeric not null,
  note text not null default '',
  updated_at timestamptz default now(),
  unique (place_id, user_name)
);

alter table places enable row level security;
alter table ratings enable row level security;

drop policy if exists "public read places" on places;
drop policy if exists "public write places" on places;
drop policy if exists "public read ratings" on ratings;
drop policy if exists "public write ratings" on ratings;

create policy "public read places" on places for select using (true);
create policy "public write places" on places for all using (true) with check (true);
create policy "public read ratings" on ratings for select using (true);
create policy "public write ratings" on ratings for all using (true) with check (true);

insert into places (id, name, barrio, address, price_eur, wait_min, lat, lng) values
  ('canpizza', 'Can Pizza', 'Chamberí', 'C. de Alonso Cano 45', 12.5, 25, 40.4417, -3.698),
  ('grosso', 'Grosso Napoletano', 'Malasaña', 'C. de la Palma 30', 11, 20, 40.4255, -3.7058),
  ('figurato', 'Fratelli Figurato', 'Chamberí', 'C. de Vallehermoso 6', 13.5, 40, 40.4326, -3.708),
  ('nap', 'NAP', 'Chueca', 'C. de Hortaleza 60', 11.5, 15, 40.4239, -3.6974),
  ('demaria', 'Demaría', 'Salamanca', 'C. de Velázquez 22', 16, 20, 40.4251, -3.6837),
  ('sortino', 'Sortino', 'La Latina', 'C. de Toledo 40', 9, 15, 40.4122, -3.7074)
on conflict (id) do nothing;
