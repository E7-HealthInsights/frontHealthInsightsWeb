import type { Meta, StoryObj } from '@storybook/react'
import UsersTable from './UsersTable'
import type { User } from '../../../../types/User'
import { fn } from 'storybook/test'

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockUsers: User[] = [
  { id: 'USR-001', nombre: 'Alejandra', apellido: "Mosri",  correo: 'ale.m@hospital.mx',      rol: 'D.G.', estatus: 'Activo'   },
  { id: 'USR-002', nombre: 'Andres', apellido:"Torres",    correo: 'andy.t@salud.mx',         rol: 'D.F.', estatus: 'Activo'   },
  { id: 'USR-003', nombre: 'Olga', apellido: "Escamilla",   correo: 'o.escamilla@instituto.mx',rol: 'D.M.', estatus: 'Inactivo' },
  { id: 'USR-004', nombre: 'Cesar', apellido: "Betancourt",  correo: 'r.fuentes@salud.mx',      rol: 'D.F.', estatus: 'Inactivo' },
]

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<typeof UsersTable> = {
  title:     'Features/Usuarios/UsersTable',
  component: UsersTable,
  tags:      ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**UsersTable** — tabla de gestión de usuarios del panel de administración.
 
Columnas: ID · Nombre · Correo · Password (siempre oculto con ••••••••) · Rol · Estatus · Acciones.
 
Usa \`EditButton\` y \`DeleteButton\` internamente.
Los callbacks \`onEdit\` y \`onDelete\` suben el \`UserRow\` completo al padre.
        `,
      },
    },
  },
  args: {
    onEdit:   fn(),
    onDelete: fn(),
  },
}
 
export default meta
type Story = StoryObj<typeof UsersTable>
 
export const Default: Story = {
  name: 'Tabla completa',
  args: { data: mockUsers },
}
 
export const SoloActivos: Story = {
  name: 'Filtrada — solo Activos',
  args: { data: mockUsers.filter(u => u.estatus === 'Activo') },
}
 
export const SoloInactivos: Story = {
  name: 'Filtrada — solo Inactivos',
  args: { data: mockUsers.filter(u => u.estatus === 'Inactivo') },
}
 
export const Vacia: Story = {
  name: 'Sin resultados (empty state)',
  args: { data: [] },
}
 
export const UnRegistro: Story = {
  name: 'Un solo registro',
  args: { data: [mockUsers[0]] },
}