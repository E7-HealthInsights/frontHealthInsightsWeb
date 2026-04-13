import { useState } from 'react'
import './App.css'
import Modal from './components/common/Modal'
import Card from './components/common/Card'


function App() {
  const [isOpen, setIsOpen] = useState(false)
  const [log, setLog] = useState('')

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
      <p className="text-xs text-[var(--color-hi-text-sub)] mb-6">
        Acción ejecutada: <strong>{log || '—'}</strong>
      </p>
 
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
 
        
        <Card
          title="Gasto en Diabetes"
          subtitle="35% del presupuesto total"
          actions={[
            { label: 'Editar',    onClick: () => setLog('Editar') },
            { label: 'Duplicar',  onClick: () => setLog('Duplicar') },
            { label: 'Eliminar',  onClick: () => setLog('Eliminar'), danger: true },
          ]}
        >
          <p className="text-3xl font-bold text-[var(--color-hi-navy)]">
            $320M
          </p>
          <p className="text-xs text-[var(--color-hi-text-sub)] mt-1">
            Haz click en los 3 puntitos para ver las acciones
          </p>
        </Card>
 
      </div>
    </div>
  )
}

export default App
