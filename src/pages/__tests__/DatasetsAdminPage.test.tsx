import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import DatasetsAdminPage from '../DatasetsAdminPage'

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('../../services/datasetService', () => ({
  getDatasets:   vi.fn(),
  uploadDataset: vi.fn(),
}))

vi.mock('../../services/authService', () => ({
  logout: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user:    { name: 'Admin', email: 'admin@test.com', role: 'ADMIN' },
    setUser: vi.fn(),
    loading: false,
  }),
}))

// El Navbar usa react-router internamente — lo envolvemos con MemoryRouter
vi.mock('../../components/common/Navbar', () => ({
  default: () => <nav data-testid="navbar" />,
}))

// El modal es pesado; en tests de integración de la página lo mockeamos
vi.mock('../../components/features/datasets/UploadDatasetModal', () => ({
  default: ({ isOpen, onClose, onConfirm, uploadError }: {
    isOpen: boolean
    onClose: () => void
    onConfirm: (p: unknown) => Promise<void>
    uploadError?: string
  }) => isOpen ? (
    <div data-testid="upload-modal">
      {uploadError && <p data-testid="modal-error">{uploadError}</p>}
      <button onClick={onClose}>Cerrar</button>
      <button onClick={() => { onConfirm({}).catch(() => {}) }}>Confirmar</button>
    </div>
  ) : null,
}))

import { getDatasets, uploadDataset } from '../../services/datasetService'

const getDatasetsMock   = getDatasets   as ReturnType<typeof vi.fn>
const uploadDatasetMock = uploadDataset as ReturnType<typeof vi.fn>

const MOCK_DATASETS = [
  { id: 'ds-1', nombre: 'Diabetes México 2023', descripcion: 'Casos de diabetes', fuente: 'SINAVE', fechaActualizacion: '2024-01-15T00:00:00' },
  { id: 'ds-2', nombre: 'Hipertensión 2022',    descripcion: 'Prevalencia',        fuente: 'ENSANUT', fechaActualizacion: '2023-06-01T00:00:00' },
]

