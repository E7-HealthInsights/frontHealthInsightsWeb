import type { Meta, StoryObj } from '@storybook/react'
import StatusBadge from './StatusBadge'


const statusMeta: Meta<typeof StatusBadge> = {
  title:     'Features/Usuarios/StatusBadge',
  component: StatusBadge,
  tags:      ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**StatusBadge** es un wrapper semántico sobre \`Badge\` que mapea
un \`UserStatus\` a la variante visual correcta.

| Status | Variante | Color |
|---|---|---|
| Activo | success | Verde |
| Inactivo | danger | Rojo |
| En riesgo | warning | Amarillo |
| Pendiente | neutral | Gris |
        `,
      },
    },
  },
  argTypes: {
    status: {
      control: 'select',
      options: ['Activo', 'Inactivo'],
      description: 'Estado del usuario',
    },
  },
}

export default statusMeta
type StatusStory = StoryObj<typeof StatusBadge>

export const Activo: StatusStory = {
  args: { status: 'Activo' },
}

export const Inactivo: StatusStory = {
  args: { status: 'Inactivo' },
}

// Muestra todos los estados juntos
export const TodosLosEstados: StatusStory = {
  name: 'Todos los estados',
  render: () => (
    <div className="flex gap-3 flex-wrap">
      <StatusBadge status="Activo"    />
      <StatusBadge status="Inactivo"  />
    </div>
  ),
}