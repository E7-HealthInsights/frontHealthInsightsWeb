import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute    from './components/common/PrivateRoute/PrivateRoute'
import AdminRoute      from './components/common/AdminRoute/AdminRoute'
import LoginPage       from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import AdminPage     from './pages/AdminPage'
import UsersPage     from './pages/UsersPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<PrivateRoute />}>
            <Route path="/"             element={<DashboardPage />} />
            <Route path="/proyecciones" element={<div>Proyecciones</div>} />
            <Route path="/reportes"     element={<div>Reportes</div>} />
            <Route path="/usuarios"     element={<div>Usuarios</div>} />
            <Route path="/datos"        element={<div>Datos</div>} />

            {/* Directores */}
            {/* <Route path="/director/general"   element={<GeneralPage />} />
            <Route path="/director/finanzas"  element={<FinanzasPage />} />
            <Route path="/director/marketing" element={<MarketingPage />} /> */}

            {/* Admin */}
            <Route element={<AdminRoute />}>
              <Route path="/admin"          element={<AdminPage />} />
              <Route path="/admin/usuarios" element={<UsersPage />} />
              <Route path="/admin/datos"    element={<div>Datos (Admin)</div>} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}