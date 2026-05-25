import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import PrivateRoute    from './components/common/PrivateRoute/PrivateRoute'
import AdminRoute      from './components/common/AdminRoute/AdminRoute'
import LoginPage        from './pages/LoginPage'
import DashboardPage    from './pages/DashboardPage'
import AdminPage        from './pages/AdminPage'
import UsersPage        from './pages/UsersPage'
import DatasetsAdminPage from './pages/DatasetsAdminPage'
import ReportesPage     from './pages/ReportesPage'
import ProyeccionesPage from './pages/ProyeccionesPage'
import MarketingProjectionsPage from './pages/MarketingProjectionsPage'

function ProyeccionesRouter() {
  const { user } = useAuth()
  const role = user?.role
  if (role === 'DIRECTOR_MERCADOTECNIA' || role === 'D.M.') {
    return <MarketingProjectionsPage />
  }
  return <ProyeccionesPage />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<PrivateRoute />}>
            <Route path="/"             element={<DashboardPage />} />
            <Route path="/reportes"     element={<ReportesPage />} />
            <Route path="/proyecciones" element={<ProyeccionesRouter />} />
            <Route path="/usuarios"     element={<div>Usuarios</div>} />
            <Route path="/datos"        element={<div>Datos</div>} />

            {/* Admin */}
            <Route element={<AdminRoute />}>
              <Route path="/admin"          element={<AdminPage />} />
              <Route path="/admin/usuarios" element={<UsersPage />} />
              <Route path="/admin/datos"    element={<DatasetsAdminPage />} />
              <Route path="/admin/reportes" element={<ReportesPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}