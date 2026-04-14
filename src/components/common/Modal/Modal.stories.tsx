import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import Modal from './Modal'
import Button from '../Button/Button'

const meta = {
  title: 'Common/Modal',
  component: Modal,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
  args: {
    isOpen:  true,
    onClose: fn(),
    title:   'Confirmar acción',
  },
} satisfies Meta<typeof Modal>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title:    'Confirmar acción',
    subtitle: 'Esta operación no se puede deshacer.',
    size:     'md',
    isOpen:   true,
    children: (
      <p className="text-sm text-[var(--color-hi-text-sub)]">
        ¿Deseas continuar con la operación seleccionada?
      </p>
    ),
  },
}

export const Small: Story = {
  name: 'Pequeño (sm) — eliminar usuario',
  args: {
    title:    'Eliminar usuario',
    subtitle: 'Esta acción es permanente.',
    size:     'sm',
    isOpen:   true,
    children: (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-[var(--color-hi-text-sub)]">
          ¿Deseas eliminar al usuario <strong>Dr. García</strong>?
          No podrás recuperar su cuenta.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={fn()}>Cancelar</Button>
          <Button variant="primary"   size="sm" onClick={fn()}>Eliminar</Button>
        </div>
      </div>
    ),
  },
}

export const Large: Story = {
  name: 'Grande (lg) — cargar dataset',
  args: {
    title:    'Cargar nuevo dataset',
    subtitle: 'Selecciona un archivo CSV con datos oficiales.',
    size:     'lg',
    isOpen:   true,
    children: (
      <div className="flex flex-col gap-4">
        <div className="rounded-[var(--radius-md)] border-2 border-dashed
          border-[var(--color-hi-border)] p-8 text-center
          text-sm text-[var(--color-hi-text-hint)]">
          Arrastra tu archivo aquí o haz clic para seleccionar
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="md" onClick={fn()}>Cancelar</Button>
          <Button variant="primary"   size="md" onClick={fn()}>Cargar dataset</Button>
        </div>
      </div>
    ),
  },
}

export const SinSubtitulo: Story = {
  name: 'Sin subtítulo',
  args: {
    title:   'Vista previa del reporte',
    size:    'md',
    isOpen:  true,
    children: (
      <p className="text-sm text-[var(--color-hi-text-sub)]">
        Reporte ejecutivo Q4 2025 — HealthInsights.
      </p>
    ),
  },
}

export const Interactivo: Story = {
  name: 'Interactivo (abrir / cerrar)',
  render: (args) => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button variant="primary" size="md" onClick={() => setOpen(true)}>
          Abrir modal
        </Button>
        <Modal {...args} isOpen={open} onClose={() => setOpen(false)}>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-[var(--color-hi-text-sub)]">
              Puedes cerrar con el botón ✕, presionando{' '}
              <kbd className="rounded px-1 py-0.5 bg-[var(--color-hi-bg)] text-xs font-mono">
                Esc
              </kbd>{' '}
              o haciendo clic fuera del panel.
            </p>
            <div className="flex justify-end">
              <Button variant="secondary" size="md" onClick={() => setOpen(false)}>
                Cerrar
              </Button>
            </div>
          </div>
        </Modal>
      </>
    )
  },
  args: {
    title:    'Modal interactivo',
    subtitle: 'Prueba los distintos métodos de cierre.',
    size:     'md',
    isOpen:   false,
  },
}
