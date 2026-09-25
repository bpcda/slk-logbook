# Decisioni tecniche

1. Stack: Vite, React, TypeScript e Supabase, come richiesto dal progetto esistente.
2. Il database normalizza gli eventi principali; `maintenance_parts` gestisce la relazione molti-a-molti tra interventi e ricambi.
3. `inspections` è mantenuta perché il workbook dedica un foglio ai controlli periodici, ma non occupa una voce di navigazione v1.
4. I campi diagnostici specifici del workbook restano in `issues`; non vengono compressi nelle note.
5. I valori derivabili (distanze, totali, KPI) non sono trattati come fonte primaria.
6. `source_ref` ha un indice univoco parziale per rendere l'import ripetibile.
7. L'import usa Python standard library: evita una dipendenza runtime solo per leggere XLSX e invia dati via REST come utente autenticato, mai con una service key.
8. La UI usa componenti CRUD configurabili condivisi. È una riduzione di duplicazione, non un framework interno: le differenze tra feature restano nelle configurazioni dei campi.

