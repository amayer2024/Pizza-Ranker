# PIZZA RANK

Private ranking app for **Momo, Ronit and Amit** — pizzas in Madrid. Mobile and desktop share the same data and the Modernist design (Archivo, square corners, red accent).

## Scoring

Each person scores six axes from 0 to 10. The pizza total is:

- **Sabor 40%**
- **Crust 30%**
- **Lugar 20%**
- **Presentación 10%**

**Precio** and **Tiempo Espera** are stored and shown, but they do not enter the `/10`. One rating per person per place; saving again updates it.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), pick your name, rank pizzas.

Without extra setup the data lives in **this browser** (localStorage) and ships with the six seed pizzerias from the design. With Supabase env vars, everyone shares one ranking.

## Share it (Railway)

1. Run [`supabase/schema.sql`](supabase/schema.sql) in the Supabase SQL editor if you have not already.
2. Create a Railway project from this GitHub repo.
3. Add these **variables** (needed at build time, not only at runtime):

```
NEXT_PUBLIC_SUPABASE_URL=https://issmjvtgdxrxpsstrzik.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key from Supabase → Settings → API Keys>
```

Optional: `HOUSEHOLD_PIN` so a public URL cannot be edited without the piso code.

4. Deploy, then open the Railway URL on each phone → Share → **Add to Home Screen**.

## Place search + map

**Nuevo sitio** searches Madrid by name. If `GOOGLE_PLACES_API_KEY` is set (Places API New), that is used; otherwise OpenStreetMap Nominatim. Confirm a match to fill name, address, barrio and map pin. Precio and espera are scored later, per person.

The map is Leaflet + CARTO light tiles with the square pins from the design.

## Scripts

- `npm run dev` — local app
- `npm run build` — production build
