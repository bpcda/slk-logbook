import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { Layout } from './components/Layout'
import { AuthProvider } from './lib/auth'
import { useAuth } from './lib/auth-context'
import { getVehicle } from './lib/data'
import { entities } from './lib/entities'
import { CrudPage } from './pages/CrudPage'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { SettingsPage } from './pages/SettingsPage'

function ProtectedApp() {
  const { loading, session } = useAuth()
  const [odometer, setOdometer] = useState(0)

  useEffect(() => {
    if (session) void getVehicle(session.user).then((vehicle) => setOdometer(Number(vehicle.current_odometer_km ?? 0)))
  }, [session])

  if (loading) return <main className="centered">Caricamento…</main>
  if (!session) return <LoginPage />
  return <Layout odometer={odometer}><Routes>
    <Route path="/" element={<DashboardPage odometer={odometer} />} />
    {entities.map((entity) => <Route key={entity.path} path={`/${entity.path}/:id?`} element={<CrudPage config={entity} />} />)}
    <Route path="/settings" element={<SettingsPage />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></Layout>
}

export default function App() {
  return <AuthProvider><BrowserRouter><ProtectedApp /></BrowserRouter></AuthProvider>
}
