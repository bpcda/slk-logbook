import { useEffect, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { getVehicle } from './data'
import type { Row } from './entities'
import { supabase } from './supabase'
import { VehicleContext } from './vehicle-context'

export function VehicleProvider({ user, children }: { user: User; children: ReactNode }) {
  const [vehicle, setVehicle] = useState<Row | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    void getVehicle(user).then(setVehicle).catch((reason: Error) => setError(reason.message))
  }, [user])

  async function updateVehicle(changes: Row) {
    if (!vehicle) return
    const { error: updateError } = await supabase.from('vehicles').update(changes).eq('id', vehicle.id)
    if (updateError) throw updateError
    setVehicle({ ...vehicle, ...changes })
  }

  async function raiseOdometer(odometer: number) {
    if (!vehicle || odometer <= Number(vehicle.current_odometer_km ?? 0)) return
    await updateVehicle({ current_odometer_km: odometer })
  }

  if (error) return <main className="centered"><p className="error" role="alert">Impossibile caricare i dati del veicolo.</p></main>
  if (!vehicle) return <main className="centered">Caricamento…</main>
  return <VehicleContext.Provider value={{ vehicle, updateVehicle, raiseOdometer }}>{children}</VehicleContext.Provider>
}
