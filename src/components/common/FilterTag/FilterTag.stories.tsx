import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import FilterTag from './FilterTag'

const meta = {
  title: 'Common/FilterTag',
  component: FilterTag,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: { onRemove: fn() },
} satisfies Meta<typeof FilterTag>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'Estado',
    value: 'Tabasco',
  },
}

export const FiltroAnio: Story = {
  name: 'Filtro de año',
  args: {
    label: 'Año',
    value: '2024',
  },
}

export const VariosFiltros: Story = {
  name: 'Varios filtros activos',
  render: (args) => (
    <div className="flex flex-wrap gap-2">
      <FilterTag {...args} label="Estado" value="Tabasco" />
      <FilterTag {...args} label="Año"    value="2024" />
      <FilterTag {...args} label="Tipo"   value="Diabetes" />
    </div>
  ),
}
