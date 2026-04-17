import type { Meta, StoryObj } from '@storybook/react'
import ActivityTable, { type ActivityRow } from './ActivityTable'

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockActivity: ActivityRow[] = [
  { id: 1, nombre: 'Carlos Méndez',  correo: 'carlos.m@hospital.mx', estatus: 'Activo',    lastConnection: '04/03/2026', tiempoConectado: '3h 30m' },
  { id: 2, nombre: 'Ana García',     correo: 'ana.g@salud.mx',       estatus: 'Activo',    lastConnection: '04/03/2026', tiempoConectado: '1h 45m' },
  { id: 3, nombre: 'Roberto Silva',  correo: 'r.silva@instituto.mx', estatus: 'Inactivo',  lastConnection: '03/03/2026', tiempoConectado: '0h 20m' },
  { id: 4, nombre: 'Laura Pérez',    correo: 'l.perez@salud.mx',     estatus: 'En riesgo', lastConnection: '01/03/2026', tiempoConectado: '0h 50m' },
]

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<typeof ActivityTable> = {
  title:     'Features/Actividad/ActivityTable',
  component: ActivityTable,
  tags:      ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**ActivityTable** muestra el historial de sesiones de los usuarios.

Los datos provienen de la tabla \`sessions\` del backend:
- \`lastConnection\` → \`sessions.logged_in_at\` formateado
- \`tiempoConectado\` → calculado en backend como \`logged_out_at - logged_in_at\`

El color de **Tiempo Conectado** es visual:
- Verde → ≥ 2 horas
- Normal → 1–2 horas  
- Gris → < 1 hora
        `,
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof ActivityTable>

// ─── Stories ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  name: 'Actividad reciente',
  args: { data: mockActivity },
}

export const TiemposVariados: Story = {
  name: 'Colores de tiempo conectado',
  args: {
    data: [
      { id: 1, nombre: 'Usuario A', correo: 'a@test.mx', estatus: 'Activo', lastConnection: '04/03/2026', tiempoConectado: '3h 00m' },
      { id: 2, nombre: 'Usuario B', correo: 'b@test.mx', estatus: 'Activo', lastConnection: '04/03/2026', tiempoConectado: '1h 30m' },
      { id: 3, nombre: 'Usuario C', correo: 'c@test.mx', estatus: 'Activo', lastConnection: '04/03/2026', tiempoConectado: '0h 15m' },
    ],
  },
}

export const Vacia: Story = {
  name: 'Sin actividad (empty state)',
  args: { data: [] },
}