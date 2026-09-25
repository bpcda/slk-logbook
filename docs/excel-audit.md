# Audit Excel — SLK R170 Logbook

File analizzato: `.codex/SLK_R170_Logbook.xlsx`.

Il workbook è un modello quasi vuoto: i fogli operativi hanno 999 righe predisposte, ma nessun evento registrato. Gli unici dati importabili sono gli 11 elementi del foglio `Ricambi a bordo`. Il veicolo è identificato nell'intestazione come Mercedes SLK R170, variante R170.445, motore M111.943, VIN `WDB1704451F158666`.

## Riepilogo

| Foglio | Righe fisiche | Righe dati | Formule | Celle unite | Link/note |
|---|---:|---:|---:|---:|---:|
| Dashboard | 9 | 0 | 6 | 2 | 0 |
| Viaggi | 1.000 | 0 | 999 | 0 | 0 |
| Rifornimenti | 1.000 | 0 | 999 | 0 | 0 |
| Manutenzione | 1.000 | 0 | 999 | 0 | 0 |
| Diagnostica | 1.000 | 0 | 0 | 0 | 0 |
| Controlli periodici | 1.000 | 0 | 0 | 0 | 0 |
| Ricambi a bordo | 1.000 | 11 | 0 | 0 | 0 |

Non risultano date non parseabili, hyperlink o duplicati forti. Le righe vuote preformattate non sono dati.

## Mapping colonne

