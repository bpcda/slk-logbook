import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../lib/auth-context'
import { getVehicle } from '../lib/data'
import type { Row } from '../lib/entities'
import { supabase } from '../lib/supabase'

export function SettingsPage() {
  const { session } = useAuth()
  const [vehicle, setVehicle] = useState<Row | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (session) void getVehicle(session.user).then(setVehicle)
  }, [session])

  async function save(event: FormEvent) {
    event.preventDefault()
    if (!vehicle) return
    const { id, name, manufacturer, model, variant, chassis, vin, current_odometer_km, notes } = vehicle
    const { error } = await supabase.from('vehicles').update({ name, manufacturer, model, variant, chassis, vin, current_odometer_km: Number(current_odometer_km), notes }).eq('id', id)
    setMessage(error ? error.message : 'Impostazioni salvate.')
  }

  if (!vehicle) return <p>Caricamento…</p>
  const fields = [['name', 'Nome'], ['manufacturer', 'Produttore'], ['model', 'Modello'], ['variant', 'Variante'], ['chassis', 'Motore/telaio'], ['vin', 'VIN']]
  return <><div className="page-heading"><h1>Impostazioni</h1></div><form className="record-form" onSubmit={(event) => void save(event)}>
    {fields.map(([key, label]) => <label key={key}>{label}<input value={String(vehicle[key] ?? '')} onChange={(event) => setVehicle({ ...vehicle, [key]: event.target.value })} /></label>)}
    <label>Odometro corrente<input type="number" inputMode="numeric" min="0" value={String(vehicle.current_odometer_km ?? 0)} onChange={(event) => setVehicle({ ...vehicle, current_odometer_km: event.target.value })} /></label>
    <label>Note<textarea value={String(vehicle.notes ?? '')} onChange={(event) => setVehicle({ ...vehicle, notes: event.target.value })} /></label>
    {message && <p role="status">{message}</p>}<button>Salva</button>
  </form></>
}
