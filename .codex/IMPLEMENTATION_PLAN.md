# Implementation plan

## Milestone 0 — Ispezione repository

- [ ] individuare il workbook del logbook;
- [ ] verificare se esiste già un progetto frontend;
- [ ] verificare eventuali file `.env.example`;
- [ ] non leggere o stampare segreti reali.

Output:
- `docs/excel-audit.md`
- `docs/decisions.md`

## Milestone 1 — Bootstrap

Se non esiste progetto:

```bash
npm create vite@latest . -- --template react-ts
npm install
npm install @supabase/supabase-js react-router-dom zod date-fns
```

Non installare altro senza necessità concreta.

Struttura suggerita:

```text
src/
  components/
  pages/
  features/
    trips/
    fuel/
    maintenance/
    parts/
    issues/
    reminders/
  lib/
    supabase.ts
    auth.ts
    format.ts
    odometer.ts
  types/
  App.tsx
  main.tsx
supabase/
  migrations/
scripts/
docs/
```

## Milestone 2 — Supabase

- [ ] creare migration;
- [ ] creare RLS;
- [ ] creare `.env.example`;
- [ ] implementare client Supabase;
- [ ] login solo password in UI;
- [ ] session restore;
- [ ] logout;
- [ ] protected routes.

`.env.example`:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_APP_LOGIN_EMAIL=
```

## Milestone 3 — Import Excel

Scrivere `scripts/import-logbook.ts` oppure script equivalente.

Caratteristiche:

```bash
npm run import:excel -- --file ./path/logbook.xlsx --dry-run
npm run import:excel -- --file ./path/logbook.xlsx
```

Il dry-run deve stampare:

- sheet trovati;
- righe lette;
- righe importabili;
- righe problematiche;
- mapping destinazione;
- possibili duplicati.

Non caricare nel DB righe ambigue senza segnalarle.

## Milestone 4 — CRUD fondamentale

Ordine:

1. Dashboard base
2. Viaggi
3. Rifornimenti
4. Manutenzione
5. Ricambi
6. Problemi
7. Scadenze

Per ogni feature:

- list;
- create;
- edit;
- detail essenziale;
- delete;
- filtri.

## Milestone 5 — Dashboard

Metriche:

- odometro corrente;
- km registrati;
- costi totali;
- costo carburante;
- costo manutenzione;
- ultimo viaggio;
- ultimo rifornimento;
- ultimo intervento;
- problemi aperti;
- scadenze vicine.

Solo dopo che i dati sono corretti aggiungere eventuali grafici.

Grafici opzionali v1:

- costi mensili;
- km mensili;
- prezzo carburante;
- consumo.

Massimo pochi grafici semplici.

## Milestone 6 — UX mobile

Testare viewport circa 390px.

Requisiti:

- form a colonna singola;
- input numerici con tastiera numerica;
- `inputMode="decimal"` o `"numeric"`;
- bottoni abbastanza grandi;
- niente tabelle orizzontali ingestibili: su mobile usare card/list rows;
- quick add accessibile.

## Milestone 7 — Controlli di qualità

- [ ] `npm run build`;
- [ ] TypeScript senza errori;
- [ ] gestione errori Supabase;
- [ ] auth restore dopo refresh;
- [ ] RLS verificata;
- [ ] nessun service key nel browser;
- [ ] nessun dato mock residuo;
- [ ] import documentato;
- [ ] README aggiornato.

## Milestone 8 — Deploy

Target semplice:

- Vercel oppure Netlify per frontend;
- Supabase hosted per backend.

Configurare env nel provider.

Non mettere `.env` nel repository.

## Backlog successivo

Solo dopo v1:

- PWA;
- foto/ricevute;
- OCR ricevute;
- import automatico CSV;
- notifiche manutenzione;
- mappe;
- OBD/telemetria;
- multi-veicolo;
- logbook viaggio Capo Nord dedicato.
