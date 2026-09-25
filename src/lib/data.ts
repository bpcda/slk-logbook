import type { User } from '@supabase/supabase-js'
import type { EntityConfig, Row } from './entities'
import { supabase } from './supabase'

export async function getVehicle(user: User) {
  const existing = await supabase.from('vehicles').select('*').eq('user_id', user.id).maybeSingle()
  if (existing.error) throw existing.error
  if (existing.data) return existing.data as Row
  const created = await supabase.from('vehicles').insert({
    user_id: user.id, name: 'SLK R170', manufacturer: 'Mercedes-Benz', model: 'SLK R170',
    variant: 'R170.445', chassis: 'M111.943', vin: 'WDB1704451F158666', fuel_types: ['petrol', 'lpg'],
  }).select().single()
  if (created.error) throw created.error
  return created.data as Row
}

export async function listRows(config: EntityConfig) {
  const { data, error } = await supabase.from(config.table).select('*').order(config.dateKey, { ascending: false, nullsFirst: false })
  if (error) throw error
  return (data ?? []) as Row[]
}

export async function getRow(config: EntityConfig, id: string) {
  const { data, error } = await supabase.from(config.table).select('*').eq('id', id).single()
  if (error) throw error
  return data as Row
}

export async function saveRow(config: EntityConfig, values: Row, user: User, vehicle: Row, id?: string) {
  const payload: Row = { user_id: user.id, vehicle_id: vehicle.id }
  for (const field of config.fields) {
    const value = values[field.key]
    if (field.type === 'checkbox') payload[field.key] = Boolean(value)
    else if (value === '' || value === undefined) payload[field.key] = null
    else if (field.type === 'number') payload[field.key] = Number(value)
    else if (field.type === 'datetime-local') payload[field.key] = new Date(String(value)).toISOString()
    else payload[field.key] = value
  }
  const query = id
    ? supabase.from(config.table).update(payload).eq('id', id)
    : supabase.from(config.table).insert(payload)
  const { error } = await query
  if (error) throw error

  const candidates = [config.path !== 'reminders' && config.odometerKey && payload[config.odometerKey], config.path === 'trips' && payload.odometer_end_km]
  return Math.max(0, ...candidates.map(Number).filter(Number.isFinite))
}

export async function deleteRow(config: EntityConfig, id: string) {
  const { error } = await supabase.from(config.table).delete().eq('id', id)
  if (error) throw error
}
