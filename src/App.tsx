import { useState } from 'react'
import './App.css'
import Modal from './components/common/Modal'


function App() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="p-8">
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
    </div>
  )
}

export default App
