import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Row } from '../lib/entities'

type Metrics = {
  distance: number
  fuelCost: number
  maintenanceCost: number
  openIssues: number
  recent: { date: string; label: string; path: string; id: string }[]
  reminders: Row[]
}

const empty: Metrics = { distance: 0, fuelCost: 0, maintenanceCost: 0, openIssues: 0, recent: [], reminders: [] }

export function DashboardPage({ odometer }: { odometer: number }) {
  const [metrics, setMetrics] = useState(empty)
  const [error, setError] = useState('')
  const [nearDate] = useState(() => new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10))

  useEffect(() => {
    void Promise.all([
      supabase.from('trips').select('id,started_at,destination,distance_km'),
      supabase.from('fuel_entries').select('id,filled_at,fuel_type,total_cost_eur'),
      supabase.from('maintenance_events').select('id,performed_at,title,total_cost_eur'),
      supabase.from('issues').select('id,detected_at,title,status'),
      supabase.from('reminders').select('*').is('completed_at', null),
    ]).then(([trips, fuel, maintenance, issues, reminders]) => {
      const failed = [trips, fuel, maintenance, issues, reminders].find((result) => result.error)
      if (failed?.error) throw failed.error
      const tripRows = (trips.data ?? []) as Row[]
      const fuelRows = (fuel.data ?? []) as Row[]
      const maintenanceRows = (maintenance.data ?? []) as Row[]
      const issueRows = (issues.data ?? []) as Row[]
      const recent = [
        ...tripRows.map((row) => ({ date: String(row.started_at), label: `Viaggio · ${row.destination || 'senza destinazione'}`, path: 'trips', id: String(row.id) })),
        ...fuelRows.map((row) => ({ date: String(row.filled_at), label: `Rifornimento · ${row.fuel_type}`, path: 'fuel', id: String(row.id) })),
        ...maintenanceRows.map((row) => ({ date: String(row.performed_at), label: `Manutenzione · ${row.title}`, path: 'maintenance', id: String(row.id) })),
        ...issueRows.map((row) => ({ date: String(row.detected_at), label: `Problema · ${row.title}`, path: 'issues', id: String(row.id) })),
      ].toSorted((a, b) => b.date.localeCompare(a.date)).slice(0, 8)
      setMetrics({
        distance: tripRows.reduce((sum, row) => sum + Number(row.distance_km ?? 0), 0),
        fuelCost: fuelRows.reduce((sum, row) => sum + Number(row.total_cost_eur ?? 0), 0),
        maintenanceCost: maintenanceRows.reduce((sum, row) => sum + Number(row.total_cost_eur ?? 0), 0),
        openIssues: issueRows.filter((row) => row.status === 'open' || row.status === 'diagnosing').length,
        recent,
        reminders: (reminders.data ?? []) as Row[],
      })
    }).catch((reason: Error) => setError(reason.message))
  }, [])

  const nearReminders = metrics.reminders.filter((row) => {
    const km = row.due_odometer_km ? Number(row.due_odometer_km) - odometer : Infinity
    return (row.due_date ? String(row.due_date) <= nearDate : false) || km <= 1000
  })
  const total = metrics.fuelCost + metrics.maintenanceCost

  return <>
    <div className="page-heading"><div><h1>Dashboard</h1><p>Mercedes-Benz SLK R170</p></div></div>
    {error && <p className="error" role="alert">{error}</p>}
    <section className="metric-grid">
      <Metric label="Odometro" value={`${odometer.toLocaleString('it-IT')} km`} />
      <Metric label="Km registrati" value={`${metrics.distance.toLocaleString('it-IT')} km`} />
      <Metric label="Costi totali" value={money(total)} />
      <Metric label="Problemi aperti" value={String(metrics.openIssues)} />
      <Metric label="Carburante" value={money(metrics.fuelCost)} />
      <Metric label="Manutenzione" value={money(metrics.maintenanceCost)} />
    </section>
    <div className="dashboard-columns">
      <section className="panel"><h2>Scadenze prossime</h2>{nearReminders.length ? nearReminders.map((row) => <p key={String(row.id)}><Link to={`/reminders/${row.id}`}>{String(row.title)}</Link> · {row.due_date ? String(row.due_date) : `${row.due_odometer_km} km`}</p>) : <p className="empty">Nessuna scadenza vicina.</p>}</section>
      <section className="panel"><h2>Ultimi eventi</h2>{metrics.recent.length ? metrics.recent.map((item) => <p key={`${item.path}-${item.id}`}><Link to={`/${item.path}/${item.id}`}>{item.label}</Link><br /><small>{new Date(item.date).toLocaleDateString('it-IT')}</small></p>) : <p className="empty">Nessun evento registrato.</p>}</section>
    </div>
  </>
}

function Metric({ label, value }: { label: string; value: string }) {
  return <article className="metric"><span>{label}</span><strong>{value}</strong></article>
}

function money(value: number) {
  return value.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })
}
