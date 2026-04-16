import { useState } from 'react'
import Modal      from '../../../common/Modal'
import InputField from '../../../common/InputField'
import Dropdown   from '../../../common/Dropdown'
import Button     from '../../../common/Button'

export interface NewProjectionData {
  nombre:      string
  tipo:        string
  fuenteDatos: string
  periodo:     string
}

interface NewProjectionModalProps {
  isOpen:    boolean
  onClose:   () => void
  onSubmit:  (data: NewProjectionData) => void
  loading?:  boolean
}

const TIPOS_PROYECCION = [
  { value: 'epidemiologica', label: 'Epidemiológica' },
  { value: 'financiera',     label: 'Financiera'     },
  { value: 'demografica',    label: 'Demográfica'    },
]

const FUENTES_DATOS = [
  { value: 'inegi',   label: 'INEGI'              },
  { value: 'imss',    label: 'IMSS'               },
  { value: 'issste',  label: 'ISSSTE'             },
  { value: 'salud',   label: 'Secretaría de Salud' },
]

const PERIODOS = [
  { value: '1',  label: '1 año'   },
  { value: '3',  label: '3 años'  },
  { value: '5',  label: '5 años'  },
  { value: '10', label: '10 años' },
]

const EMPTY: NewProjectionData = {
  nombre:      '',
  tipo:        '',
  fuenteDatos: '',
  periodo:     '',
}

export default function NewProjectionModal({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}: NewProjectionModalProps) {
  const [form,   setForm]   = useState<NewProjectionData>(EMPTY)
  const [errors, setErrors] = useState<Partial<NewProjectionData>>({})

  const set = <K extends keyof NewProjectionData>(key: K, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }))
  }

  const validate = (): boolean => {
    const next: Partial<NewProjectionData> = {}
    if (!form.nombre.trim())   next.nombre      = 'El nombre es requerido'
    if (!form.tipo)            next.tipo        = 'Selecciona un tipo'
    if (!form.fuenteDatos)     next.fuenteDatos = 'Selecciona una fuente'
    if (!form.periodo)         next.periodo     = 'Selecciona un periodo'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    onSubmit(form)
  }

  const handleClose = () => {
    setForm(EMPTY)
    setErrors({})
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Nueva proyección"
      subtitle="Configura los parámetros para generar la proyección."
      size="md"
    >
      <div className="flex flex-col gap-4">
        <InputField
          label="Nombre de la proyección"
          placeholder="Ej. Proyección prevalencia 2030"
          value={form.nombre}
          onChange={v => set('nombre', v)}
          error={errors.nombre}
          disabled={loading}
        />

        <Dropdown
          label="Tipo de proyección"
          placeholder="Seleccionar tipo…"
          options={TIPOS_PROYECCION}
          value={form.tipo}
          onChange={v => set('tipo', v)}
          error={errors.tipo}
          disabled={loading}
        />

        <Dropdown
          label="Fuente de datos"
          placeholder="Seleccionar fuente…"
          options={FUENTES_DATOS}
          value={form.fuenteDatos}
          onChange={v => set('fuenteDatos', v)}
          error={errors.fuenteDatos}
          disabled={loading}
        />

        <Dropdown
          label="Periodo de proyección"
          placeholder="Seleccionar periodo…"
          options={PERIODOS}
          value={form.periodo}
          onChange={v => set('periodo', v)}
          error={errors.periodo}
          disabled={loading}
        />

        <div className="flex justify-end gap-2 mt-2">
          <Button
            variant="secondary"
            size="md"
            onClick={handleClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="md"
            loading={loading}
            onClick={handleSubmit}
          >
            Crear proyección
          </Button>
        </div>
      </div>
    </Modal>
  )
}
