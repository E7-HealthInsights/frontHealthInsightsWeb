import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { logout } from '../services/authService'
import {
  getDatasets,
  deactivateDataset,
  reactivateDataset,
  uploadDataset,
  pollDatasetStatus,
  type DatasetOption,
  type UploadDatasetPayload,
} from '../services/datasetService'

import Navbar              from '../components/common/Navbar'
import Button              from '../components/common/Button'
import SearchInput         from '../components/common/SearchInput/SearchInput'
import UploadDatasetModal  from '../components/features/datasets/UploadDatasetModal'
import ConfirmActionModal  from '../components/features/admins/ConfirmActionModal/ConfirmActionModal'

// ── Tipos ──────────────────────────────────────────────────────────────────────

interface ProcessingDataset {
  id:     string
  nombre: string
  estado: DatasetEstado
  error?: string
}

// ── Nav links ──────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { key: 'inicio',   label: 'Inicio',   path: '/admin'          },
  { key: 'usuarios', label: 'Usuarios', path: '/admin/usuarios' },
  { key: 'datos',    label: 'Datos',    path: '/admin/datos'    },
  { key: 'reportes', label: 'Reportes', path: '/admin/reportes' },
]

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(iso: string | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function extractErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const axiosErr = err as { response?: { data?: { message?: string }; status?: number } }
    const msg = axiosErr.response?.data?.message
    if (msg) return msg
    const status = axiosErr.response?.status
    if (status === 409) return 'Ya existe un dataset con ese nombre de archivo.'
    if (status === 400) return 'Los datos enviados no son válidos.'
  }
  if (err instanceof Error) return err.message
  return 'Error inesperado al subir el dataset.'
}

// ── Tarjeta de dataset en proceso ─────────────────────────────────────────────

function ProcessingCard({ dataset }: { dataset: ProcessingDataset }) {
  const isError = dataset.estado === 'ERROR'

  return (
    <div className={`
      bg-[var(--color-hi-surface)] rounded-[var(--radius-lg)]
      border p-5 flex flex-col gap-3
      ${isError ? 'border-red-200' : 'border-[var(--color-hi-border)]'}
    `}>
      <div className="flex items-center gap-3">
        {isError ? (
          <div className="w-10 h-10 rounded-[var(--radius-md)] bg-red-50 flex items-center justify-center shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="var(--color-hi-danger)" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
        ) : (
          <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--color-hi-primary-soft)] flex items-center justify-center shrink-0">
            <svg className="animate-spin w-5 h-5 text-[var(--color-hi-primary)]"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
              <path d="M12 2a10 10 0 0 1 10 10"/>
            </svg>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--color-hi-navy)] truncate">
            {dataset.nombre}
          </p>
          <p className={`text-xs mt-0.5 ${isError ? 'text-red-600' : 'text-[var(--color-hi-text-sub)]'}`}>
            {isError
              ? (dataset.error ?? 'El ingest falló. Intenta de nuevo.')
              : dataset.estado === 'PENDING'
                ? 'En cola de procesamiento...'
                : 'Procesando datos del CSV...'
            }
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Dataset card ───────────────────────────────────────────────────────────────