| Foglio | Colonna | Tipo rilevato | Esempio | Formula? | Significato | Destinazione |
|---|---|---|---|---|---|---|
| Viaggi | Data partenza | data/ora | — | no | inizio viaggio | `trips.started_at` |
| Viaggi | Data ritorno | data/ora | — | no | fine viaggio | `trips.ended_at` |
| Viaggi | Origine | testo | — | no | luogo partenza | `trips.origin` |
| Viaggi | Destinazione | testo | — | no | luogo arrivo | `trips.destination` |
| Viaggi | Km iniziali | intero | — | no | odometro iniziale | `trips.odometer_start_km` |
| Viaggi | Km percorsi | intero | — | no | distanza dichiarata | non importato se ricostruibile |
| Viaggi | Km finali | intero | — | sì, `iniziali + percorsi` | odometro finale | `trips.odometer_end_km` |
| Viaggi | Tipo viaggio | testo | — | no | categoria | `trips.trip_type` |
| Viaggi | Carburante prevalente | testo | — | no | carburante usato | `trips.primary_fuel_type` |
| Viaggi | Consumo medio | decimale | — | no | consumo storico | `trips.reported_consumption` |
| Viaggi | Costo pedaggi | EUR | — | no | costo | `trips.tolls_eur` |
| Viaggi | Costo parcheggi | EUR | — | no | costo | `trips.parking_eur` |
| Viaggi | Altri costi | EUR | — | no | costo | `trips.other_cost_eur` |
| Viaggi | Meteo/condizioni | testo | — | no | contesto | `trips.conditions` |
| Viaggi | Problemi/anomalie | testo | — | no | osservazioni non strutturate | `trips.anomalies` |
| Viaggi | Note | testo | — | no | note | `trips.notes` |
| Rifornimenti | Data | data/ora | — | no | momento rifornimento | `fuel_entries.filled_at` |
| Rifornimenti | Località | testo | — | no | distributore/località | `fuel_entries.location` |
| Rifornimenti | Km odometro | intero | — | no | odometro | `fuel_entries.odometer_km` |
| Rifornimenti | Carburante | enum | — | no | benzina/GPL | `fuel_entries.fuel_type` |
| Rifornimenti | Litri | decimale | — | no | quantità | `fuel_entries.liters` |
| Rifornimenti | €/L | EUR | — | no | prezzo unitario | `fuel_entries.price_per_liter_eur` |
| Rifornimenti | Importo | EUR | — | no | importo dichiarato | usato come fallback del totale |
| Rifornimenti | Costo totale | EUR | — | sì, `litri × €/L` | costo derivato | `fuel_entries.total_cost_eur` |
| Rifornimenti | Pieno? | booleano | — | no | pieno completo | `fuel_entries.is_full_tank` |
| Rifornimenti | Note | testo | — | no | note | `fuel_entries.notes` |
| Manutenzione | Data | data | — | no | data intervento | `maintenance_events.performed_at` |
| Manutenzione | Categoria | testo | — | no | area | `maintenance_events.category` |
| Manutenzione | Km odometro | intero | — | no | odometro | `maintenance_events.odometer_km` |
| Manutenzione | Intervento/Ricambio | testo | — | no | titolo | `maintenance_events.title` |
| Manutenzione | Marca / Codice | testo | — | no | riferimento ricambio | `maintenance_events.description` |
| Manutenzione | Quantità | decimale | — | no | quantità ricambi | conservata nella descrizione se non separabile |
| Manutenzione | Costo unitario | EUR | — | no | prezzo | `maintenance_events.parts_cost_eur` con quantità |
| Manutenzione | Costo totale | EUR | — | sì, `quantità × unitario` | costo derivato | `maintenance_events.total_cost_eur` |
| Manutenzione | Eseguito da | testo | — | no | officina/esecutore | `maintenance_events.performed_by` |
| Manutenzione | Prossima scadenza km | intero | — | no | soglia | `maintenance_events.next_due_odometer_km` |
| Manutenzione | Prossima scadenza data | data | — | no | scadenza | `maintenance_events.next_due_date` |
| Manutenzione | Stato pezzo rimosso / diagnosi | testo | — | no | esito | `maintenance_events.removed_part_status` |
| Manutenzione | Note | testo | — | no | note | `maintenance_events.notes` |
| Diagnostica | Data, Km odometro | data, intero | — | no | rilevazione | `issues.detected_at`, `issues.odometer_km` |
| Diagnostica | Sintomo | testo | — | no | titolo/descrizione | `issues.title` |
| Diagnostica | DTC / Codice | testo | — | no | codice guasto | `issues.dtc_code` |
| Diagnostica | Condizione comparsa | testo | — | no | contesto | `issues.occurrence_condition` |
| Diagnostica | Carburante | testo | — | no | carburante attivo | `issues.fuel_type` |
| Diagnostica | Gravità | enum | — | no | severità | `issues.severity` |
| Diagnostica | Intervento fatto, Esito | testo | — | no | risoluzione storica | `issues.resolution` |
| Diagnostica | Data risoluzione | data | — | no | chiusura | `issues.resolved_at` |
| Diagnostica | Note | testo | — | no | note | `issues.notes` |
| Controlli periodici | Data, Km odometro | data, intero | — | no | rilevazione | `inspections.checked_at`, `inspections.odometer_km` |
| Controlli periodici | Olio…DTC presenti | testo | — | no | checklist tecnica | `inspections.checks` JSON |
| Controlli periodici | Esito generale, Note | testo | — | no | esito | `inspections.result`, `inspections.notes` |
| Ricambi a bordo | Categoria | testo | Diagnostica | no | categoria inventario | `parts.category` |
| Ricambi a bordo | Ricambio / Attrezzo | testo | Lettore OBD-II | no | nome | `parts.name` |
| Ricambi a bordo | Marca / Codice | testo | — | no | produttore/codice ambiguo | `parts.manufacturer` senza scomposizione |
| Ricambi a bordo | Quantità | decimale | 1 | no | quantità | `parts.quantity` |
| Ricambi a bordo | Presente? | booleano | — | no | presenza fisica | `parts.is_on_board` |
| Ricambi a bordo | Data verifica | data | — | no | ultimo controllo | `parts.last_verified_at` |
| Ricambi a bordo | Note | testo | — | no | note | `parts.notes` |

## Decisioni sulle formule

- Dashboard: tutte le formule sono KPI derivabili e saranno query applicative.
- Viaggi `Km finali`: regola di business derivabile da km iniziali e percorsi; l'app conserva in modo canonico inizio/fine e calcola la distanza.
- Rifornimenti e manutenzione `Costo totale`: derivabile; il DB verifica valori non negativi e la UI precompila il totale.
- I risultati formula vuoti nelle 999 righe predisposte non sono importati.

## Anomalie e limiti

- `Marca / Codice` mescola due concetti: l'import conserva il testo senza inferenze.
- `Importo` e `Costo totale` nei rifornimenti si sovrappongono: si preferisce il totale calcolato, con `Importo` come fallback.
- `Manutenzione` mescola interventi e ricambi. L'import crea un intervento e conserva i dettagli ambigui nella descrizione; i nuovi dati usano tabelle normalizzate.
- Il workbook non contiene storico reale di viaggi, carburante, manutenzione, diagnostica o controlli.
- `Consumo medio` storico non è ricostruibile senza dati: se valorizzato viene conservato come valore dichiarato, senza presentarlo come calcolo affidabile.

