# SLK R170 Logbook

Applicazione privata, mobile-first, per sostituire il logbook Excel di una Mercedes-Benz SLK R170. Gestisce viaggi, rifornimenti, manutenzione, ricambi, problemi e scadenze con autenticazione e Row Level Security Supabase.

## Requisiti

- Node.js 20+
- npm
- Python 3.10+ (solo per importare il file Excel)
- un progetto Supabase

## Configurazione locale

1. Installa le dipendenze:

   ```bash
   npm install
   ```

2. Nel SQL Editor di Supabase esegui, in ordine, i file in `supabase/migrations/`.
3. In Supabase Auth crea il singolo utente proprietario con email e password. Disabilita le registrazioni pubbliche se non servono.
4. Copia `.env.example` in `.env` e compila:

   ```env
   VITE_SUPABASE_URL=https://PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=...
   VITE_APP_LOGIN_EMAIL=proprietario@example.com
   ```

   L'email tecnica non è un segreto. Non usare mai una chiave `service_role` nel frontend.

5. Avvia l'app:

   ```bash
   npm run dev
   ```

La UI mostra solo la password e ripristina automaticamente la sessione dopo un refresh.

## Import Excel

Il dry-run non richiede credenziali e non scrive dati:

```bash
npm run import:excel -- --file .codex/SLK_R170_Logbook.xlsx --dry-run
```

Il report elenca fogli, righe lette/importabili, destinazioni, problemi e possibili duplicati. Per importare davvero, aggiungi temporaneamente `IMPORT_PASSWORD` a `.env`, poi esegui:

```bash
npm run import:excel -- --file .codex/SLK_R170_Logbook.xlsx
```

Lo script accede come l'utente proprietario tramite Supabase Auth e rispetta RLS. Non usa service key. Ogni riga riceve un `source_ref` univoco: rieseguire il comando ignora i record già presenti. Rimuovi `IMPORT_PASSWORD` da `.env` dopo l'import.

L'audit del workbook e le decisioni di mapping sono in [docs/excel-audit.md](docs/excel-audit.md) e [docs/decisions.md](docs/decisions.md).

## Verifiche

```bash
npm run lint
npm run build
```

Per verificare RLS nel progetto Supabase, una richiesta REST con la sola anon key e senza sessione deve restituire zero righe per tutte le tabelle; un utente autenticato deve vedere esclusivamente righe con il proprio `user_id`. La migration abilita RLS e non crea policy per il ruolo anonimo.

## Deploy

### Vercel o Netlify

1. Collega il repository.
2. Usa `npm run build` come build command e `dist` come directory pubblicata.
3. Configura le tre variabili `VITE_*` del file `.env.example` nel provider.
4. Per il routing client-side configura un rewrite di tutte le rotte a `/index.html`.

Il backend resta su Supabase hosted. Non caricare `.env` nel repository.

## Backup ed export

Supabase consente export/backup del database. Per un export CSV operativo, apri una sezione dell'app e usa l'export della tabella dal dashboard Supabase; l'export CSV integrato nella UI è lasciato fuori dalla v1 perché duplicherebbe una funzione già disponibile al proprietario.
