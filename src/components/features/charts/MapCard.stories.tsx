import type { Meta, StoryObj } from '@storybook/react-vite'
import MapCard from './MapCard'

const meta: Meta<typeof MapCard> = {
  title: 'Features/Charts/MapCard',
  component: MapCard,
  parameters: { layout: 'padded' },
}

export default meta
type Story = StoryObj<typeof MapCard>

const statePrevalence: Record<string, number> = {
  'MX-AGU': 10.2, 'MX-BCN': 11.5, 'MX-BCS':  9.8, 'MX-CAM': 13.1,
  'MX-CHP':  8.4, 'MX-CHH': 10.9, 'MX-CMX': 14.2, 'MX-COA': 12.3,
  'MX-COL': 11.8, 'MX-DUR': 10.5, 'MX-GUA': 11.1, 'MX-GRO':  9.2,
  'MX-HID': 12.0, 'MX-JAL': 11.6, 'MX-MEX': 13.4, 'MX-MIC': 10.7,
  'MX-MOR': 12.9, 'MX-NAY': 10.0, 'MX-NLE': 12.5, 'MX-OAX':  8.9,
  'MX-PUE': 11.3, 'MX-QUE': 10.8, 'MX-ROO': 12.7, 'MX-SLP': 11.0,
  'MX-SIN': 11.7, 'MX-SON': 12.1, 'MX-TAB': 14.5, 'MX-TAM': 12.8,
  'MX-TLA': 11.4, 'MX-VER': 13.6, 'MX-YUC': 13.9, 'MX-ZAC': 10.3,
}

const cdmxMuniPrevalence: Record<string, number> = {
  '09002': 13.1, '09003': 14.0, '09004': 10.8, '09005': 15.2,
  '09006': 13.8, '09007': 16.4, '09008': 11.2, '09009': 12.5,
  '09010': 12.9, '09011': 15.7, '09012': 11.9, '09013': 13.3,
  '09014': 10.5, '09015': 14.8, '09016': 11.6, '09017': 15.0,
}

export const Default: Story = {
  args: {
    title:      'Prevalencia de diabetes por entidad',
    subtitle:   'Click en un estado para ver municipios',
    data:       statePrevalence,
    valueLabel: 'Prevalencia',
    unit:       '%',
  },
}

export const WithMunicipalityData: Story = {
  args: {
    title:            'Prevalencia con drill-down (CDMX)',
    subtitle:         'Click en CDMX para ver datos por alcaldía',
    data:             statePrevalence,
    municipalityData: cdmxMuniPrevalence,
    valueLabel:       'Prevalencia',
    unit:             '%',
  },
}

export const DrillDownNoData: Story = {
  args: {
    title:    'Drill-down sin datos municipales',
    subtitle: 'Sin municipalityData los municipios aparecen en color base',
    data:     statePrevalence,
  },
}
