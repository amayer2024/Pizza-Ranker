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
  ('canpizza', 'Can Pizza Chamberí', 'Chamberí', 'C. de Santa Engracia 53', 0, 0, 40.4325951, -3.6980319)
on conflict (id) do update set
  name = excluded.name,
  barrio = excluded.barrio,
  address = excluded.address,
  lat = excluded.lat,
  lng = excluded.lng;

insert into ratings (id, place_id, user_name, presentacion, crust, sabor, lugar, precio, espera, note, updated_at) values
  ('canpizza-ronit', 'canpizza', 'Ronit', 7, 6.8, 6.2, 9, 15, 30, '', '2026-09-13T21:30:00.000Z'),
  ('canpizza-momo', 'canpizza', 'Momo', 7.8, 9, 8.8, 9.3, 15, 30, '', '2026-09-13T21:31:00.000Z'),
  ('canpizza-amit', 'canpizza', 'Amit', 7.7, 8.5, 8.2, 9.2, 13.9, 30, '', '2026-09-13T21:45:00.000Z')
on conflict (place_id, user_name) do update set
  presentacion = excluded.presentacion,
  crust = excluded.crust,
  sabor = excluded.sabor,
  lugar = excluded.lugar,
  precio = excluded.precio,
  espera = excluded.espera,
  updated_at = excluded.updated_at;
