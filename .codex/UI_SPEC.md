# UI specification

## Filosofia

Interfaccia da strumento tecnico personale.

No:

- hero section;
- gradienti;
- animazioni;
- glassmorphism;
- dashboard "executive";
- icone decorative;
- grandi spazi vuoti.

Sì:

- testo leggibile;
- tabelle;
- form compatti;
- pulsanti chiari;
- stato evidente;
- mobile first.

## Layout

### Header

```text
SLK Logbook                 [km attuali] [Logout]
```

### Sidebar desktop

```text
Dashboard
Viaggi
Rifornimenti
Manutenzione
Ricambi
Problemi
Scadenze
Impostazioni
```

Su mobile: menu collassabile.

## Dashboard

Prima riga:

```text
Odometro | Km registrati | Costi totali | Problemi aperti
```

Poi:

```text
Scadenze prossime
Ultimi eventi
```

Eventi unificati ordinati per data:

- viaggio;
- rifornimento;
- manutenzione;
- problema.

## Liste

Desktop: tabella.

Mobile: card compatte.

Azioni:

- apri;
- modifica;
- elimina.

Filtri sopra la lista, collassabili su mobile.

## Form

Regole:

- label sempre visibile;
- placeholder solo come esempio;
- valori numerici allineati;
- data precompilata con oggi quando sensato;
- odometro precompilato con ultimo valore conosciuto;
- totale costo calcolato automaticamente se possibile;
- salva e annulla sempre visibili.

### Quick Add

Pulsante:

```text
+ Registra
```

Apre scelta:

```text
Viaggio
Rifornimento
Manutenzione
Problema
```

## Login

Pagina minimale:

```text
SLK Logbook

Password
[________________]

[Accedi]
```

Non mostrare email.

Errori:

```text
Password non valida.
```

Non rivelare dettagli tecnici Supabase.

## Colori

Usare colori browser/CSS sobri.

Non dedicare tempo al branding.

Stati:

- normale;
- warning;
- errore;
- successo.

Devono distinguersi anche tramite testo, non solo colore.

## Accessibilità essenziale

- label associate;
- focus visibile;
- bottoni veri, non div cliccabili;
- contrasto sufficiente;
- form utilizzabili da tastiera;
- dialog eliminazione con focus corretto.
