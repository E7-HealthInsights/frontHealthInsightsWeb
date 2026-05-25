import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import ReportCard from './ReportCard'

const meta = {
  title: 'Features/Reports/ReportCard',
  component: ReportCard,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 300 }}>
        <Story />
      </div>
    ),
  ],
  args: {
    onView: fn(),
    onDownload: fn(),
    onDelete: fn(),
  },
} satisfies Meta<typeof ReportCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: 'Default',
  args: {
    id: 'RPT-001',
    title: 'Análisis Diabetes Q1 2026',
    date: '01/03/2026',
  },
}

export const ReporteGrande: Story = {
  name: 'Reporte de gran tamaño',
  args: {
    id: 'RPT-042',
    title: 'Reporte Anual de Prevalencia Nacional 2025',
    date: '31/12/2025',
  },
}

export const ReporteReciente: Story = {
  name: 'Reporte reciente',
  args: {
    id: 'RPT-099',
    title: 'Indicadores Epidemiológicos Q1 2026',
    date: '15/04/2026',
  },
}
