import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../lib/auth-context'
import { deleteRow, getRow, listRows, saveRow } from '../lib/data'
import { displayValue, labelFor, type EntityConfig, type Field, type Row } from '../lib/entities'
import { validateRow } from '../lib/validation'
import { useVehicle } from '../lib/vehicle-context'

const categoricalKeys = ['category', 'trip_type', 'reminder_type', 'area']

function localDateTime() {
  const now = new Date()
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 16)
}

function initialValues(config: EntityConfig, vehicle: Row) {
  const values = Object.fromEntries(config.fields.map((field) => [field.key, field.defaultValue ?? (field.type === 'checkbox' ? false : '')]))
  if (config.path === 'trips') {
    values.started_at = localDateTime()
    values.odometer_start_km = String(vehicle.current_odometer_km ?? 0)
  }
  return values
}

export function CrudPage({ config }: { config: EntityConfig }) {
  const { id } = useParams()
  return id ? <RecordPage config={config} id={id} /> : <ListPage config={config} />
}

function ListPage({ config }: { config: EntityConfig }) {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [minKm, setMinKm] = useState('')
  const [maxKm, setMaxKm] = useState('')
  const [kind, setKind] = useState('')
  const [oldestFirst, setOldestFirst] = useState(false)
  const kindField = config.fields.find((field) => categoricalKeys.includes(field.key)) ?? config.fields.find((field) => field.options)

  useEffect(() => {
    void listRows(config).then(setRows).catch(() => setError('Impossibile caricare i dati.')).finally(() => setLoading(false))
  }, [config])

  const kindOptions = useMemo(() => [...new Set(rows.map((row) => String(row[kindField?.key ?? ''] ?? '').trim()).filter(Boolean))]
    .toSorted((a, b) => a.localeCompare(b, 'it')), [kindField?.key, rows])

  const filtered = useMemo(() => rows.filter((row) => {
    const haystack = config.searchKeys.map((key) => String(row[key] ?? '')).join(' ').toLowerCase()
    const date = String(row[config.dateKey] ?? '').slice(0, 10)
    const km = config.odometerKey ? Number(row[config.odometerKey]) : 0
    return haystack.includes(search.toLowerCase()) && (!from || date >= from) && (!to || date <= to)
      && (!minKm || km >= Number(minKm)) && (!maxKm || km <= Number(maxKm))
      && (!kind || String(row[kindField?.key ?? '']) === kind)
  }).toSorted((a, b) => {
    const result = String(b[config.dateKey] ?? '').localeCompare(String(a[config.dateKey] ?? ''))
    return oldestFirst ? -result : result
  }), [config, from, kind, kindField?.key, maxKm, minKm, oldestFirst, rows, search, to])

  return <>
    <div className="page-heading"><div><h1>{config.title}</h1><p>{filtered.length} registrazioni</p></div><Link className="button" to={`/${config.path}/new`}>{config.path === 'trips' ? 'Inizia viaggio' : '+ Nuovo'}</Link></div>
    <section className="filters" aria-label="Filtri">
      <label>Cerca<input type="search" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
      <label>Dal<input type="date" value={from} onChange={(event) => setFrom(event.target.value)} /></label>
      <label>Al<input type="date" value={to} onChange={(event) => setTo(event.target.value)} /></label>
      {config.odometerKey && <><label>Km min<input type="number" inputMode="numeric" value={minKm} onChange={(event) => setMinKm(event.target.value)} /></label><label>Km max<input type="number" inputMode="numeric" value={maxKm} onChange={(event) => setMaxKm(event.target.value)} /></label></>}
      {kindField && kindOptions.length > 0 && <label>{kindField.label}<select value={kind} onChange={(event) => setKind(event.target.value)}><option value="">Tutti</option>{kindOptions.map((option) => <option key={option} value={option}>{displayValue(kindField, option)}</option>)}</select></label>}
      <label>Ordine<select value={oldestFirst ? 'old' : 'new'} onChange={(event) => setOldestFirst(event.target.value === 'old')}><option value="new">Più recenti</option><option value="old">Più vecchi</option></select></label>
    </section>
    {error && <p className="error" role="alert">{error}</p>}
    {loading ? <p>Caricamento…</p> : filtered.length === 0 ? <p className="empty">Nessuna registrazione.</p> : <div className="records">
      <table><thead><tr>{config.columns.map((key) => <th key={key}>{labelFor(config, key)}</th>)}<th>Azioni</th></tr></thead>
        <tbody>{filtered.map((row) => <tr key={String(row.id)}>{config.columns.map((key) => <td key={key}>{displayValue(config.fields.find((field) => field.key === key), row[key])}</td>)}<td><Link to={`/${config.path}/${row.id}`}>Apri</Link></td></tr>)}</tbody>
      </table>
      <div className="record-cards">{filtered.map((row) => <article key={String(row.id)}>{config.columns.slice(0, 3).map((key) => <p key={key}><strong>{labelFor(config, key)}</strong> {displayValue(config.fields.find((field) => field.key === key), row[key])}</p>)}<Link to={`/${config.path}/${row.id}`}>Apri</Link></article>)}</div>
    </div>}
  </>
}

