import { useEffect, useState } from 'react'
import Modal             from '../../../common/Modal/Modal'
import InputField        from '../../../common/InputField/InputField'
import Dropdown          from '../../../common/Dropdown/Dropdown'
import Button            from '../../../common/Button/Button'
import ConfirmActionModal from '../ConfirmActionModal/ConfirmActionModal'
import type { User } from '../../../../types/User'
import type { UpdateUserPayload } from '../../../../services/userService'

// ── Types ─────────────────────────────────────────────────────────────────────

interface EditUserModalProps {
  user:    User | null
  isOpen:  boolean
  onClose: () => void
  onEdit:  (id: string, payload: UpdateUserPayload) => void | Promise<void>
}

// ── Config ────────────────────────────────────────────────────────────────────

const ROL_OPTIONS = [
  { value: '2', label: 'D.G. — Director General'          },
  { value: '3', label: 'D.F. — Director de Finanzas'      },
  { value: '4', label: 'D.M. — Director de Mercadotecnia' },
  { value: '1', label: 'Admin'                            },
]

const ROL_LABEL: Record<string, string> = {
  '1': 'Admin',
  '2': 'D.G.',
  '3': 'D.F.',
  '4': 'D.M.',
}

const ROL_ID: Record<string, string> = Object.fromEntries(
  Object.entries(ROL_LABEL).map(([id, label]) => [label, id])
)

const ESTATUS_OPTIONS = [
  { value: 'Activo',   label: 'Activo'   },
  { value: 'Inactivo', label: 'Inactivo' },
]

// ── Component ─────────────────────────────────────────────────────────────────

export default function EditUserModal({ user, isOpen, onClose, onEdit }: EditUserModalProps) {
  const [nombre,       setNombre]       = useState('')
  const [apellido,     setApellido]     = useState('')
  const [rol,          setRol]          = useState('')
  const [estatus,      setEstatus]      = useState<User['estatus']>('Activo')
  const [submitting,   setSubmitting]   = useState(false)
  const [apiError,     setApiError]     = useState<string | null>(null)
  const [confirmOpen,  setConfirmOpen]  = useState(false)
  const [pendingPayload, setPendingPayload] = useState<UpdateUserPayload | null>(null)

  useEffect(() => {
    if (user) {
      setNombre(user.nombre)
      setApellido(user.apellido)
      setRol(ROL_ID[user.rol] ?? '')
      setEstatus(user.estatus)
    }
    setApiError(null)
  }, [user])

  const handleClose = () => {
    setApiError(null)
    setPendingPayload(null)
    onClose()
  }

  const handleSubmit = () => {
    if (!user) return

    const payload: UpdateUserPayload = {}
    const trimNombre   = nombre.trim()
    const trimApellido = apellido.trim()

    if (trimNombre   && trimNombre   !== user.nombre)   payload.name     = trimNombre
    if (trimApellido && trimApellido !== user.apellido) payload.lastName = trimApellido
    if (rol && ROL_LABEL[rol] !== user.rol)             payload.roleId   = Number(rol)
    if (estatus !== user.estatus)                       payload.status   = estatus === 'Activo'

    if (Object.keys(payload).length === 0) {
      handleClose()
      return
    }

    setPendingPayload(payload)
    setConfirmOpen(true)
  }

  const handleConfirm = async (justification: string) => {
    if (!user || !pendingPayload) return
    setSubmitting(true)
    setApiError(null)
    try {
      await onEdit(user.id, { ...pendingPayload, justification })
      handleClose()
    } catch (err: any) {
      setApiError(err?.response?.data?.message ?? 'No se pudo actualizar el usuario')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Editar Usuario"
      subtitle="Modifica los campos que deseas actualizar"
      size="md"
    >
      <div className="flex flex-col gap-4">

        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="Nombre"
            placeholder="Ej: María"
            value={nombre}
            onChange={v => { setNombre(v); setApiError(null) }}
          />
          <InputField
            label="Apellido"
            placeholder="Ej: López"
            value={apellido}
            onChange={v => { setApellido(v); setApiError(null) }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Dropdown
            label="Rol"
            placeholder="Selecciona un rol…"
            options={ROL_OPTIONS}
            value={rol}
            onChange={v => { setRol(v); setApiError(null) }}
          />
          <Dropdown
            label="Estatus"
            options={ESTATUS_OPTIONS}
            value={estatus}
            onChange={v => { setEstatus(v as User['estatus']); setApiError(null) }}
          />
        </div>

        {apiError && (
          <p className="text-sm text-red-600">{apiError}</p>
        )}

        <div className="flex justify-end gap-3 pt-1">
          <Button variant="secondary" onClick={handleClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Guardando…' : 'Guardar Cambios'}
          </Button>
        </div>

      </div>
      <ConfirmActionModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        accionLabel={`editar al usuario "${user?.nombre} ${user?.apellido}"`}
        loading={submitting}
        onConfirm={async (justification) => {
          setConfirmOpen(false)
          await handleConfirm(justification)
        }}
      />
    </Modal>
  )
}
