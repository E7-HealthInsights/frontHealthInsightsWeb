import { useAuth }                from '../context/AuthContext'
import FinanzasProyeccionesPage from './proyecciones/FinanzasProyeccionesPage'
import GeneralProyeccionesPage from './proyecciones/GeneralProyeccionesPage'
import MarketingProyeccionesPage from './proyecciones/MarketingProyeccionesPage'


// ProyeccionesPage — router de rol.
// Cada rol tiene su propia página con su modelo de proyección.

export default function ProyeccionesPage() {
  const { user } = useAuth()

  switch (user?.role) {
    case 'DIRECTOR_FINANZAS':   return <FinanzasProyeccionesPage />
    case 'DIRECTOR_GENERAL':    return <GeneralProyeccionesPage />
    case 'DIRECTOR_MARKETING':  return <MarketingProyeccionesPage />
    default:                    return <FinanzasProyeccionesPage />
  }
}