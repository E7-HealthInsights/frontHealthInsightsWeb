import type { Meta, StoryObj } from '@storybook/react'
import ActivityTable, { type ActivityRow } from './ActivityTable'

const mockActivity: ActivityRow[] = [
  {
    id:        1,
    admin:     'Carlos Méndez',
    accion:    'Usuario creado',
    detalle:   'Alta solicitada por director de área.',
    timestamp: '04/03/2026 09:15',
  },
  {
    id:        2,
    admin:     'Ana García',
    accion:    'Dataset editado',
    detalle:   'Corrección de metadatos aprobada en reunión de equipo.',
    timestamp: '04/03/2026 11:42',
  },
  {
    id:        3,
    admin:     'Carlos Méndez',
    accion:    'Usuario eliminado',
    detalle:   'Usuario dio de baja voluntariamente. Oficio #2026-031.',
    timestamp: '03/03/2026 16:08',
  },
  {
    id:        4,
    admin:     'Ana García',
    accion:    'Dataset creado',
    detalle:   'Carga inicial ENSANUT 2024 aprobada por coordinación.',
    timestamp: '02/03/2026 10:30',
  },
  {
    id:        5,
    admin:     'Roberto Silva',
    accion:    'Dataset eliminado',
    detalle:   'Dataset duplicado detectado en auditoría interna.',
    timestamp: '01/03/2026 14:55',
  },
]

const meta: Meta<typeof ActivityTable> = {
  title:     'Features/Actividad/ActivityTable',
  component: ActivityTable,
  tags:      ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**ActivityTable** muestra la bitácora de acciones críticas ejecutadas por admins.

Cada registro proviene de la tabla \`activity_log\` en BD:

| Campo | Descripción |
|---|---|
| \`admin\` | Nombre del admin que ejecutó la acción |
| \`accion\` | Tipo: creado / editado / eliminado × Usuario o Dataset |
| \`detalle\` | Justificación ingresada por el admin en el modal |
| \`timestamp\` | Fecha y hora del evento |

Los badges de acción siguen semántica de color:
- **Verde** → creado
- **Teal** → editado  
- **Rojo** → eliminado
        `,
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof ActivityTable>

export const Default: Story = {
  name: 'Bitácora con registros',
  args: { data: mockActivity },
}

export const SoloUsuarios: Story = {
  name: 'Filtrada — solo acciones de Usuarios',
  args: {
    data: mockActivity.filter(r => r.accion.includes('Usuario')),
  },
}

export const SoloDatasets: Story = {
  name: 'Filtrada — solo acciones de Datasets',
  args: {
    data: mockActivity.filter(r => r.accion.includes('Dataset')),
  },
}

export const Vacia: Story = {
  name: 'Sin registros (empty state)',
  args: { data: [] },
}