import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import PrivateRoute    from './components/common/PrivateRoute/PrivateRoute'
import AdminRoute      from './components/common/AdminRoute/AdminRoute'
import LoginPage       from './pages/LoginPage'
import DashboardPage   from './pages/DashboardPage'
import AdminPage       from './pages/AdminPage'
import UsersPage       from './pages/UsersPage'
import DatasetsAdminPage from './pages/DatasetsAdminPage'
import MarketingProjectionsPage from './pages/MarketingProjectionsPage'

function ProyeccionesRouter() {
  const { user } = useAuth()
  const role = user?.role
  if (role === 'DIRECTOR_MERCADOTECNIA' || role === 'D.M.') {
    return <MarketingProjectionsPage />
  }
  return (
    <div className="min-h-screen flex items-center justify-center p-8 text-center">
      <p className="text-sm text-[var(--color-hi-text-sub)]">
        Próximamente para tu rol.
      </p>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<PrivateRoute />}>
            <Route path="/"             element={<DashboardPage />} />
            <Route path="/proyecciones" element={<ProyeccionesRouter />} />
            <Route path="/reportes"     element={<div>Reportes</div>} />
            <Route path="/usuarios"     element={<div>Usuarios</div>} />
            <Route path="/datos"        element={<div>Datos</div>} />

            {/* Admin */}
            <Route element={<AdminRoute />}>
              <Route path="/admin"          element={<AdminPage />} />
              <Route path="/admin/usuarios" element={<UsersPage />} />
              <Route path="/admin/datos"    element={<DatasetsAdminPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}