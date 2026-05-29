import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import EditActionButton from './EditActionButton'



// ════════════════════════════════════════════════════════════
// EditButton
// ════════════════════════════════════════════════════════════

const meta: Meta<typeof EditActionButton> = {
  title:     'Features/Usuarios/EditButton',
  component: EditActionButton,
  tags:      ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**EditButton** — botón ícono de lápiz basado en \`Button variant="icon"\`.

Al hacer hover el ícono se pinta del teal primario (\`--color-hi-primary\`)
y el fondo toma \`--color-hi-primary-soft\`.

Usar en tablas donde se requiere editar un registro.
        `,
      },
    },
  },
  args: { onClick: fn() },
}


export default meta

type EditStory = StoryObj<typeof EditActionButton>

export const Default: EditStory = {
  name: 'Default',
  args: {},
}

export const Disabled: EditStory = {
  name: 'Disabled',
  args: { disabled: true },
}

export const EnTabla: EditStory = {
  name: 'En contexto de tabla',
  render: () => (
    <div className="flex items-center gap-2 p-3
      border border-[var(--color-hi-border)] rounded-[var(--radius-md)]">
      <span className="text-sm text-[var(--color-hi-text-main)] flex-1">
        Alejandra Mosri
      </span>
      <EditActionButton onClick={fn()} />
    </div>
  ),
}