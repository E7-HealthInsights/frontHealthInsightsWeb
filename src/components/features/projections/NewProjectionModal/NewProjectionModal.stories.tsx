import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import NewProjectionModal from './NewProjectionModal'
import Button from '../../../common/Button'

const meta = {
  title:      'Features/Projections/NewProjectionModal',
  component:  NewProjectionModal,
  parameters: { layout: 'centered' },
  tags:       ['autodocs'],
  args: {
    isOpen:   true,
    onClose:  fn(),
    onSubmit: fn(),
  },
} satisfies Meta<typeof NewProjectionModal>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: 'Abierto — estado vacío',
  args: {
    isOpen:  true,
    loading: false,
  },
}

export const Loading: Story = {
  name: 'Enviando datos (loading)',
  args: {
    isOpen:  true,
    loading: true,
  },
}

export const Interactivo: Story = {
  name: 'Interactivo (abrir / cerrar)',
  render: (args) => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button variant="primary" size="md" onClick={() => setOpen(true)}>
          Nueva proyección
        </Button>
        <NewProjectionModal
          {...args}
          isOpen={open}
          onClose={() => setOpen(false)}
          onSubmit={(data) => {
            console.log('Proyección creada:', data)
            setOpen(false)
          }}
        />
      </>
    )
  },
  args: {
    isOpen: false,
  },
}
