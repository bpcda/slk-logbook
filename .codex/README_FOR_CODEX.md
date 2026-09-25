# Istruzioni rapide per Codex

Leggere nell'ordine:

1. `CODEX.md`
2. `PRODUCT_SPEC.md`
3. `EXCEL_MIGRATION.md`
4. il file Excel del logbook
5. creare `docs/excel-audit.md`
6. `DATA_MODEL.md`
7. `IMPLEMENTATION_PLAN.md`
8. `UI_SPEC.md`

Non iniziare dalla grafica.

La prima consegna utile deve essere:

- audit Excel;
- schema DB rivisto;
- migration Supabase;
- bootstrap Vite funzionante;
- login;
- import dry-run.

Dopo, implementare i CRUD.

## Decisione stack

Default:

```text
Vite + React + TypeScript + Supabase
```

Non cambiare stack senza una ragione concreta derivata dal repository.

## Comando obiettivo

Alla fine:

```bash
npm install
npm run dev
```

deve avviare l'app.

Il repository deve includere:

```text
.env.example
README.md
supabase/migrations/*
scripts/import-logbook.*
```

## Criterio principale

La domanda da usare per ogni scelta è:

> Questa soluzione rende più rapido e affidabile registrare e consultare la storia dell'auto rispetto all'Excel?

Se no, non implementarla.
