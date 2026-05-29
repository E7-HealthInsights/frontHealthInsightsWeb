import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { useState } from 'react'
import TabGroup from './TabGroup'

const meta = {
  title: 'Common/TabGroup',
  component: TabGroup,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: { onChange: fn() },
} satisfies Meta<typeof TabGroup>

export default meta
type Story = StoryObj<typeof meta>

export const DosTabs: Story = {
  name: 'Dos tabs (Usuarios)',
  args: {
    tabs: [
      { id: 'activos',   label: 'Usuarios Activos' },
      { id: 'inactivos', label: 'Usuarios Inactivos' },
    ],
    activeTab: 'activos',
  },
}

export const TresTabs: Story = {
  name: 'Tres tabs (Actividad Reciente)',
  args: {
    tabs: [
      { id: 'usuarios',     label: 'Usuarios' },
      { id: 'reportes',     label: 'Reportes' },
      { id: 'simulaciones', label: 'Simulaciones' },
    ],
    activeTab: 'reportes',
  },
}

export const Interactivo: Story = {
  name: 'Interactivo',
  render: () => {
    const [active, setActive] = useState('activos')
    return (
      <TabGroup
        tabs={[
          { id: 'activos',   label: 'Usuarios Activos' },
          { id: 'inactivos', label: 'Usuarios Inactivos' },
        ]}
        activeTab={active}
        onChange={setActive}
      />
    )
  },
}