function RecordPage({ config, id }: { config: EntityConfig; id: string }) {
  const creating = id === 'new'
  const { session } = useAuth()
  const { vehicle, raiseOdometer } = useVehicle()
  const navigate = useNavigate()
  const dialog = useRef<HTMLDialogElement>(null)
  const [values, setValues] = useState<Row>(() => initialValues(config, vehicle))
  const [savedValues, setSavedValues] = useState<Row>(() => initialValues(config, vehicle))
  const [loading, setLoading] = useState(!creating)
  const [editing, setEditing] = useState(creating)
  const [finishingTrip, setFinishingTrip] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!creating) void getRow(config, id).then((row) => {
      setValues(row)
      setSavedValues(row)
    }).catch(() => setError('Impossibile caricare il record.')).finally(() => setLoading(false))
  }, [config, creating, id])

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!session) return
    setError('')
    const validationErrors = validateRow(config, values)
    if (validationErrors.length) {
      setError(validationErrors.join(' '))
      return
    }
    try {
      const odometer = await saveRow(config, values, session.user, vehicle, creating ? undefined : id)
      await raiseOdometer(odometer)
      navigate(`/${config.path}`)
    } catch {
      setError('Salvataggio non riuscito. Controlla i dati e riprova.')
    }
  }

  async function remove() {
    try {
      await deleteRow(config, id)
      navigate(`/${config.path}`)
    } catch {
      setError('Eliminazione non riuscita.')
    }
  }

  const enteredOdometer = config.odometerKey ? Number(values[config.odometerKey]) : 0
  const odometerWarning = enteredOdometer > 0 && enteredOdometer < Number(vehicle?.current_odometer_km ?? 0)

  function edit() {
    setValues({ ...savedValues })
    setFinishingTrip(false)
    setEditing(true)
  }

  function finishTrip() {
    setValues({ ...savedValues, ended_at: localDateTime() })
    setFinishingTrip(true)
    setEditing(true)
  }

  function cancel() {
    if (creating) navigate(`/${config.path}`)
    else {
      setValues({ ...savedValues })
      setEditing(false)
      setFinishingTrip(false)
      setError('')
    }
  }

  function updateValue(key: string, value: string | boolean) {
    const next = { ...values, [key]: value }
    if (config.path === 'fuel' && ['liters', 'price_per_liter_eur'].includes(key)) {
      const total = Number(next.liters) * Number(next.price_per_liter_eur)
      if (Number.isFinite(total)) next.total_cost_eur = total.toFixed(2)
    }
    if (config.path === 'maintenance' && ['labor_cost_eur', 'parts_cost_eur', 'other_cost_eur'].includes(key)) {
      next.total_cost_eur = ['labor_cost_eur', 'parts_cost_eur', 'other_cost_eur'].reduce((sum, costKey) => sum + Number(next[costKey] || 0), 0).toFixed(2)
    }
    if (config.path === 'parts' && ['quantity', 'unit_cost_eur'].includes(key)) {
      const total = Number(next.quantity) * Number(next.unit_cost_eur)
      if (Number.isFinite(total)) next.total_cost_eur = total.toFixed(2)
    }
    setValues(next)
  }

  if (loading) return <p>Caricamento…</p>
  const isOpenTrip = config.path === 'trips' && !savedValues.ended_at
  const fields = finishingTrip
    ? config.fields.filter((field) => ['ended_at', 'odometer_end_km', 'destination', 'notes'].includes(field.key))
    : config.fields
  return <>
    <div className="page-heading"><h1>{creating && config.path === 'trips' ? 'Inizia viaggio' : creating ? `Nuovo ${config.singular}` : String(values.title ?? values.name ?? config.singular)}</h1>{!creating && !editing && <div className="form-actions">{isOpenTrip && <button type="button" onClick={finishTrip}>Termina viaggio</button>}<button type="button" className="secondary" onClick={edit}>Modifica</button></div>}</div>
    {error && <p className="error" role="alert">{error}</p>}
    {editing ? <form className="record-form" onSubmit={(event) => void submit(event)}>
      {fields.map((field) => <FormField key={field.key} field={finishingTrip && field.key === 'odometer_end_km' ? { ...field, required: true } : field} value={values[field.key]} onChange={(value) => updateValue(field.key, value)} />)}
      {odometerWarning && <p className="warning">Attenzione: il valore è inferiore all'odometro corrente ({String(vehicle?.current_odometer_km)} km). Puoi salvarlo se è una registrazione storica.</p>}
      <div className="form-actions"><button>{finishingTrip ? 'Termina viaggio' : creating && config.path === 'trips' ? 'Inizia viaggio' : 'Salva'}</button><button type="button" className="secondary" onClick={cancel}>Annulla</button></div>
    </form> : <section className="detail-list">
      {config.fields.map((field) => <div key={field.key}><dt>{field.label}</dt><dd>{displayValue(field, values[field.key])}</dd></div>)}
      <div className="form-actions"><button className="danger" type="button" onClick={() => dialog.current?.showModal()}>Elimina</button><Link className="button secondary" to={`/${config.path}`}>Indietro</Link></div>
    </section>}
    <dialog ref={dialog}><h2>Eliminare questo {config.singular}?</h2><p>L'operazione non può essere annullata.</p><div className="form-actions"><button className="danger" type="button" onClick={() => void remove()}>Elimina</button><button type="button" className="secondary" onClick={() => dialog.current?.close()}>Annulla</button></div></dialog>
  </>
}

function FormField({ field, value, onChange }: { field: Field; value: unknown; onChange: (value: string | boolean) => void }) {
  const id = `field-${field.key}`
  if (field.type === 'checkbox') return <label className="checkbox" htmlFor={id}><input id={id} type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} /> {field.label}</label>
  if (field.type === 'textarea') return <label htmlFor={id}>{field.label}<textarea id={id} required={field.required} value={String(value ?? '')} onChange={(event) => onChange(event.target.value)} /></label>
  if (field.type === 'select') return <label htmlFor={id}>{field.label}<select id={id} required={field.required} value={String(value ?? '')} onChange={(event) => onChange(event.target.value)}><option value="">—</option>{field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
  return <label htmlFor={id}>{field.label}<input id={id} type={field.type ?? 'text'} required={field.required} step={field.step} inputMode={field.type === 'number' ? 'decimal' : undefined} value={String(value ?? '').slice(0, field.type === 'datetime-local' ? 16 : undefined)} onChange={(event) => onChange(event.target.value)} /></label>
}
