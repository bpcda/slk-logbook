import type { EntityConfig, Row } from './entities'

export function validateRow(config: EntityConfig, values: Row) {
  const errors: string[] = []

  for (const field of config.fields.filter((item) => item.key.endsWith('_eur'))) {
    const value = values[field.key]
    if (value !== '' && value !== null && value !== undefined && Number(value) < 0) {
      errors.push(`${field.label} non può essere negativo.`)
    }
  }

  if (config.path === 'trips') {
    const startKm = Number(values.odometer_start_km)
    const endKm = values.odometer_end_km === '' || values.odometer_end_km == null ? null : Number(values.odometer_end_km)
    if (endKm !== null && endKm < startKm) errors.push('I km finali devono essere maggiori o uguali ai km iniziali.')
    if (values.ended_at && endKm === null) errors.push('Inserisci i km finali per terminare il viaggio.')
    if (values.ended_at && new Date(String(values.ended_at)) < new Date(String(values.started_at))) {
      errors.push("La data e l'ora di arrivo devono essere successive alla partenza.")
    }
  }

  if (config.path === 'fuel' && Number(values.liters) <= 0) errors.push('I litri devono essere maggiori di zero.')
  if (config.path === 'reminders' && !values.due_date && !values.due_odometer_km) {
    errors.push('Inserisci almeno una data o un chilometraggio per la scadenza.')
  }

  return errors
}
