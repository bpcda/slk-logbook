import { useState, type FormEvent } from 'react'
import type { Row } from '../lib/entities'
import { useVehicle } from '../lib/vehicle-context'

export function SettingsPage() {
  const { vehicle, updateVehicle } = useVehicle()
  const [draft, setDraft] = useState<Row>(() => ({ ...vehicle }))
  const [message, setMessage] = useState('')

  async function save(event: FormEvent) {
    event.preventDefault()
    const { name, manufacturer, model, variant, chassis, vin, current_odometer_km, notes } = draft
    try {
      await updateVehicle({ name, manufacturer, model, variant, chassis, vin, current_odometer_km: Number(current_odometer_km), notes })
      setMessage('Impostazioni salvate.')
    } catch {
      setMessage('Impossibile salvare le impostazioni.')
    }
  }

  const fields = [['name', 'Nome'], ['manufacturer', 'Produttore'], ['model', 'Modello'], ['variant', 'Variante'], ['chassis', 'Motore/telaio'], ['vin', 'VIN']]
  return <><div className="page-heading"><h1>Impostazioni</h1></div><form className="record-form" onSubmit={(event) => void save(event)}>
    {fields.map(([key, label]) => <label key={key}>{label}<input value={String(draft[key] ?? '')} onChange={(event) => setDraft({ ...draft, [key]: event.target.value })} /></label>)}
    <label>Odometro corrente<input type="number" inputMode="numeric" min="0" value={String(draft.current_odometer_km ?? 0)} onChange={(event) => setDraft({ ...draft, current_odometer_km: event.target.value })} /></label>
    <label>Note<textarea value={String(draft.notes ?? '')} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} /></label>
    {message && <p role="status">{message}</p>}<button>Salva</button>
  </form></>
}
