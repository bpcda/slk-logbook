import { createContext, useContext } from 'react'
import type { Row } from './entities'

export type VehicleValue = {
  vehicle: Row
  updateVehicle: (changes: Row) => Promise<void>
  raiseOdometer: (odometer: number) => Promise<void>
}

export const VehicleContext = createContext<VehicleValue | null>(null)

export function useVehicle() {
  const value = useContext(VehicleContext)
  if (!value) throw new Error('VehicleProvider mancante')
  return value
}