function renderPage() {
  return render(
    <MemoryRouter>
      <DatasetsAdminPage />
    </MemoryRouter>
  )
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('DatasetsAdminPage', () => {

  beforeEach(() => {
    vi.clearAllMocks()
    getDatasetsMock.mockResolvedValue(MOCK_DATASETS)
  })

  // ── Carga inicial ──────────────────────────────────────────────────────────

  it('shows a loading indicator while fetching datasets', () => {
    // Promesa que nunca resuelve para simular carga
    getDatasetsMock.mockReturnValue(new Promise(() => {}))

    renderPage()

    expect(screen.getByText(/cargando datasets/i)).toBeInTheDocument()
  })

  it('renders all dataset cards after loading', async () => {
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Diabetes México 2023')).toBeInTheDocument()
      expect(screen.getByText('Hipertensión 2022')).toBeInTheDocument()
    })
  })

  it('renders fuente and descripcion inside each card', async () => {
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('SINAVE')).toBeInTheDocument()
      expect(screen.getByText('Casos de diabetes')).toBeInTheDocument()
    })
  })

  it('shows empty state when there are no datasets', async () => {
    getDatasetsMock.mockResolvedValue([])
    renderPage()

    await waitFor(() => {
      expect(screen.getByText(/no hay datasets cargados/i)).toBeInTheDocument()
    })
  })

  // ── Búsqueda ───────────────────────────────────────────────────────────────

  it('filters cards by name when searching', async () => {
    const user = userEvent.setup()
    renderPage()

    await waitFor(() => screen.getByText('Diabetes México 2023'))

    await user.type(screen.getByPlaceholderText(/buscar datasets/i), 'diabetes')

    expect(screen.getByText('Diabetes México 2023')).toBeInTheDocument()
    expect(screen.queryByText('Hipertensión 2022')).not.toBeInTheDocument()
  })

  it('filters cards by fuente when searching', async () => {
    const user = userEvent.setup()
    renderPage()

    await waitFor(() => screen.getByText('Diabetes México 2023'))

    await user.type(screen.getByPlaceholderText(/buscar datasets/i), 'ENSANUT')

    expect(screen.queryByText('Diabetes México 2023')).not.toBeInTheDocument()
    expect(screen.getByText('Hipertensión 2022')).toBeInTheDocument()
  })

  it('shows no-results message when search has no matches', async () => {
    const user = userEvent.setup()
    renderPage()

    await waitFor(() => screen.getByText('Diabetes México 2023'))

    await user.type(screen.getByPlaceholderText(/buscar datasets/i), 'xxxxxxx')

    expect(screen.getByText(/sin resultados/i)).toBeInTheDocument()
  })

  // ── Modal ──────────────────────────────────────────────────────────────────

  it('opens the upload modal when clicking Agregar Dataset', async () => {
    const user = userEvent.setup()
    renderPage()

    await waitFor(() => screen.getByText('Diabetes México 2023'))

    await user.click(screen.getByRole('button', { name: /agregar dataset/i }))

    expect(screen.getByTestId('upload-modal')).toBeInTheDocument()
  })

  it('closes the modal when onClose is triggered', async () => {
    const user = userEvent.setup()
    renderPage()

    await waitFor(() => screen.getByText('Diabetes México 2023'))

    await user.click(screen.getByRole('button', { name: /agregar dataset/i }))
    expect(screen.getByTestId('upload-modal')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /cerrar/i }))
    expect(screen.queryByTestId('upload-modal')).not.toBeInTheDocument()
  })

  // ── Upload exitoso ─────────────────────────────────────────────────────────

  it('adds the new dataset to the list after successful upload', async () => {
    const user = userEvent.setup()
    const newDataset = { id: 'ds-3', nombre: 'Obesidad 2024', descripcion: '', fuente: 'INSP', fechaActualizacion: null }
    uploadDatasetMock.mockResolvedValue(newDataset)

    renderPage()
    await waitFor(() => screen.getByText('Diabetes México 2023'))

    await user.click(screen.getByRole('button', { name: /agregar dataset/i }))
    await user.click(screen.getByRole('button', { name: /confirmar/i }))

    await waitFor(() => {
      expect(screen.getByText('Obesidad 2024')).toBeInTheDocument()
    })
  })

  // ── Error de upload ────────────────────────────────────────────────────────

  it('shows a 409 error message inside the modal when table already exists', async () => {
    const user = userEvent.setup()
    const conflictError = Object.assign(new Error(), {
      response: { status: 409, data: { message: 'Ya existe un dataset con esa tabla' } },
    })
    uploadDatasetMock.mockRejectedValue(conflictError)

    renderPage()
    await waitFor(() => screen.getByText('Diabetes México 2023'))

    await user.click(screen.getByRole('button', { name: /agregar dataset/i }))
    await user.click(screen.getByRole('button', { name: /confirmar/i }))

    await waitFor(() => {
      expect(screen.getByTestId('modal-error')).toBeInTheDocument()
    })
  })

  it('shows a descriptive 500 error message when server fails', async () => {
    const user = userEvent.setup()
    const serverError = Object.assign(new Error('server error'), {
      response: { status: 500, data: {} },
    })
    uploadDatasetMock.mockRejectedValue(serverError)

    renderPage()
    await waitFor(() => screen.getByText('Diabetes México 2023'))

    await user.click(screen.getByRole('button', { name: /agregar dataset/i }))

    // El botón Confirmar del modal mock llama a onConfirm que puede rechazar;
    // capturamos el rechazo para que no rompa el test como unhandled rejection
    const confirmBtn = screen.getByRole('button', { name: /confirmar/i })
    await user.click(confirmBtn).catch(() => {})

    await waitFor(() => {
      const errorEl = screen.queryByTestId('modal-error')
      expect(errorEl).not.toBeNull()
      expect(errorEl!.textContent).toMatch(/csv|tipo de dato/i)
    })
  })
})
