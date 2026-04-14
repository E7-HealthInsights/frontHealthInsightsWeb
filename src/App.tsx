import { useState } from 'react'
import './App.css'
import Modal from './components/common/Modal'
import Card from './components/common/Card'
import DataTable, { type Column } from './components/common/DataTable'
import { type User } from './types/User'
import StatCard from './components/features/dashboard/StatCard'

 
const usersMock: User[] = [
  { id: 1, nombre: 'Carlos', apellido: 'Gutierrez',  correo: 'carlos.g@hospital.mx',  fecha: '04/03/2026', tiempo: '2h 15m', rol: 'D.G.', estatus: 'Activo' },
  { id: 2, nombre: 'Ana', apellido: 'Llano', correo: 'ana.l@salud.mx',        fecha: '04/03/2026', tiempo: '1h 45m', rol: 'D.G.', estatus: 'Activo' },
  { id: 3, nombre: 'Roberto', apellido: 'Niño',  correo: 'r.nino@instituto.mx',  fecha: '03/03/2026', tiempo: '3h 30m', rol: 'D.F.', estatus: 'Inactivo' },
]
 
const activityColumnsMock: Column<User>[] = [
  { key: 'nombre_completo', header: 'Nombre Completo', render: row => `${row.nombre} ${row.apellido}` },
  { key: 'correo', header: 'Correo' },
  { key: 'fecha',  header: 'Fecha',  width: 'w-32' },
  { key: 'tiempo', header: 'Tiempo Conectado', width: 'w-36' },
]
 

function App() {
  const [isOpen, setIsOpen] = useState(false)

  return (

    <div className="min-h-screen bg-[var(--color-hi-bg)] p-8">
      <p>Hello World HealthInsights!</p>
      
      <button onClick={() => setIsOpen(true)}>
        Abrir Modal
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Título del Modal"
        subtitle="Subtítulo opcional"
      >
        <p>Contenido del modal aquí. Estamos probando</p>
      </Modal>
      
 
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 
        
        <Card>
          <p className="text-sm text-[var(--color-hi-text-sub)]">
            Card sin título ni acciones, solo contenido.
          </p>
        </Card>
 
        
        <Card
          title="Presupuesto vs Gasto Real"
          subtitle="Comparativa por trimestre"
        >
          <div className="h-24 rounded-[var(--radius-sm)]
            bg-[var(--color-hi-bg)] flex items-center justify-center">
            <span className="text-xs text-[var(--color-hi-text-hint)]">
               grafica lobaaaa
            </span>
          </div>
        </Card>

        <StatCard title="Personas con diabetes" subtitle="CDMX, 2026" value="1,250K" label="Última actualización: 2025-12-31" />
 
      </div>

      <Card
        title="Actividad Reciente"
        subtitle="Usuarios conectados esta semana"   //aqui iria la searchbar de Gabo
      >
        <DataTable
          columns={activityColumnsMock}
          data={usersMock}
        />
      </Card>
    </div>
  )
}

export default App
