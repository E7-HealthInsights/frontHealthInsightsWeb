import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import UploadDatasetModal from './UploadDatasetModal'
import Button from '../../common/Button'

const meta: Meta<typeof UploadDatasetModal> = {
  title: 'Features/Datasets/UploadDatasetModal',
  component: UploadDatasetModal,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof UploadDatasetModal>

// ── Wrapper interactivo ───────────────────────────────────────────────────────

function ModalDemo() {
  const [open, setOpen] = useState(false)
  const [lastPayload, setLastPayload] = useState<string | null>(null)

  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <Button variant="primary" onClick={() => setOpen(true)}>
        Cargar Dataset
      </Button>

      {lastPayload && (
        <div className="w-full max-w-lg">
          <p className="text-xs font-semibold text-[var(--color-hi-text-sub)] uppercase tracking-wide mb-1">
            Payload recibido en onConfirm:
          </p>
          <pre className="text-xs bg-[var(--color-hi-bg)] border border-[var(--color-hi-border)] p-3 rounded-[var(--radius-md)] overflow-auto max-h-64">
            {lastPayload}
          </pre>
        </div>
      )}

      <UploadDatasetModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={({ file, columnMappings }) => {
          setLastPayload(
            JSON.stringify(
              {
                fileName: file.name,
                fileSize: `${(file.size / 1024).toFixed(1)} KB`,
                columnMappings,
              },
              null,
              2
            )
          )
          setOpen(false)
        }}
      />
    </div>
  )
}

// ── Default: flujo completo interactivo ───────────────────────────────────────

export const Default: Story = {
  render: () => <ModalDemo />,
}

// ── Abierto en paso 1 (para capturas) ────────────────────────────────────────

export const OpenUploadStep: Story = {
  render: () => (
    <UploadDatasetModal
      isOpen
      onClose={() => {}}
      onConfirm={() => {}}
    />
  ),
}