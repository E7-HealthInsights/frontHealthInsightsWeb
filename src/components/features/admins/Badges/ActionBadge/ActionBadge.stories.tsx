import type { Meta, StoryObj } from '@storybook/react'
import ActionBadge from './ActionBadge'

const meta: Meta<typeof ActionBadge> = {
  title:     'Features/Actividad/ActionBadge',
  component: ActionBadge,
  tags:      ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**ActionBadge** — wrapper semántico sobre \`Badge\` para las acciones de la bitácora.

Mapea cada \`ActivityAction\` a un color con significado:

| Acción | Color |
|---|---|
| creado | Verde |
| editado | Teal suave |
| eliminado | Rojo |

El \`variant="info"\` de \`Badge\` se sobreescribe vía \`className\`,
lo que permite reutilizar la forma y tipografía del Badge base
manteniendo el color semántico de cada acción.
        `,
      },
    },
  },
  argTypes: {
    action: {
      control: 'select',
      options: [
        'Usuario creado',
        'Usuario editado',
        'Usuario eliminado',
        'Dataset creado',
        'Dataset editado',
        'Dataset eliminado',
      ],
      description: 'Acción registrada en la bitácora',
    },
  },
}

export default meta
type Story = StoryObj<typeof ActionBadge>

// ─── Stories individuales ─────────────────────────────────────────────────────

export const UsuarioCreado: Story = {
  name: 'Usuario creado',
  args: { action: 'Usuario creado' },
}

export const UsuarioEditado: Story = {
  name: 'Usuario editado',
  args: { action: 'Usuario editado' },
}

export const UsuarioEliminado: Story = {
  name: 'Usuario eliminado',
  args: { action: 'Usuario eliminado' },
}

export const DatasetCreado: Story = {
  name: 'Dataset creado',
  args: { action: 'Dataset creado' },
}

export const DatasetEditado: Story = {
  name: 'Dataset editado',
  args: { action: 'Dataset editado' },
}

export const DatasetEliminado: Story = {
  name: 'Dataset eliminado',
  args: { action: 'Dataset eliminado' },
}

// ─── Todas juntas ─────────────────────────────────────────────────────────────

export const TodasLasAcciones: Story = {
  name: 'Todas las acciones',
  render: () => (
    <div className="flex flex-col gap-4">
      {/* Acciones de Usuario */}
      <div>
        <p className="text-xs text-[var(--color-hi-text-sub)] mb-2 font-medium uppercase tracking-wide">
          Usuarios
        </p>
        <div className="flex gap-2 flex-wrap">
          <ActionBadge action="Usuario creado"    />
          <ActionBadge action="Usuario editado"   />
          <ActionBadge action="Usuario eliminado" />
        </div>
      </div>

      {/* Acciones de Dataset */}
      <div>
        <p className="text-xs text-[var(--color-hi-text-sub)] mb-2 font-medium uppercase tracking-wide">
          Datasets
        </p>
        <div className="flex gap-2 flex-wrap">
          <ActionBadge action="Dataset creado"    />
          <ActionBadge action="Dataset editado"   />
          <ActionBadge action="Dataset eliminado" />
        </div>
      </div>
    </div>
  ),
}

// ─── En contexto de tabla ─────────────────────────────────────────────────────

export const EnContextoDeTabla: Story = {
  name: 'En contexto de tabla (fila de bitácora)',
  render: () => (
    <div className="w-full border border-[var(--color-hi-border)]
      rounded-[var(--radius-md)] overflow-hidden">
      {[
        { admin: 'Carlos Méndez', action: 'Usuario creado',    timestamp: '04/03/2026 09:15' },
        { admin: 'Ana García',    action: 'Dataset editado',   timestamp: '04/03/2026 11:42' },
        { admin: 'Carlos Méndez', action: 'Usuario eliminado', timestamp: '03/03/2026 16:08' },
      ].map((row, i) => (
        <div
          key={i}
          className={`flex items-center gap-4 px-4 py-3 text-sm
            ${i !== 0 ? 'border-t border-[var(--color-hi-border)]' : ''}
            hover:bg-[var(--color-hi-bg)] transition-colors`}
        >
          <span className="text-[var(--color-hi-text-sub)] w-36 shrink-0">
            {row.timestamp}
          </span>
          <span className="text-[var(--color-hi-text-main)] w-32 shrink-0">
            {row.admin}
          </span>
          <ActionBadge action={row.action as never} />
        </div>
      ))}
    </div>
  ),
}