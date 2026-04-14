import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import Button from './Button'

const meta = {
  title: 'Common/Button',
  component: Button,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'icon'] },
    size:    { control: 'select', options: ['sm', 'md', 'lg'] },
  },
  args: { onClick: fn() },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    children: 'Generar reporte',
  },
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    size: 'md',
    children: 'Cancelar',
  },
}

export const Icon: Story = {
  args: {
    variant: 'icon',
    ariaLabel: 'Eliminar usuario',
    children: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="2,4 14,4" />
        <path d="M5 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
        <rect x="3" y="4" width="10" height="10" rx="1" />
        <line x1="6" y1="7" x2="6" y2="11" />
        <line x1="10" y1="7" x2="10" y2="11" />
      </svg>
    ),
  },
}

export const Small: Story = {
  args: {
    variant: 'primary',
    size: 'sm',
    children: 'Exportar CSV',
  },
}

export const Large: Story = {
  args: {
    variant: 'primary',
    size: 'lg',
    children: 'Ingresar al sistema',
  },
}

export const Loading: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    loading: true,
    children: 'Generando reporte…',
  },
}

export const Disabled: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    disabled: true,
    children: 'Descargar PDF',
  },
}

export const SecondarySmall: Story = {
  name: 'Secondary (sm)',
  args: {
    variant: 'secondary',
    size: 'sm',
    children: 'Ver detalle',
  },
}
