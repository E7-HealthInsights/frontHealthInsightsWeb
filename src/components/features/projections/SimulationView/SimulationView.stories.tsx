import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { useState } from 'react'
import SimulationView from './SimulationView'

const CHART_DATA = [
  { año: 2024, sinIntervencion: 15.9, conIntervencion: 15.9 },
  { año: 2025, sinIntervencion: 16.3, conIntervencion: 15.6 },
  { año: 2026, sinIntervencion: 16.9, conIntervencion: 15.1 },
  { año: 2027, sinIntervencion: 17.5, conIntervencion: 14.5 },
  { año: 2028, sinIntervencion: 18.1, conIntervencion: 13.9 },
  { año: 2029, sinIntervencion: 18.9, conIntervencion: 13.2 },
  { año: 2030, sinIntervencion: 20.0, conIntervencion: 11.8 },
]

const X_AXIS_OPTIONS = [
  { value: 'año',      label: 'Año' },
  { value: 'trimestre', label: 'Trimestre' },
]

const Y_AXIS_OPTIONS = [
  { value: 'prevalencia', label: '% Prevalencia' },
  { value: 'casos',       label: 'Casos por 100k' },
  { value: 'gasto',       label: 'Gasto MXN' },
]

const PARAMETERS = [
  { label: 'Reducción',  value: '20%' },
  { label: 'Inversión',  value: '$50M MXN/año' },
  { label: 'Período',    value: '2024-2030' },
  { label: 'Región',     value: 'Nacional' },
]

const KEY_RESULTS = [
  { label: 'Reducción Proyectada 2030', value: '-8.2%' },
  { label: 'Vidas Salvadas',            value: '~1.2M' },
  { label: 'Ahorro Estimado',           value: '$450M' },
]

const meta = {
  title: 'Features/Projections/SimulationView',
  component: SimulationView,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: {
    onBack:            fn(),
    onEdit:            fn(),
    onXAxisChange:     fn(),
    onYAxisChange:     fn(),
    onGenerateReport:  fn(),
  },
} satisfies Meta<typeof SimulationView>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title:             'Escenario 1: Intervención 20% en prevención',
    subtitle:          'Comparativa de prevalencia con y sin intervención',
    chartTitle:        'Proyección de Prevalencia de Diabetes',
    chartSubtitle:     'Comparación entre escenario base y con intervención',
    chartData:         CHART_DATA,
    xKey:              'año',
    baselineKey:       'sinIntervencion',
    interventionKey:   'conIntervencion',
    baselineLabel:     'Sin Intervención',
    interventionLabel: 'Con Intervención 20%',
    yAxisLabel:        '% Prevalencia',
    xAxisOptions:      X_AXIS_OPTIONS,
    yAxisOptions:      Y_AXIS_OPTIONS,
    selectedXAxis:     'año',
    selectedYAxis:     'prevalencia',
    parameters:        PARAMETERS,
    keyResults:        KEY_RESULTS,
  },
}

export const Interactivo: Story = {
  name: 'Interactivo (variables controladas)',
  render: (args) => {
    const [xAxis, setXAxis] = useState('año')
    const [yAxis, setYAxis] = useState('prevalencia')
    return (
      <SimulationView
        {...args}
        selectedXAxis={xAxis}
        selectedYAxis={yAxis}
        onXAxisChange={setXAxis}
        onYAxisChange={setYAxis}
      />
    )
  },
  args: {
    title:             'Escenario 1: Intervención 20% en prevención',
    subtitle:          'Comparativa de prevalencia con y sin intervención',
    chartTitle:        'Proyección de Prevalencia de Diabetes',
    chartSubtitle:     'Comparación entre escenario base y con intervención',
    chartData:         CHART_DATA,
    xKey:              'año',
    baselineKey:       'sinIntervencion',
    interventionKey:   'conIntervencion',
    baselineLabel:     'Sin Intervención',
    interventionLabel: 'Con Intervención 20%',
    yAxisLabel:        '% Prevalencia',
    xAxisOptions:      X_AXIS_OPTIONS,
    yAxisOptions:      Y_AXIS_OPTIONS,
    parameters:        PARAMETERS,
    keyResults:        KEY_RESULTS,
  },
}

export const EscenarioConservador: Story = {
  name: 'Escenario conservador (10%)',
  args: {
    title:             'Escenario 2: Intervención 10% en prevención',
    subtitle:          'Comparativa de prevalencia con y sin intervención',
    chartTitle:        'Proyección de Prevalencia de Diabetes',
    chartSubtitle:     'Comparación entre escenario base y con intervención',
    chartData: [
      { año: 2024, sinIntervencion: 15.9, conIntervencion: 15.9 },
      { año: 2025, sinIntervencion: 16.3, conIntervencion: 15.8 },
      { año: 2026, sinIntervencion: 16.9, conIntervencion: 15.6 },
      { año: 2027, sinIntervencion: 17.5, conIntervencion: 15.4 },
      { año: 2028, sinIntervencion: 18.1, conIntervencion: 15.1 },
      { año: 2029, sinIntervencion: 18.9, conIntervencion: 14.7 },
      { año: 2030, sinIntervencion: 20.0, conIntervencion: 14.2 },
    ],
    xKey:              'año',
    baselineKey:       'sinIntervencion',
    interventionKey:   'conIntervencion',
    baselineLabel:     'Sin Intervención',
    interventionLabel: 'Con Intervención 10%',
    yAxisLabel:        '% Prevalencia',
    xAxisOptions:      X_AXIS_OPTIONS,
    yAxisOptions:      Y_AXIS_OPTIONS,
    selectedXAxis:     'año',
    selectedYAxis:     'prevalencia',
    parameters: [
      { label: 'Reducción',  value: '10%' },
      { label: 'Inversión',  value: '$25M MXN/año' },
      { label: 'Período',    value: '2024-2030' },
      { label: 'Región',     value: 'Nacional' },
    ],
    keyResults: [
      { label: 'Reducción Proyectada 2030', value: '-3.9%' },
      { label: 'Vidas Salvadas',            value: '~620K' },
      { label: 'Ahorro Estimado',           value: '$210M' },
    ],
  },
}
