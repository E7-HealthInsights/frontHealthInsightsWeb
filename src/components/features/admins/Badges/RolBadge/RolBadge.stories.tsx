import type { Meta, StoryObj } from '@storybook/react'
import RolBadge from './RolBadge'

const meta: Meta<typeof RolBadge> = {
  title:     'Features/Usuarios/RolBadge',
  component: RolBadge,
  tags:      ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**RolBadge** muestra el rol de un usuario dentro de HealthInsights.
Siempre usa \`variant="info"\` y \`shape="rounded"\`.

Acepta cualquier string como \`rol\` para soportar roles
que el backend agregue sin necesitar cambios en el frontend.
        `,
      },
    },
  },
  argTypes: {
    rol: {
      control: 'text',
      description: 'Rol del usuario — cualquier string es válido',
    },
  },
}

export default meta
type Story = StoryObj<typeof RolBadge>

export const DirectorGeneral: Story = {
  name: 'D.G. — Director General',
  args: { rol: 'D.G.' },
}

export const DirectorFinanzas: Story = {
  name: 'D.F. — Director de Finanzas',
  args: { rol: 'D.F.' },
}

export const DirectorMedico: Story = {
  name: 'D.M. — Director de Mercadotecnia',
  args: { rol: 'D.M.' },
}

export const TodosLosRoles: Story = {
  name: 'Todos los roles',
  render: () => (
    <div className="flex gap-3 flex-wrap">
      <RolBadge rol="D.G." />
      <RolBadge rol="D.F." />
      <RolBadge rol="D.M." />
    </div>
  ),
}

export const RolCustom: Story = {
  name: 'Rol personalizado (extensible)',
  args: { rol: 'Admin' },
}