function DatasetCard({
  dataset,
  onDeactivate,
  onActivate,
  toggling,
}: {
  dataset:      DatasetOption
  onDeactivate: (dataset: DatasetOption) => void
  onActivate:   (dataset: DatasetOption) => void
  toggling:     boolean
}) {
  return (
    <div className="bg-[var(--color-hi-surface)] rounded-[var(--radius-lg)]
                    border border-[var(--color-hi-border)] p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-[var(--radius-md)]
                        bg-[var(--color-hi-primary-soft)]
                        flex items-center justify-center shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="var(--color-hi-primary)" strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="12" cy="5" rx="9" ry="3"/>
            <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/>
            <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/>
          </svg>
        </div>
        <div className="flex items-center gap-2">
          {dataset.estado === 'INACTIVE' && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full
                             bg-red-100 text-[var(--color-hi-danger)]">
              Inactivo
            </span>
          )}
          <span className="text-xs text-[var(--color-hi-text-hint)] font-mono">
            {dataset.id?.slice(0, 6).toUpperCase() ?? '—'}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1 flex-1">
        <h3 className="text-sm font-semibold text-[var(--color-hi-navy)] leading-snug">
          {dataset.nombre}
        </h3>
        {dataset.descripcion && (
          <p className="text-xs text-[var(--color-hi-text-sub)] line-clamp-2 leading-relaxed">
            {dataset.descripcion}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-[var(--color-hi-text-sub)]">
        <span>
          Fecha: <span className="font-medium">{formatDate((dataset as any).fechaActualizacion)}</span>
        </span>
        {dataset.fuente && (
          <span>
            Fuente: <span className="font-semibold text-[var(--color-hi-text-main)]">{dataset.fuente}</span>
          </span>
        )}
      </div>

      <div className="pt-1 border-t border-[var(--color-hi-border)]">
        <button
          onClick={() => dataset.estado !== 'INACTIVE' ? onDeactivate(dataset) : onActivate(dataset)}
          disabled={toggling}
          className={`w-full flex items-center justify-center gap-1.5
                      py-2 rounded-[var(--radius-md)] text-xs font-medium
                      transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
                      ${dataset.estado !== 'INACTIVE'
                        ? 'text-[var(--color-hi-danger)] hover:bg-red-50'
                        : 'text-[var(--color-hi-primary)] hover:bg-[var(--color-hi-primary-soft)]'
                      }`}
        >
          {dataset.estado !== 'INACTIVE' ? (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
              Desactivar
            </>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="17 1 21 5 17 9"/>
                <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                <polyline points="7 23 3 19 7 15"/>
                <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
              </svg>
              Activar
            </>
          )}
        </button>
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function DatasetsAdminPage() {
  const { setUser } = useAuth()
  const navigate    = useNavigate()

  const [datasets,    setDatasets]    = useState<DatasetOption[]>([])
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [modalOpen,   setModalOpen]   = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [tab,               setTab]               = useState<'activos' | 'inactivos'>('activos')
  const [togglingId,        setTogglingId]        = useState<string | null>(null)
  const [deactivateTarget,  setDeactivateTarget]  = useState<DatasetOption | null>(null)
  const [deactivateLoading, setDeactivateLoading] = useState(false)
  const [activateTarget,    setActivateTarget]    = useState<DatasetOption | null>(null)
  const [activateLoading,   setActivateLoading]   = useState(false)

  // Datasets que están siendo procesados (PENDING / PROCESSING / ERROR)
  const [processing, setProcessing] = useState<ProcessingDataset[]>([])

  useEffect(() => {
    getDatasets()
      .then(setDatasets)
      .catch(err => console.error('Error al cargar datasets', err))
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = async () => {
    await logout()
    setUser(null)
    navigate('/login', { replace: true })
  }

  const handleUpload = async (payload: UploadDatasetPayload) => {
    setUploadError('')
    try {
      // 1 — El backend responde 202 inmediatamente
      const accepted = await uploadDataset(payload)

      // 2 — Agregar tarjeta de "procesando" en la UI
      const processingEntry: ProcessingDataset = {
        id:     accepted.id,
        nombre: accepted.nombre,
        estado: 'PENDING',
      }
      setProcessing(prev => [processingEntry, ...prev])

      // 3 — Iniciar polling en background (no bloquea el cierre del modal)
      pollDatasetStatus(
        accepted.id,
        (status) => {
          setProcessing(prev =>
            prev.map(p =>
              p.id === accepted.id
                ? { ...p, estado: status.estado, error: status.errorMensaje || undefined }
                : p
            )
          )
        }
      )
      .then((finalStatus) => {
        if (finalStatus.estado === 'READY') {
          // Mover de "procesando" a la lista principal
          setProcessing(prev => prev.filter(p => p.id !== accepted.id))
          getDatasets().then(setDatasets)
        }
        // Si es ERROR, la tarjeta de procesando muestra el error — no se remueve
      })
      .catch(console.error)

    } catch (err: unknown) {
      // Solo llega aquí si el 202 mismo falló (ej. error de red, 409, 400)
      const msg = extractErrorMessage(err)
      setUploadError(msg)
      throw err
    }
  }

  const handleDeactivate = async (justification: string) => {
    if (!deactivateTarget) return
    setDeactivateLoading(true)
    try {
      await deactivateDataset(deactivateTarget.id, justification)
      setDatasets(prev => prev.map(d =>
        d.id === deactivateTarget.id ? { ...d, estado: 'INACTIVE' } : d
      ))
      setDeactivateTarget(null)
    } catch (err) {
      console.error('Error al desactivar dataset', err)
    } finally {
      setDeactivateLoading(false)
    }
  }

  const handleActivate = async (justification: string) => {
    if (!activateTarget) return
    setActivateLoading(true)
    try {
      await reactivateDataset(activateTarget.id, justification)
      setDatasets(prev => prev.map(d =>
        d.id === activateTarget.id ? { ...d, estado: 'READY' } : d
      ))
      setActivateTarget(null)
    } catch (err) {
      console.error('Error al activar dataset', err)
    } finally {
      setActivateLoading(false)
    }
  }

  const tabDatasets = datasets.filter(d =>
    tab === 'activos' ? d.estado !== 'INACTIVE' : d.estado === 'INACTIVE'
  )
  const filtered    = tabDatasets.filter(d =>
    search === '' ||
    d.nombre.toLowerCase().includes(search.toLowerCase()) ||
    d.fuente?.toLowerCase().includes(search.toLowerCase()) ||
    d.descripcion?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[var(--color-hi-bg)]">
      <Navbar
        links={NAV_LINKS}
        activePath={window.location.pathname}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-6 py-8">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--color-hi-navy)]">Datos Disponibles</h1>
          <p className="text-sm text-[var(--color-hi-text-sub)] mt-0.5">
            Gestiona las fuentes de datos de la plataforma
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 border-b border-[var(--color-hi-border)]">
          {(['activos', 'inactivos'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors cursor-pointer
                border-b-2 -mb-px
                ${tab === t
                  ? 'border-[var(--color-hi-primary)] text-[var(--color-hi-primary)]'
                  : 'border-transparent text-[var(--color-hi-text-sub)] hover:text-[var(--color-hi-text-main)]'
                }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 mb-6">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar datasets..."
            className="flex-1"
          />
          {tab === 'activos' && (
            <Button variant="primary" size="md" onClick={() => {
              setUploadError('')
              setModalOpen(true)
            }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="8" y1="2" x2="8" y2="14"/>
                <line x1="2" y1="8" x2="14" y2="8"/>
              </svg>
              Agregar Dataset
            </Button>
          )}
        </div>

        {/* Datasets en proceso (PENDING / PROCESSING / ERROR) */}
        {processing.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-semibold text-[var(--color-hi-text-sub)] uppercase tracking-wide mb-3">
              En procesamiento
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {processing.map(p => (
                <ProcessingCard key={p.id} dataset={p} />
              ))}
            </div>
          </div>
        )}

        {/* Datasets listos (READY) */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-[var(--color-hi-text-hint)]">
            <svg className="animate-spin w-5 h-5 mr-2" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
              <path d="M12 2a10 10 0 0 1 10 10"/>
            </svg>
            Cargando datasets...
          </div>
        ) : filtered.length === 0 && processing.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3
                          text-[var(--color-hi-text-hint)]">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
              strokeLinejoin="round" className="opacity-30">
              <ellipse cx="12" cy="5" rx="9" ry="3"/>
              <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/>
              <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/>
            </svg>
            <p className="text-sm">
              {search ? 'Sin resultados para tu búsqueda' : 'No hay datasets cargados aún'}
            </p>
            {!search && (
              <Button variant="secondary" size="sm" onClick={() => setModalOpen(true)}>
                Subir primer dataset
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filtered.map(d => (
              <DatasetCard
                key={d.id}
                dataset={d}
                onDeactivate={setDeactivateTarget}
                onActivate={setActivateTarget}
                toggling={togglingId === d.id}
              />
            ))}
          </div>
        )}
      </main>

      <UploadDatasetModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleUpload}
        uploadError={uploadError}
      />

      <ConfirmActionModal
        isOpen={deactivateTarget !== null}
        onClose={() => setDeactivateTarget(null)}
        accionLabel={deactivateTarget ? `desactivar el dataset "${deactivateTarget.nombre}"` : ''}
        onConfirm={handleDeactivate}
        loading={deactivateLoading}
      />

      <ConfirmActionModal
        isOpen={activateTarget !== null}
        onClose={() => setActivateTarget(null)}
        accionLabel={activateTarget ? `activar el dataset "${activateTarget.nombre}"` : ''}
        onConfirm={handleActivate}
        loading={activateLoading}
      />
    </div>
  )
}
