import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { Layout } from './components/Layout'
import { AuthProvider } from './lib/auth'
import { useAuth } from './lib/auth-context'
import { entities } from './lib/entities'
import { VehicleProvider } from './lib/vehicle'
import { useVehicle } from './lib/vehicle-context'
import { CrudPage } from './pages/CrudPage'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { SettingsPage } from './pages/SettingsPage'

function VehicleApp() {
  const { vehicle } = useVehicle()
  const odometer = Number(vehicle.current_odometer_km ?? 0)
  return <Layout odometer={odometer}><Routes>
    <Route path="/" element={<DashboardPage />} />
    {entities.map((entity) => <Route key={entity.path} path={`/${entity.path}/:id?`} element={<CrudPage config={entity} />} />)}
    <Route path="/settings" element={<SettingsPage />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></Layout>
}

function ProtectedApp() {
  const { loading, session } = useAuth()
  if (loading) return <main className="centered">Caricamento…</main>
  if (!session) return <LoginPage />
  return <VehicleProvider key={session.user.id} user={session.user}><VehicleApp /></VehicleProvider>
}

export default function App() {
  return <AuthProvider><BrowserRouter><ProtectedApp /></BrowserRouter></AuthProvider>
}
