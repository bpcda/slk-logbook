# Excel migration rules

## Obiettivo

Codex deve comprendere il vecchio workbook prima di sostituirlo.

Questo documento definisce il metodo, non il mapping finale.

## Audit richiesto

Per ogni foglio produrre in `docs/excel-audit.md`:

| Foglio | Colonna | Tipo rilevato | Esempio | Formula? | Significato | Destinazione |
|---|---|---|---|---|---|---|

Aggiungere:

- numero righe;
- righe vuote;
- duplicati;
- celle unite;
- colonne con formule;
- date non parseabili;
- valute;
- campi con unità nel testo;
- eventuali hyperlink;
- eventuali note.

## Formule

Classificare ogni formula:

1. **derivabile**: non importare il risultato come fonte primaria;
2. **business rule**: portare la logica nell'app;
3. **dato storico non ricostruibile**: importare il valore calcolato e documentarlo.

Esempio:

`km viaggio = km finali - km iniziali`

deve diventare una regola applicativa/DB, non un campo manuale duplicato.

## Date

Convertire in ISO.

Se una data è ambigua:

- non assumere MM/DD;
- considerare il workbook italiano come DD/MM/YYYY solo se coerente con il resto dei dati;
- segnalare comunque le celle non certe.

## Numeri

Gestire:

- virgola decimale;
- separatori delle migliaia;
- simbolo €;
- testo tipo `123 km`;
- celle vuote.

Non trasformare stringhe ambigue in 0.

## Duplicati

Possibili chiavi euristiche:

### Viaggio

- data;
- km iniziali;
- km finali;
- destinazione.

### Rifornimento

- data;
- odometro;
- litri;
- costo.

### Manutenzione

- data;
- km;
- titolo/descrizione;
- costo.

Mai eliminare duplicati automaticamente se la corrispondenza non è forte.

## Import auditabile

Aggiungere `source_ref` simile a:

```text
Excel:Viaggi:row=23
```

almeno durante la prima migrazione.

## Confronto finale

Dopo import produrre:

```text
Excel:
  viaggi: N
  rifornimenti: N
  interventi: N
  ricambi: N

DB:
  viaggi: N
  rifornimenti: N
  interventi: N
  ricambi: N

Scartati:
  ...
```

Verificare anche:

- min/max data;
- min/max odometro;
- somma costi;
- numero di righe per categoria.

Le somme devono essere confrontabili con l'Excel, spiegando eventuali differenze.
