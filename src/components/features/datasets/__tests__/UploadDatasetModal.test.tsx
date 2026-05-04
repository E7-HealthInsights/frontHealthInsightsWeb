import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import UploadDatasetModal from '../UploadDatasetModal'

// ── Mocks ─────────────────────────────────────────────────────────────────────

// Mock de la llamada a Claude para sugerencias de tipos SQL
vi.mock('../../../../lib/api', () => ({ default: { post: vi.fn() } }))

// fetchAISuggestions usa fetch directamente; lo mockeamos globalmente
const mockFetch = vi.fn()
global.fetch = mockFetch

function mockAISuggestions(suggestions: Record<string, string>) {
  mockFetch.mockResolvedValue({
    json: () => Promise.resolve({
      content: [{ type: 'text', text: JSON.stringify(suggestions) }],
    }),
  })
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function buildCsvFile(content = 'estado,casos\nJalisco,100\nSinaloa,200\n') {
  return new File([content], 'datos_prueba.csv', { type: 'text/csv' })
}

function renderModal(props: Partial<{
  isOpen: boolean
  onClose: () => void
  onConfirm: (p: unknown) => Promise<void>
  uploadError: string
}> = {}) {
  const defaults = {
    isOpen:      true,
    onClose:     vi.fn(),
    onConfirm:   vi.fn().mockResolvedValue(undefined),
    uploadError: '',
  }
  return render(<UploadDatasetModal {...defaults} {...props} />)
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('UploadDatasetModal', () => {

  beforeEach(() => {
    vi.clearAllMocks()
    mockAISuggestions({ estado: 'VARCHAR(255)', casos: 'INT' })
  })

  // ── Renderizado ────────────────────────────────────────────────────────────

  it('renders the modal when isOpen is true', () => {
    renderModal()
    expect(screen.getByText('Nuevo Dataset')).toBeInTheDocument()
  })

  it('does not render when isOpen is false', () => {
    renderModal({ isOpen: false })
    expect(screen.queryByText('Nuevo Dataset')).not.toBeInTheDocument()
  })

  it('shows the upload zone disabled when title is empty', () => {
    renderModal()
    const dropzone = screen.getByText(/completa el título primero/i)
    expect(dropzone).toBeInTheDocument()
  })

  it('enables the upload zone after entering a title', async () => {
    const user = userEvent.setup()
    renderModal()

    await user.type(screen.getByLabelText(/título/i), 'ENSANUT 2024')

    expect(screen.getByText(/arrastra tu archivo aquí/i)).toBeInTheDocument()
  })

  // ── Step 1 → Step 2 ────────────────────────────────────────────────────────

  it('advances to configure step after selecting a CSV file', async () => {
    const user = userEvent.setup()
    renderModal()

    await user.type(screen.getByLabelText(/título/i), 'Test')

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(input, buildCsvFile())

    await waitFor(() => {
      expect(screen.getByText(/vista previa del archivo/i)).toBeInTheDocument()
    })
  })

  it('shows CSV column headers in the preview table', async () => {
    const user = userEvent.setup()
    renderModal()

    await user.type(screen.getByLabelText(/título/i), 'Test')

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(input, buildCsvFile())

    await waitFor(() => {
      // Los headers aparecen al menos una vez (pueden aparecer también en el mapping)
      expect(screen.getAllByText('estado').length).toBeGreaterThan(0)
      expect(screen.getAllByText('casos').length).toBeGreaterThan(0)
    })
  })

  it('shows the AI loading indicator while fetching suggestions', async () => {
    // La promesa nunca resuelve para simular la carga
    mockFetch.mockReturnValue(new Promise(() => {}))
    const user = userEvent.setup()
    renderModal()

    await user.type(screen.getByLabelText(/título/i), 'Test')

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(input, buildCsvFile())

    await waitFor(() => {
      expect(screen.getByText(/analizando columnas con ia/i)).toBeInTheDocument()
    })
  })

  it('shows AI suggested badge after suggestions load', async () => {
    const user = userEvent.setup()
    renderModal()

    await user.type(screen.getByLabelText(/título/i), 'Test')

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(input, buildCsvFile())

    await waitFor(() => {
      expect(screen.getByText(/tipos sql fueron sugeridos automáticamente/i)).toBeInTheDocument()
    })
  })

  // ── Configuración de columnas ──────────────────────────────────────────────

  it('allows editing the display name of a column', async () => {
    const user = userEvent.setup()
    renderModal()

    await user.type(screen.getByLabelText(/título/i), 'Test')
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(input, buildCsvFile())

    await waitFor(() => screen.getByText(/vista previa/i))

    // El primer input de nombre amigable corresponde a "estado"
    const displayInputs = screen.getAllByPlaceholderText('estado')
    await user.clear(displayInputs[0])
    await user.type(displayInputs[0], 'Entidad Federativa')

    expect(displayInputs[0]).toHaveValue('Entidad Federativa')
  })

  it('disables confirm button while AI is loading', async () => {
    mockFetch.mockReturnValue(new Promise(() => {}))
    const user = userEvent.setup()
    renderModal()

    await user.type(screen.getByLabelText(/título/i), 'Test')
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(input, buildCsvFile())

    await waitFor(() => screen.getByText(/analizando/i))

    const confirmBtn = screen.getByRole('button', { name: /confirmar dataset/i })
    expect(confirmBtn).toBeDisabled()
  })

  // ── Confirmación ───────────────────────────────────────────────────────────

  it('calls onConfirm with the correct payload structure', async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()
    renderModal({ onConfirm })

    await user.type(screen.getByLabelText(/título/i), 'Mi Dataset')
    await user.type(screen.getByLabelText(/fuente/i), 'INEGI')

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(input, buildCsvFile())

    await waitFor(() => screen.getByRole('button', { name: /confirmar dataset/i }))
    // Esperar a que la IA termine (badge visible)
    await waitFor(() => screen.getByText(/tipos sql fueron sugeridos/i))

    await user.click(screen.getByRole('button', { name: /confirmar dataset/i }))

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledOnce()
      const payload = onConfirm.mock.calls[0][0]
      expect(payload.nombre).toBe('Mi Dataset')
      expect(payload.fuente).toBe('INEGI')
      expect(payload.file).toBeInstanceOf(File)
      expect(payload.columnMappings).toHaveLength(2)
    })
  })

  it('calls onClose when clicking Volver from configure step', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    renderModal({ onClose })

    await user.type(screen.getByLabelText(/título/i), 'Test')
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(input, buildCsvFile())

    await waitFor(() => screen.getByRole('button', { name: /volver/i }))
    await user.click(screen.getByRole('button', { name: /volver/i }))

    // Volver regresa al step 1, no cierra el modal
    expect(screen.getByText(/arrastra tu archivo aquí/i)).toBeInTheDocument()
    expect(onClose).not.toHaveBeenCalled()
  })

  // ── Error de upload ────────────────────────────────────────────────────────

  it('displays uploadError message when prop is provided in configure step', async () => {
    const user = userEvent.setup()
    renderModal({ uploadError: 'Error: el tipo DATE no es compatible con los valores de esa columna.' })

    await user.type(screen.getByLabelText(/título/i), 'Test')
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(input, buildCsvFile())

    await waitFor(() => {
      expect(screen.getByText(/tipo DATE no es compatible/i)).toBeInTheDocument()
    })
  })

  it('does not show error banner when uploadError is empty', async () => {
    const user = userEvent.setup()
    renderModal({ uploadError: '' })

    await user.type(screen.getByLabelText(/título/i), 'Test')
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(input, buildCsvFile())

    await waitFor(() => screen.getByText(/vista previa/i))

    // No debe haber ningún banner rojo de error
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
