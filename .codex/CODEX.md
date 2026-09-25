# CODEX.md — SLK R170 Web Logbook

## Missione

Trasformare il logbook Excel della Mercedes SLK R170 in una piccola applicazione web personale, semplice da usare da desktop e soprattutto da telefono.

Il workbook Excel è la fonte iniziale di verità sul significato dei dati esistenti. **Prima di scrivere il modello dati definitivo, leggere realmente il file `.xlsx` presente nel repository** e documentarne:

- nomi dei fogli;
- intestazioni e tipi di dato;
- formule;
- campi obbligatori/opzionali;
- relazioni implicite tra fogli;
- dati derivati;
- convenzioni su chilometraggio, date, costi, ricambi, viaggi e manutenzione;
- eventuali campi non più utili o ridondanti.

Non inventare una corrispondenza 1:1 con il database prima di aver letto il workbook.

## Obiettivo tecnico

Stack preferito:

- Vite
- React
- TypeScript
- Supabase
  - Postgres
  - Auth
  - Row Level Security
- CSS semplice, senza design system pesanti

Dipendenze ammesse se realmente utili:

- `@supabase/supabase-js`
- `react-router-dom`
- `zod`
- `date-fns`

Evitare framework UI pesanti, animazioni, grafica elaborata e dipendenze non necessarie.

## Priorità

1. Integrità dei dati.
2. Inserimento rapido.
3. Consultazione rapida.
4. Funzionamento mobile.
5. Facilità di manutenzione.
6. Aspetto grafico.

L'app deve essere funzionale, non "bella".

## Vincoli

- Applicazione privata per un solo utilizzatore.
- Accesso protetto da password.
- Nessun dato sensibile o chiave `service_role` nel frontend.
- Usare esclusivamente `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` lato client.
- Tabelle protette con RLS.
- Non lasciare tabelle scrivibili da utenti anonimi.
- Non usare localStorage come database principale.
- Il chilometraggio deve essere sempre coerente e non decrescente, salvo correzione amministrativa esplicita.
- Le eliminazioni devono chiedere conferma.
- Preferire soft-delete solo se utile; altrimenti delete reale va bene per una app single-user.
- Tutti i costi sono in EUR.
- Tutte le distanze sono in km.
- Le quantità carburante sono in litri.

## Accesso

Per mantenere l'interfaccia "solo password" senza implementare un sistema auth custom:

- creare un singolo utente Supabase Auth;
- configurare `VITE_APP_LOGIN_EMAIL` con l'email tecnica del proprietario;
- nella UI mostrare solo il campo password;
- il login chiama:

```ts
supabase.auth.signInWithPassword({
  email: import.meta.env.VITE_APP_LOGIN_EMAIL,
  password
})
```

`VITE_APP_LOGIN_EMAIL` non è un segreto. La sicurezza deriva da Supabase Auth e RLS.

Non implementare una password hardcoded confrontata nel browser.

## Processo obbligatorio

### Fase 1 — Audit Excel

Prima di creare migration SQL:

1. trovare il file `.xlsx`;
2. leggerlo programmaticamente;
3. creare `docs/excel-audit.md`;
4. riportare tabella per tabella:
   - sheet;
   - colonne;
   - tipo;
   - esempio;
   - formula;
   - significato;
   - destinazione proposta nel DB;
5. segnalare anomalie e duplicazioni;
6. solo dopo proporre lo schema definitivo.

Se il repository contiene più Excel, individuare quello del logbook tramite nomi dei fogli e contenuto; se resta ambiguo, fermarsi e chiedere quale sia il file corretto.

### Fase 2 — Schema Supabase

Creare migration SQL versionata.

### Fase 3 — Import

Creare uno script one-shot per importare il contenuto del workbook nel DB.

Requisiti import:

- idempotente o almeno protetto da duplicazioni;
- dry-run;
- report finale;
- righe scartate con motivo;
- nessun silently failing;
- mantenere il dato originale quando una trasformazione non è certa.

### Fase 4 — UI

Implementare prima CRUD e navigazione, poi statistiche.

### Fase 5 — Verifica

Testare almeno:

- login/logout;
- creazione viaggio;
- creazione rifornimento;
- creazione manutenzione;
- inserimento ricambio;
- chilometraggio;
- modifica;
- eliminazione;
- filtro;
- reload pagina;
- responsive mobile;
- RLS da utente anonimo.

## Regole di implementazione

- Componenti piccoli.
- Niente global state library salvo necessità reale.
- Query Supabase centralizzate in `src/lib/` o `src/services/`.
- Tipi DB generati da Supabase quando possibile.
- Form HTML semplici.
- Errori visibili all'utente.
- Loading state visibile.
- Nessun `alert()` per flussi normali se evitabile.
- Non duplicare logica per odometro e costi.
- Evitare over-engineering.

## Definition of Done

L'app è conclusa quando:

- il vecchio Excel è importato;
- è possibile smettere di usare Excel per l'operatività quotidiana;
- ogni evento principale si inserisce da smartphone in meno di circa 30 secondi;
- i dati sono consultabili e filtrabili;
- il backup è possibile tramite Supabase/export;
- nessun utente anonimo può leggere o scrivere i dati;
- il progetto parte con `npm install && npm run dev`;
- README contiene setup locale e deploy.
