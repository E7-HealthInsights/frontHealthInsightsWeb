import type { Meta, StoryObj } from '@storybook/react-vite'
import Badge from './Badge'

const meta = {
  title: 'Common/Badge',
  component: Badge,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Success: Story = {
  args: { label: 'Activo', variant: 'success' },
}

export const Danger: Story = {
  args: { label: 'Inactivo', variant: 'danger' },
}

export const Warning: Story = {
  args: { label: 'En riesgo', variant: 'warning' },
}

export const Info: Story = {
  args: { label: 'D.G.', variant: 'info' },
}

export const Neutral: Story = {
  args: { label: 'Pendiente', variant: 'neutral' },
}

export const ShapeRounded: Story = {
  name: 'Shape: rounded',
  args: { label: 'Admin', variant: 'info', shape: 'rounded' },
}

export const TodasLasVariantes: Story = {
  name: 'Todas las variantes',
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge label="Activo"    variant="success" />
      <Badge label="Inactivo"  variant="danger" />
      <Badge label="En riesgo" variant="warning" />
      <Badge label="D.G."      variant="info" />
      <Badge label="Pendiente" variant="neutral" />
    </div>
  ),
}
