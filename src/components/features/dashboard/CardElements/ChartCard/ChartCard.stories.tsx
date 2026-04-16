import type { Meta, StoryObj } from '@storybook/react'
import ChartCard from './ChartCard'

// ─── Mock data ────────────────────────────────────────────────────────────────

const presupuestoData = [
  { trimestre: 'Q1', presupuesto: 42, real: 38 },
  { trimestre: 'Q2', presupuesto: 58, real: 61 },
  { trimestre: 'Q3', presupuesto: 55, real: 53 },
  { trimestre: 'Q4', presupuesto: 70, real: 74 },
]

const proyeccionData = [
  { anio: '2024', sinIntervencion: 320, conIntervencion: 320 },
  { anio: '2025', sinIntervencion: 345, conIntervencion: 310 },
  { anio: '2026', sinIntervencion: 372, conIntervencion: 298 },
  { anio: '2027', sinIntervencion: 401, conIntervencion: 285 },
  { anio: '2028', sinIntervencion: 433, conIntervencion: 270 },
]

const distribucionData = [
  { name: 'Diabetes',    value: 35 },
  { name: 'Cardiología', value: 25 },
  { name: 'Oncología',   value: 20 },
  { name: 'Otros',       value: 20 },
]

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<typeof ChartCard> = {
  title:     'Features/Dashboard/ChartCard',
  component: ChartCard,
  tags:      ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**ChartCard** es un componente de feature que combina el \`Card\` genérico con gráficas de Recharts.

Recibe los datos ya procesados del backend (resultado del \`query\` del modelo Widget) y
los renderiza según el \`tipo\`: \`bar\`, \`line\` o \`pie\`.

### Relación con el modelo
\`\`\`
Widget.tipo_id → TiposGraficas.nombre → prop tipo
Widget.query   → ejecutado en backend → prop data
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    tipo: {
      control: 'select',
      options: ['bar', 'line', 'pie'],
      description: 'Tipo de gráfica a renderizar',
    },
    height: {
      control: { type: 'range', min: 150, max: 400, step: 10 },
      description: 'Altura en px de la gráfica',
    },
    title: {
      control: 'text',
      description: 'Título del card',
    },
    subtitle: {
      control: 'text',
      description: 'Subtítulo descriptivo debajo del título',
    },
  },
}

export default meta
type Story = StoryObj<typeof ChartCard>

// ─── Stories ──────────────────────────────────────────────────────────────────

export const Barras: Story = {
  name: 'Barras — Presupuesto vs Gasto Real',
  args: {
    title:    'Presupuesto vs Gasto Real',
    subtitle: 'Comparativa trimestral (MXN millones)',
    tipo:     'bar',
    data:     presupuestoData,
    xKey:     'trimestre',
    series: [
      { dataKey: 'presupuesto', name: 'Presupuesto' },
      { dataKey: 'real',        name: 'Gasto Real', color: '#1B3A6B' },
    ],
    height:  220,
    actions: [
      { label: 'Editar',   onClick: () => {} },
      { label: 'Eliminar', onClick: () => {}, danger: true },
    ],
  },
}

export const Linea: Story = {
  name: 'Línea — Proyección de Gasto',
  args: {
    title:    'Proyección de Gasto',
    subtitle: 'Escenario base vs con intervención 2024–2028',
    tipo:     'line',
    data:     proyeccionData,
    xKey:     'anio',
    series: [
      { dataKey: 'sinIntervencion', name: 'Sin Intervención', color: '#94A3B8' },
      { dataKey: 'conIntervencion', name: 'Con Intervención 20%' },
    ],
    height:  240,
    actions: [
      { label: 'Editar',   onClick: () => {} },
      { label: 'Exportar', onClick: () => {} },
    ],
  },
}

export const Pie: Story = {
  name: 'Pie — Distribución PIB',
  args: {
    title:    'Distribución PIB',
    subtitle: 'Gasto por enfermedad 2025',
    tipo:     'pie',
    data:     distribucionData,
    xKey:     'name',
    series:   [{ dataKey: 'value', name: 'Porcentaje' }],
    height:   260,
    actions: [
      { label: 'Editar', onClick: () => {} },
    ],
  },
}

export const SinAcciones: Story = {
  name: 'Sin menú de acciones',
  args: {
    title:   'Gasto en Diabetes',
    tipo:    'bar',
    data:    presupuestoData,
    xKey:    'trimestre',
    series:  [{ dataKey: 'real', name: 'Gasto Real' }],
    height:  200,
    // actions no se pasa → no aparece el ⋮
  },
}

export const SoloTitulo: Story = {
  name: 'Sin subtitle',
  args: {
    title:   'Proyección de Gasto',
    tipo:    'line',
    data:    proyeccionData,
    xKey:    'anio',
    series:  [{ dataKey: 'conIntervencion', name: 'Con Intervención' }],
    height:  220,
  },
}