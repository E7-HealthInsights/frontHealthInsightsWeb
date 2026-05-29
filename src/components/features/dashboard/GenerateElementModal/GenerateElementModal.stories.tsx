import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import GenerateElementModal from './GenerateElementModal'
import Button from '../../../common/Button/Button'

const meta: Meta<typeof GenerateElementModal> = {
  title: 'Features/Dashboard/GenerateElementModal',
  component: GenerateElementModal,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof GenerateElementModal>

// ── Wrapper interactivo ───────────────────────────────────────────────────────

function ModalDemo() {
  const [open, setOpen] = useState(false)
  const [lastPayload, setLastPayload] = useState<string | null>(null)

  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <Button variant="primary" onClick={() => setOpen(true)}>
        Abrir modal
      </Button>

      {lastPayload && (
        <pre className="text-xs bg-gray-100 p-3 rounded-lg max-w-sm overflow-auto">
          {lastPayload}
        </pre>
      )}

      <GenerateElementModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onGenerate={payload => {
          setLastPayload(JSON.stringify(payload, null, 2))
          setOpen(false)
        }}
      />
    </div>
  )
}

export const Default: Story = {
  render: () => <ModalDemo />,
}

// ── Abierto de entrada (para captura de pantalla) ─────────────────────────────
export const OpenByDefault: Story = {
  render: () => (
    <GenerateElementModal
      isOpen
      onClose={() => {}}
      onGenerate={() => {}}
    />
  ),
}