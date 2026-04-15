import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import Navbar from './Navbar'

const PROJECT_LINKS = [
  { key: 'inicio',        label: 'Inicio',        path: '/' },
  { key: 'proyecciones',  label: 'Proyecciones',  path: '/proyecciones' },
  { key: 'reportes',      label: 'Reportes',      path: '/reportes' },
]

const meta = {
  title: 'Common/Navbar',
  component: Navbar,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: {
    links:    PROJECT_LINKS,
    onLogout: fn(),
  },
} satisfies Meta<typeof Navbar>

export default meta
type Story = StoryObj<typeof meta>

export const InicioActivo: Story = {
  name: 'Inicio activo',
  args: { activePath: '/' },
}

export const ProyeccionesActivo: Story = {
  name: 'Proyecciones activo',
  args: { activePath: '/proyecciones' },
}

export const ReportesActivo: Story = {
  name: 'Reportes activo',
  args: { activePath: '/reportes' },
}

export const SinActivo: Story = {
  name: 'Sin link activo',
  args: { activePath: '/otra-ruta' },
}
