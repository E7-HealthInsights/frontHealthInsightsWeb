import { useState } from 'react'
import Modal      from '../../../common/Modal/Modal'
import InputField from '../../../common/InputField/InputField'
import Dropdown   from '../../../common/Dropdown/Dropdown'
import Button     from '../../../common/Button/Button'
import type { User } from '../../../../types/User'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface NewUserPayload {
  nombre:   string
  apellido: string
  correo:   string
  password: string
  roleId:   number
  rol:      string
  estatus:  User['estatus']
}

interface CreateUserModalProps {
  isOpen:   boolean
  onClose:  () => void
  onCreate: (payload: NewUserPayload) => void | Promise<void>
}

// ── Config ────────────────────────────────────────────────────────────────────

const ROL_OPTIONS = [
  { value: '2', label: 'D.G. — Director General'           },
  { value: '3', label: 'D.F. — Director de Finanzas'       },
  { value: '4', label: 'D.M. — Director de Mercadotecnia'  },
  { value: '1', label: 'Admin'                             },
]

const ROL_LABEL: Record<string, string> = {
  '1': 'Admin',
  '2': 'D.G.',
  '3': 'D.F.',
  '4': 'D.M.',
}

const ESTATUS_OPTIONS = [
  { value: 'Activo',   label: 'Activo'   },
  { value: 'Inactivo', label: 'Inactivo' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

const EMPTY = { nombre: '', apellido: '', correo: '', password: '', rol: '', estatus: 'Activo' }

const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

// ── Component ─────────────────────────────────────────────────────────────────

export default function CreateUserModal({ isOpen, onClose, onCreate }: CreateUserModalProps) {
  const [form,      setForm]      = useState(EMPTY)
  const [errors,    setErrors]    = useState<Partial<typeof EMPTY>>({})
  const [submitting, setSubmitting] = useState(false)
  const [apiError,  setApiError]  = useState<string | null>(null)

  const set = (field: keyof typeof EMPTY) => (val: string) => {
    setForm(prev => ({ ...prev, [field]: val }))
    setErrors(prev => ({ ...prev, [field]: '' }))
    setApiError(null)
  }

  const validate = () => {
    const e: Partial<typeof EMPTY> = {}
    if (!form.nombre.trim())              e.nombre   = 'Campo requerido'
    if (!form.apellido.trim())            e.apellido = 'Campo requerido'
    if (!form.correo.trim())              e.correo   = 'Campo requerido'
    else if (!isValidEmail(form.correo))  e.correo   = 'Correo inválido'
    if (!form.password.trim())            e.password = 'Campo requerido'
    else if (form.password.length < 8)    e.password = 'Mínimo 8 caracteres'
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(form.password))
                                          e.password = 'Debe incluir mayúscula, minúscula y número'
    if (!form.rol)                        e.rol      = 'Selecciona un rol'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSubmitting(true)
    setApiError(null)
    try {
      await onCreate({
        nombre:   form.nombre.trim(),
        apellido: form.apellido.trim(),
        correo:   form.correo.trim(),
        password: form.password,
        roleId:   Number(form.rol),
        rol:      ROL_LABEL[form.rol] ?? form.rol,
        estatus:  form.estatus as User['estatus'],
      })
      handleClose()
    } catch (err: any) {
      setApiError(err?.response?.data?.message ?? 'No se pudo crear el usuario')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setForm(EMPTY)
    setErrors({})
    setApiError(null)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Nuevo Usuario"
      subtitle="Completa los datos para crear una cuenta"
      size="md"
    >
      <div className="flex flex-col gap-4">

        {/* Nombre y Apellido */}
        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="Nombre"
            placeholder="Ej: María"
            value={form.nombre}
            onChange={set('nombre')}
            error={errors.nombre}
          />
          <InputField
            label="Apellido"
            placeholder="Ej: López"
            value={form.apellido}
            onChange={set('apellido')}
            error={errors.apellido}
          />
        </div>

        {/* Correo */}
        <InputField
          label="Correo electrónico"
          placeholder="correo@ejemplo.com"
          type="email"
          value={form.correo}
          onChange={set('correo')}
          error={errors.correo}
        />

        {/* Contraseña */}
        <InputField
          label="Contraseña"
          placeholder="Mínimo 8 caracteres"
          type="password"
          value={form.password}
          onChange={set('password')}
          error={errors.password}
        />

        {/* Rol y Estatus */}
        <div className="grid grid-cols-2 gap-4">
          <Dropdown
            label="Rol"
            placeholder="Selecciona un rol…"
            options={ROL_OPTIONS}
            value={form.rol}
            onChange={set('rol')}
            error={errors.rol}
          />
          <Dropdown
            label="Estatus"
            options={ESTATUS_OPTIONS}
            value={form.estatus}
            onChange={set('estatus')}
          />
        </div>

        {apiError && (
          <p className="text-sm text-red-600">{apiError}</p>
        )}

        {/* Acciones */}
        <div className="flex justify-end gap-3 pt-1">
          <Button variant="secondary" onClick={handleClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Creando…' : 'Crear Usuario'}
          </Button>
        </div>

      </div>
    </Modal>
  )
}
