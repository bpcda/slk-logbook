# Product spec — SLK R170 Logbook

## 1. Scopo

Applicazione personale per mantenere lo storico completo della Mercedes SLK R170.

Deve sostituire il foglio Excel come strumento operativo. Excel può restare un formato di import/export, ma non deve essere necessario per l'uso quotidiano.

## 2. Casi d'uso principali

### Dashboard

Mostrare immediatamente:

- chilometraggio attuale;
- km percorsi registrati;
- ultimo viaggio;
- ultimo rifornimento;
- ultimo intervento;
- costo totale documentato;
- costo manutenzione;
- costo carburante;
- interventi aperti / problemi da controllare;
- prossime scadenze basate su km o data.

Non serve una dashboard grafica sofisticata. Card numeriche e tabelle sono sufficienti.

### Viaggi

Registrare:

- data/ora partenza;
- data/ora arrivo;
- luogo partenza;
- destinazione;
- km iniziali;
- km finali;
- km percorsi calcolati;
- tipologia viaggio;
- note;
- eventuale costo pedaggi/parcheggi;
- eventuali anomalie osservate durante il viaggio.

Uso desiderato:

durante un viaggio ordinario deve bastare annotare rapidamente km e informazioni essenziali; i dettagli possono essere completati dopo.

### Rifornimenti

Supportare almeno:

- benzina;
- GPL.

Campi:

- data;
- odometro;
- carburante;
- litri;
- prezzo/litro;
- costo totale;
- pieno sì/no;
- distributore/località opzionale;
- note.

Calcolare quando possibile:

- consumo tra pieni;
- km/l;
- l/100 km;
- costo/km;
- confronto benzina/GPL.

Non produrre consumi "precisi" quando i dati non permettono un calcolo attendibile. Un parziale deve essere marcato come tale.

### Manutenzione e riparazioni

Registrare:

- data;
- km;
- categoria;
- descrizione;
- lavoro eseguito;
- officina / esecutore;
- costo manodopera;
- costo ricambi;
- costo totale;
- note;
- scadenza successiva per data;
- scadenza successiva per km.

Categorie esemplificative:

- motore;
- accensione;
- alimentazione;
- GPL;
- raffreddamento;
- trasmissione;
- freni;
- sospensioni;
- pneumatici;
- elettrico;
- PSE/chiusura centralizzata;
- capote idraulica;
- carrozzeria;
- interni;
- climatizzazione;
- revisione/collaudo;
- altro.

### Ricambi

Storico dei componenti acquistati/installati:

- nome;
- codice OEM;
- produttore;
- codice aftermarket;
- quantità;
- prezzo unitario;
- costo;
- data acquisto;
- data installazione;
- km installazione;
- fornitore;
- collegamento opzionale all'intervento;
- stato: acquistato / installato / scorta / reso;
- note.

Un intervento può avere più ricambi.

### Problemi / osservazioni

Registro separato per problemi ancora non risolti:

- titolo;
- data rilevazione;
- km;
- area;
- severità semplice: info / da controllare / urgente;
- descrizione;
- stato: aperto / in diagnosi / risolto / ignorato;
- intervento che lo ha risolto;
- note.

Esempi reali del tipo di informazione che deve poter gestire:

- misfire;
- perdita capote;
- perdita circuito pneumatico;
- livello liquido;
- rumori;
- anomalie in viaggio.

### Scadenze

Scadenze manuali o generate da manutenzione:

- titolo;
- data;
- km;
- tipo;
- completata sì/no.

La dashboard evidenzia una scadenza se:

- mancano pochi giorni;
- oppure il chilometraggio corrente è vicino alla soglia.

La soglia può essere semplice e configurabile.

## 3. Navigazione minima

Desktop:

- Dashboard
- Viaggi
- Rifornimenti
- Manutenzione
- Ricambi
- Problemi
- Scadenze
- Impostazioni

Mobile:

stesse sezioni, menu compatto.

Aggiungere un pulsante sempre facile da raggiungere:

`+ Registra`

che permetta di scegliere rapidamente:

- viaggio;
- rifornimento;
- intervento;
- problema.

## 4. Ricerca e filtri

Ogni tabella deve permettere almeno:

- ricerca testuale;
- intervallo data;
- intervallo km se pertinente;
- categoria/tipo;
- ordinamento più recente/più vecchio.

## 5. Modifica dati

Ogni record deve poter essere:

- aperto;
- modificato;
- eliminato.

Prima di eliminare chiedere conferma.

## 6. Regole chilometraggio

L'odometro è centrale.

Ogni record che rappresenta un evento sull'auto può avere un valore `odometer_km`.

Il "chilometraggio attuale" è normalmente il massimo valore attendibile tra gli eventi, oppure un valore aggiornato manualmente se più recente.

Segnalare all'utente se sta inserendo un odometro inferiore a un evento cronologicamente precedente.

Non impedire correzioni storiche legittime: mostrare warning e consentire conferma.

## 7. Import Excel

Il workbook esistente deve essere analizzato, non semplicemente copiato.

Obiettivi:

- preservare lo storico;
- eliminare duplicazioni strutturali;
- distinguere dati originari da dati derivati;
- non importare celle puramente decorative;
- non importare formule se il dato può essere ricalcolato dall'app;
- documentare qualsiasi campo non migrato.

Conservare nel record importato, quando utile:

- `source = 'excel_import'`;
- eventuale identificativo/riga originale per audit.

## 8. Export

Prevedere export CSV almeno per:

- viaggi;
- rifornimenti;
- manutenzioni;
- ricambi.

Opzionale in seconda fase:

- export completo JSON;
- nuovo XLSX.

## 9. Non obiettivi iniziali

Non servono in v1:

- multiutente;
- ruoli complessi;
- social;
- mappe;
- GPS automatico;
- telemetria OBD;
- upload foto obbligatorio;
- PWA/offline;
- notifiche push;
- AI;
- grafici sofisticati.

Queste funzioni possono essere aggiunte in seguito senza bloccare la v1.
