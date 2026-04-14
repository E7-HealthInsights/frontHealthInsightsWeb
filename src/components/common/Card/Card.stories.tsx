import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import Card from './Card'

const meta = {
  title: 'Common/Card',
  component: Card,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 400 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

// Sin encabezado — solo contenido
export const SoloContenido: Story = {
  name: 'Solo contenido',
  args: {
    children: (
      <p className="text-sm text-[var(--color-hi-text-sub)]">
        Prevalencia nacional de diabetes: <strong>12.4 %</strong> de la población adulta.
      </p>
    ),
  },
}

// Con título
export const ConTitulo: Story = {
  name: 'Con título',
  args: {
    title: 'Prevalencia Nacional',
    children: (
      <p className="text-sm text-[var(--color-hi-text-sub)]">
        Datos actualizados al cierre del cuarto trimestre 2025.
      </p>
    ),
  },
}

// Con título y subtítulo
export const ConSubtitulo: Story = {
  name: 'Con título y subtítulo',
  args: {
    title: 'Gasto en Diabetes',
    subtitle: 'Comparativa 2023 – 2025',
    children: (
      <p className="text-sm text-[var(--color-hi-text-sub)]">
        El gasto acumulado en tratamiento de diabetes representa el 14 % del presupuesto de salud pública.
      </p>
    ),
  },
}

// Con menú de acciones (sin acción peligrosa)
export const ConAcciones: Story = {
  name: 'Con acciones',
  args: {
    title: 'Reporte Ejecutivo Q4',
    subtitle: 'Generado el 31 dic 2025',
    actions: [
      { label: 'Descargar PDF', onClick: fn() },
      { label: 'Ver detalle',   onClick: fn() },
    ],
    children: (
      <p className="text-sm text-[var(--color-hi-text-sub)]">
        Resumen de indicadores epidemiológicos y financieros del trimestre.
      </p>
    ),
  },
}

// Con acción destructiva
export const ConAccionPeligrosa: Story = {
  name: 'Con acción destructiva',
  args: {
    title: 'Usuario: Dr. García',
    subtitle: 'Rol: Director General',
    actions: [
      { label: 'Editar',    onClick: fn() },
      { label: 'Archivar',  onClick: fn() },
      { label: 'Eliminar',  onClick: fn(), danger: true },
    ],
    children: (
      <p className="text-sm text-[var(--color-hi-text-sub)]">
        Último acceso: hace 2 horas.
      </p>
    ),
  },
}
