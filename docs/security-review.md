# Revisione minima di sicurezza

Verifica eseguita il 26 settembre 2026.

- Nessuna password o credenziale reale è presente nei file versionati. `.env.example` contiene solo valori vuoti o di esempio.
- Il frontend usa esclusivamente `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`. Non usa né accetta una chiave `service_role`.
- `.gitignore` esclude `.env` e `.env.*`, mantenendo versionabile soltanto `.env.example`.
- Tutte le query applicative passano dal client Supabase autenticato. La migration abilita RLS su ogni tabella applicativa.
- Le policy consentono al ruolo `authenticated` di operare soltanto sulle righe con `user_id = auth.uid()`. La tabella di relazione `maintenance_parts` verifica la proprietà tramite le tabelle collegate.
- Il processo di login e l'importatore non stampano password, token o chiavi nei log.

Non sono emersi problemi di sicurezza che richiedano una nuova migration SQL.
