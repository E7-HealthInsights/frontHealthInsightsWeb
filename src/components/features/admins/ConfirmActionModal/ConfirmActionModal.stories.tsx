import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import ConfirmActionModal from './ConfirmActionModal'
import Button from '../../../common/Button/Button'

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<typeof ConfirmActionModal> = {
  title:     'Features/Usuarios/ConfirmActionModal',
  component: ConfirmActionModal,
  tags:      ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**ConfirmActionModal** — modal de confirmación en dos pasos para acciones sensibles del panel de administración.

**Paso 1 — Confirmación:** muestra el ícono de advertencia y describe la acción que se va a ejecutar.
**Paso 2 — Justificación:** campo de texto obligatorio para dejar registro en la bitácora antes de confirmar.

El callback \`onConfirm\` recibe la justificación ya limpiada (\`trim()\`).
La prop \`loading\` bloquea el botón Confirmar mientras se procesa la petición.
        `,
      },
    },
  },
  args: {
    isOpen:      true,
    accionLabel: 'eliminar al usuario "Carlos Méndez"',
    onClose:     fn(),
    onConfirm:   fn(),
  },
}

export default meta
type Story = StoryObj<typeof ConfirmActionModal>

// ─── Stories ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  name: 'Paso 1 — Confirmación',
  args: {
    accionLabel: 'eliminar al usuario "Carlos Méndez"',
    loading:     false,
  },
}

export const InactivarUsuario: Story = {
  name: 'Paso 1 — Inactivar usuario',
  args: {
    accionLabel: 'inactivar al usuario "Dr. Ramírez Vega"',
    loading:     false,
  },
}

export const CambiarRol: Story = {
  name: 'Paso 1 — Cambio de rol',
  args: {
    accionLabel: 'cambiar el rol de "Ana Torres" a Director Médico',
    loading:     false,
  },
}

export const ConLoading: Story = {
  name: 'Paso 2 — Confirmando (loading)',
  render: (args) => {
    // Muestra el paso de justificación con estado de carga activo.
    // Para llegar aquí en producción: clic en "Continuar" desde el paso 1.
    const [open, setOpen] = useState(true)
    return (
      <ConfirmActionModal
        {...args}
        isOpen={open}
        onClose={() => setOpen(false)}
        loading={true}
        onConfirm={async () => {
          await new Promise(r => setTimeout(r, 2000))
          setOpen(false)
        }}
      />
    )
  },
  args: {
    accionLabel: 'eliminar al usuario "Carlos Méndez"',
  },
}

export const Interactivo: Story = {
  name: 'Interactivo — flujo completo',
  render: (args) => {
    const [open, setOpen]       = useState(false)
    const [result, setResult]   = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleConfirm = async (justificacion: string) => {
      setLoading(true)
      await new Promise(r => setTimeout(r, 1200))
      setLoading(false)
      setResult(justificacion)
      setOpen(false)
    }

    return (
      <div className="flex flex-col items-start gap-4 p-4">
        <Button variant="primary" onClick={() => { setResult(null); setOpen(true) }}>
          Eliminar usuario
        </Button>

        {result && (
          <div className="rounded-[var(--radius-md)] border border-[var(--color-hi-border)]
            bg-[var(--color-hi-surface)] px-4 py-3 text-sm text-[var(--color-hi-text-sub)]">
            <span className="font-semibold text-[var(--color-hi-navy)]">Acción confirmada.</span>
            {' '}Justificación registrada:{' '}
            <span className="italic">"{result}"</span>
          </div>
        )}

        <ConfirmActionModal
          {...args}
          isOpen={open}
          loading={loading}
          onClose={() => setOpen(false)}
          onConfirm={handleConfirm}
        />
      </div>
    )
  },
  args: {
    accionLabel: 'eliminar al usuario "Carlos Méndez"',
  },
  parameters: {
    docs: {
      description: {
        story: 'Flujo completo: abre el modal, navega por los dos pasos y muestra la justificación confirmada.',
      },
    },
  },
}
