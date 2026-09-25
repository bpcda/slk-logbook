export type Row = Record<string, unknown>

export type Field = {
  key: string
  label: string
  type?: 'text' | 'textarea' | 'number' | 'date' | 'datetime-local' | 'select' | 'checkbox'
  required?: boolean
  options?: { value: string; label: string }[]
  defaultValue?: string | boolean
  step?: string
}

export type EntityConfig = {
  path: string
  table: string
  singular: string
  title: string
  dateKey: string
  searchKeys: string[]
  odometerKey?: string
  fields: Field[]
  columns: string[]
}

const fuelOptions = [
  { value: 'petrol', label: 'Benzina' },
  { value: 'lpg', label: 'GPL' },
  { value: 'other', label: 'Altro' },
]

const today = new Date().toISOString().slice(0, 10)
const now = new Date().toISOString().slice(0, 16)

export const entities: EntityConfig[] = [
  {
    path: 'trips', table: 'trips', singular: 'viaggio', title: 'Viaggi', dateKey: 'started_at',
    searchKeys: ['origin', 'destination', 'trip_type', 'notes'], odometerKey: 'odometer_start_km',
    columns: ['started_at', 'destination', 'odometer_start_km', 'odometer_end_km', 'distance_km'],
    fields: [
      { key: 'started_at', label: 'Partenza', type: 'datetime-local', required: true, defaultValue: now },
      { key: 'ended_at', label: 'Arrivo', type: 'datetime-local' },
      { key: 'origin', label: 'Origine' }, { key: 'destination', label: 'Destinazione' },
      { key: 'odometer_start_km', label: 'Km iniziali', type: 'number', required: true },
      { key: 'odometer_end_km', label: 'Km finali', type: 'number' },
      { key: 'trip_type', label: 'Tipo viaggio' },
      { key: 'primary_fuel_type', label: 'Carburante prevalente', type: 'select', options: fuelOptions },
      { key: 'tolls_eur', label: 'Pedaggi €', type: 'number', step: '0.01', defaultValue: '0' },
      { key: 'parking_eur', label: 'Parcheggi €', type: 'number', step: '0.01', defaultValue: '0' },
      { key: 'other_cost_eur', label: 'Altri costi €', type: 'number', step: '0.01', defaultValue: '0' },
      { key: 'conditions', label: 'Meteo/condizioni' }, { key: 'anomalies', label: 'Problemi/anomalie', type: 'textarea' },
      { key: 'notes', label: 'Note', type: 'textarea' },
    ],
  },
  {
    path: 'fuel', table: 'fuel_entries', singular: 'rifornimento', title: 'Rifornimenti', dateKey: 'filled_at',
    searchKeys: ['fuel_type', 'station', 'location', 'notes'], odometerKey: 'odometer_km',
    columns: ['filled_at', 'fuel_type', 'odometer_km', 'liters', 'total_cost_eur'],
    fields: [
      { key: 'filled_at', label: 'Data', type: 'datetime-local', required: true, defaultValue: now },
      { key: 'odometer_km', label: 'Odometro km', type: 'number', required: true },
      { key: 'fuel_type', label: 'Carburante', type: 'select', required: true, options: fuelOptions, defaultValue: 'petrol' },
      { key: 'liters', label: 'Litri', type: 'number', step: '0.001', required: true },
      { key: 'price_per_liter_eur', label: 'Prezzo €/L', type: 'number', step: '0.0001' },
      { key: 'total_cost_eur', label: 'Costo totale €', type: 'number', step: '0.01', required: true },
      { key: 'is_full_tank', label: 'Pieno', type: 'checkbox' },
      { key: 'station', label: 'Distributore' }, { key: 'location', label: 'Località' },
      { key: 'notes', label: 'Note', type: 'textarea' },
    ],
  },
  {
    path: 'maintenance', table: 'maintenance_events', singular: 'intervento', title: 'Manutenzione', dateKey: 'performed_at',
    searchKeys: ['category', 'title', 'description', 'performed_by', 'notes'], odometerKey: 'odometer_km',
    columns: ['performed_at', 'title', 'category', 'odometer_km', 'total_cost_eur'],
    fields: [
      { key: 'performed_at', label: 'Data', type: 'date', required: true, defaultValue: today },
      { key: 'odometer_km', label: 'Odometro km', type: 'number' },
      { key: 'category', label: 'Categoria', required: true }, { key: 'title', label: 'Intervento', required: true },
      { key: 'description', label: 'Lavoro eseguito', type: 'textarea' }, { key: 'performed_by', label: 'Eseguito da' },
      { key: 'labor_cost_eur', label: 'Manodopera €', type: 'number', step: '0.01', defaultValue: '0' },
      { key: 'parts_cost_eur', label: 'Ricambi €', type: 'number', step: '0.01', defaultValue: '0' },
      { key: 'other_cost_eur', label: 'Altri costi €', type: 'number', step: '0.01', defaultValue: '0' },
      { key: 'total_cost_eur', label: 'Totale €', type: 'number', step: '0.01', defaultValue: '0', required: true },
      { key: 'next_due_date', label: 'Prossima data', type: 'date' },
      { key: 'next_due_odometer_km', label: 'Prossimi km', type: 'number' },
      { key: 'notes', label: 'Note', type: 'textarea' },
    ],
  },
  {
    path: 'parts', table: 'parts', singular: 'ricambio', title: 'Ricambi', dateKey: 'purchased_at',
    searchKeys: ['category', 'name', 'oem_part_number', 'manufacturer', 'supplier', 'notes'], odometerKey: 'installed_odometer_km',
    columns: ['name', 'category', 'quantity', 'status', 'total_cost_eur'],
    fields: [
      { key: 'name', label: 'Nome', required: true }, { key: 'category', label: 'Categoria' },
      { key: 'oem_part_number', label: 'Codice OEM' }, { key: 'manufacturer', label: 'Produttore' },
      { key: 'aftermarket_part_number', label: 'Codice aftermarket' },
      { key: 'quantity', label: 'Quantità', type: 'number', step: '0.01', defaultValue: '1', required: true },
      { key: 'unit_cost_eur', label: 'Prezzo unitario €', type: 'number', step: '0.01' },
      { key: 'total_cost_eur', label: 'Costo totale €', type: 'number', step: '0.01' },
      { key: 'purchased_at', label: 'Data acquisto', type: 'date' }, { key: 'installed_at', label: 'Data installazione', type: 'date' },
      { key: 'installed_odometer_km', label: 'Km installazione', type: 'number' }, { key: 'supplier', label: 'Fornitore' },
      { key: 'status', label: 'Stato', type: 'select', required: true, defaultValue: 'stock', options: [
        { value: 'purchased', label: 'Acquistato' }, { value: 'installed', label: 'Installato' },
        { value: 'stock', label: 'Scorta' }, { value: 'returned', label: 'Reso' },
      ] },
      { key: 'is_on_board', label: 'A bordo', type: 'checkbox' }, { key: 'notes', label: 'Note', type: 'textarea' },
    ],
  },
  {
    path: 'issues', table: 'issues', singular: 'problema', title: 'Problemi', dateKey: 'detected_at',
    searchKeys: ['area', 'title', 'description', 'dtc_code', 'notes'], odometerKey: 'odometer_km',
    columns: ['detected_at', 'title', 'area', 'severity', 'status'],
    fields: [
      { key: 'detected_at', label: 'Data rilevazione', type: 'date', required: true, defaultValue: today },
      { key: 'odometer_km', label: 'Odometro km', type: 'number' }, { key: 'area', label: 'Area' },
      { key: 'title', label: 'Titolo', required: true }, { key: 'description', label: 'Descrizione', type: 'textarea' },
      { key: 'dtc_code', label: 'DTC / Codice' },
      { key: 'severity', label: 'Gravità', type: 'select', required: true, defaultValue: 'check', options: [
        { value: 'info', label: 'Info' }, { value: 'check', label: 'Da controllare' }, { value: 'urgent', label: 'Urgente' },
      ] },
      { key: 'status', label: 'Stato', type: 'select', required: true, defaultValue: 'open', options: [
        { value: 'open', label: 'Aperto' }, { value: 'diagnosing', label: 'In diagnosi' },
        { value: 'resolved', label: 'Risolto' }, { value: 'ignored', label: 'Ignorato' },
      ] },
      { key: 'resolved_at', label: 'Data risoluzione', type: 'date' }, { key: 'resolution', label: 'Risoluzione', type: 'textarea' },
      { key: 'notes', label: 'Note', type: 'textarea' },
    ],
  },
  {
    path: 'reminders', table: 'reminders', singular: 'scadenza', title: 'Scadenze', dateKey: 'due_date',
    searchKeys: ['title', 'reminder_type', 'notes'], odometerKey: 'due_odometer_km',
    columns: ['title', 'reminder_type', 'due_date', 'due_odometer_km', 'completed_at'],
    fields: [
      { key: 'title', label: 'Titolo', required: true }, { key: 'reminder_type', label: 'Tipo' },
      { key: 'due_date', label: 'Data', type: 'date' }, { key: 'due_odometer_km', label: 'Km', type: 'number' },
      { key: 'completed_at', label: 'Completata il', type: 'datetime-local' }, { key: 'notes', label: 'Note', type: 'textarea' },
    ],
  },
]

export const entityByPath = Object.fromEntries(entities.map((entity) => [entity.path, entity]))

export function labelFor(config: EntityConfig, key: string) {
  return config.fields.find((field) => field.key === key)?.label ?? key
}

export function displayValue(field: Field | undefined, value: unknown) {
  if (value === null || value === undefined || value === '') return '—'
  if (field?.type === 'checkbox') return value ? 'Sì' : 'No'
  if (field?.options) return field.options.find((option) => option.value === value)?.label ?? String(value)
  if (field?.type === 'datetime-local') return new Date(String(value)).toLocaleString('it-IT')
  if (field?.type === 'date') return new Date(`${value}T00:00:00`).toLocaleDateString('it-IT')
  if (field?.step && field.label.includes('€')) return `${Number(value).toLocaleString('it-IT', { minimumFractionDigits: 2 })} €`
  return String(value)
}

