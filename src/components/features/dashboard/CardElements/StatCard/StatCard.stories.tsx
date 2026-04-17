import type { Meta, StoryObj } from '@storybook/react-vite'
import StatCard from './StatCard'

const meta = {
  title: 'Features/Dashboard/StatCard',
  component: StatCard,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StatCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Prevalencia Nacional',
    subtitle: 'Cierre Q1 2026',
    value: '12.4 %',
    label: 'Actualizado el 01/03/2026',
  },
}

export const ValorNumerico: Story = {
  name: 'Valor numérico',
  args: {
    title: 'Pacientes Registrados',
    subtitle: 'Estado de Tabasco',
    value: 48320,
    label: 'Total acumulado 2025',
  },
}

export const ValorGasto: Story = {
  name: 'Indicador de gasto',
  args: {
    title: 'Gasto en Tratamiento',
    subtitle: 'Comparativa anual',
    value: '$ 2.1 B',
    label: '14 % del presupuesto de salud',
  },
}
