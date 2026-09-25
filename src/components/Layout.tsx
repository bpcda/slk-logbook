import { useState, type ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { entities } from '../lib/entities'
import { useAuth } from '../lib/auth-context'

export function Layout({ children, odometer }: { children: ReactNode; odometer?: number }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [quickOpen, setQuickOpen] = useState(false)
  const { signOut } = useAuth()
  const navigate = useNavigate()

  function quickAdd(path: string) {
    setQuickOpen(false)
    navigate(`/${path}/new`)
  }

  return <div className="app-shell">
    <header className="topbar">
      <button className="menu-button" type="button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen}>Menu</button>
      <NavLink to="/" className="brand">SLK Logbook</NavLink>
      <span className="odometer">{odometer?.toLocaleString('it-IT') ?? '—'} km</span>
      <button type="button" className="secondary" onClick={() => void signOut()}>Esci</button>
    </header>
    <aside className={menuOpen ? 'sidebar open' : 'sidebar'}>
      <nav onClick={() => setMenuOpen(false)}>
        <NavLink to="/" end>Dashboard</NavLink>
        {entities.map((entity) => <NavLink key={entity.path} to={`/${entity.path}`}>{entity.title}</NavLink>)}
        <NavLink to="/settings">Impostazioni</NavLink>
      </nav>
    </aside>
    <main>{children}</main>
    <button type="button" className="quick-button" onClick={() => setQuickOpen(true)}>+ Registra</button>
    {quickOpen && <div className="modal-backdrop" role="presentation" onMouseDown={() => setQuickOpen(false)}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="quick-title" onMouseDown={(event) => event.stopPropagation()}>
        <h2 id="quick-title">Registra</h2>
        {entities.slice(0, 3).map((entity) => <button key={entity.path} type="button" onClick={() => quickAdd(entity.path)}>{entity.path === 'trips' ? 'Inizia viaggio' : entity.title}</button>)}
        <button type="button" onClick={() => quickAdd('issues')}>Problema</button>
        <button type="button" className="secondary" onClick={() => setQuickOpen(false)}>Annulla</button>
      </section>
    </div>}
  </div>
}
