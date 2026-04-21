import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute    from './components/common/PrivateRoute/PrivateRoute'
import LoginPage       from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'

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
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}