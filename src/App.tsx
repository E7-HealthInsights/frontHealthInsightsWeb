import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute    from './components/common/PrivateRoute/PrivateRoute'
import LoginPage       from './pages/LoginPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Rutas protegidas — aquí irán el dashboard y demás páginas */}
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<div>Dashboard (próximamente)</div>} />
          </Route>

          {/* Cualquier ruta desconocida redirige al login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}