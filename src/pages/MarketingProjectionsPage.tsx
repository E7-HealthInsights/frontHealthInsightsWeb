import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

import Navbar  from '../components/common/Navbar/Navbar'
import Button  from '../components/common/Button/Button'
import { useAuth } from '../context/AuthContext'
import { logout } from '../services/authService'

import {
  generateStrategy,
  getStrategyHistory,
  updateStrategyState,
  addStrategyComment,
} from '../services/marketingStrategyService'
import MarketingStrategyView, {
  StrategyHistoryModal,
  GenerateStrategyModal,
} from '../components/features/projections/MarketingStrategyView'
import type {
  MarketingStrategyDTO,
  GenerateStrategyInput,
  EstadoStrategy,
} from '../types/MarketingStrategy'

const NAV_LINKS = [
  { key: 'inicio',       label: 'Inicio',       path: '/'             },
  { key: 'proyecciones', label: 'Proyecciones', path: '/proyecciones' },
  { key: 'reportes',     label: 'Reportes',     path: '/reportes'     },
]

const ERROR_MESSAGES: Record<string, string> = {
  OPENAI_NOT_CONFIGURED: 'La integración con OpenAI no está configurada en el servidor. Pide al administrador que configure OPENAI_API_KEY.',
  AI_INVALID_RESPONSE:   'La IA respondió en un formato inesperado. Intenta generar la estrategia de nuevo.',
}

function parseErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { error?: string; message?: string } | undefined
    if (data?.error && ERROR_MESSAGES[data.error]) return ERROR_MESSAGES[data.error]
    if (data?.message) return data.message
    if (err.code === 'ECONNABORTED') return 'La generación tardó demasiado. Intenta de nuevo.'
  }
  return 'No se pudo generar la estrategia. Intenta de nuevo.'
}

export default function MarketingProjectionsPage() {
  const { setUser } = useAuth()
  const navigate    = useNavigate()
  const queryClient = useQueryClient()

  const [selectedId,   setSelectedId]   = useState<string | null>(null)
  const [historyOpen,  setHistoryOpen]  = useState(false)
  const [generateOpen, setGenerateOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    setUser(null)
    queryClient.clear()
    navigate('/login', { replace: true })
  }

  const historyQuery = useQuery({
    queryKey: ['marketingStrategies'],
    queryFn:  getStrategyHistory,
    staleTime: 5 * 60 * 1000,
  })

  const mutation = useMutation<MarketingStrategyDTO, unknown, GenerateStrategyInput>({
    mutationFn: (input) => generateStrategy(input),
    onSuccess: (newStrategy) => {
      queryClient.setQueryData<MarketingStrategyDTO[]>(
        ['marketingStrategies'],
        (prev) => prev ? [newStrategy, ...prev] : [newStrategy],
      )
      setSelectedId(newStrategy.id)
      setGenerateOpen(false)
    },
  })

  // Reemplaza la estrategia editada dentro del cache de historial.
  const replaceInCache = (updated: MarketingStrategyDTO) => {
    queryClient.setQueryData<MarketingStrategyDTO[]>(
      ['marketingStrategies'],
      (prev) => prev ? prev.map(s => s.id === updated.id ? updated : s) : [updated],
    )
  }

  const stateMutation = useMutation<
    MarketingStrategyDTO,
    unknown,
    { id: string; estado: EstadoStrategy; notaResultado: string }
  >({
    mutationFn: ({ id, estado, notaResultado }) =>
      updateStrategyState(id, { estado, notaResultado: notaResultado || undefined }),
    onSuccess: replaceInCache,
  })

  const commentMutation = useMutation<
    MarketingStrategyDTO,
    unknown,
    { id: string; contenido: string }
  >({
    mutationFn: ({ id, contenido }) => addStrategyComment(id, contenido),
    onSuccess: replaceInCache,
  })

  const currentStrategy: MarketingStrategyDTO | undefined = useMemo(() => {
    const list = historyQuery.data ?? []
    if (selectedId) return list.find(s => s.id === selectedId)
    return list[0]
  }, [historyQuery.data, selectedId])

  const isLoading  = historyQuery.isLoading
  const isFetchErr = historyQuery.isError
  const errorMsg   = mutation.error ? parseErrorMessage(mutation.error) : null
  const stateErr   = stateMutation.error   ? parseErrorMessage(stateMutation.error)   : null
  const commentErr = commentMutation.error ? parseErrorMessage(commentMutation.error) : null

  const handleUpdateState = async (estado: EstadoStrategy, notaResultado: string) => {
    if (!currentStrategy) return
    await stateMutation.mutateAsync({ id: currentStrategy.id, estado, notaResultado })
  }

  const handleAddComment = async (contenido: string) => {
    if (!currentStrategy) return
    await commentMutation.mutateAsync({ id: currentStrategy.id, contenido })
  }

  return (
    <div className="min-h-screen bg-[var(--color-hi-bg)]">
      <Navbar
        links={NAV_LINKS}
        activePath={typeof window !== 'undefined' ? window.location.pathname : '/proyecciones'}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Hero */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-hi-navy)] tracking-tight">
              Estrategia de mercadotecnia
            </h1>
            <p className="mt-1 text-sm text-[var(--color-hi-text-sub)] max-w-2xl">
              Generada con IA a partir de los indicadores de tu dashboard. Personaliza zonas,
              edades, presupuesto y medios para que la IA proponga campañas con tácticas
              concretas (espectaculares, radio, redes, etc.) adaptadas a tu segmento.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setHistoryOpen(true)}
              disabled={isLoading || (historyQuery.data?.length ?? 0) === 0}
            >
              Ver historial
            </Button>
            <Button
              variant="primary"
              size="md"
              loading={mutation.isPending}
              onClick={() => setGenerateOpen(true)}
            >
              {currentStrategy ? 'Generar nueva estrategia' : 'Generar estrategia'}
            </Button>
          </div>
        </div>

        {/* Error de mutación */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-[var(--radius-md)] border border-[var(--color-hi-danger)] bg-red-50 text-sm text-[var(--color-hi-danger)]">
            {errorMsg}
          </div>
        )}

        {/* Loading historial */}
        {isLoading && (
          <div className="flex justify-center py-20">
            <svg className="animate-spin w-8 h-8 text-[var(--color-hi-primary)]"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" strokeOpacity={0.25}/>
              <path d="M12 2a10 10 0 0 1 10 10"/>
            </svg>
          </div>
        )}

        {/* Loading mutación (analizando dashboard) */}
        {mutation.isPending && !isLoading && (
          <div className="mb-6 flex items-center gap-3 p-5 rounded-[var(--radius-lg)] border border-[var(--color-hi-primary)]/30 bg-[var(--color-hi-primary-soft)]">
            <svg className="animate-spin w-5 h-5 text-[var(--color-hi-primary)]"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" strokeOpacity={0.25}/>
              <path d="M12 2a10 10 0 0 1 10 10"/>
            </svg>
            <p className="text-sm text-[var(--color-hi-navy-light)]">
              Analizando tu dashboard y construyendo la estrategia. Esto suele tardar entre 10 y 40 segundos.
            </p>
          </div>
        )}

        {/* Error de fetch del historial */}
        {isFetchErr && (
          <div className="flex justify-center py-20">
            <p className="text-sm text-[var(--color-hi-danger)]">
              No se pudo cargar el historial de estrategias.
            </p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isFetchErr && !currentStrategy && !mutation.isPending && (
          <div className="flex flex-col items-center justify-center gap-3 py-16
            rounded-[var(--radius-lg)] border border-dashed border-[var(--color-hi-border)]
            bg-[var(--color-hi-surface)]">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-hi-text-hint)" strokeWidth="1.5">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
            <p className="text-sm text-[var(--color-hi-text-main)] font-medium">
              Aún no has generado una estrategia.
            </p>
            <p className="text-xs text-[var(--color-hi-text-sub)] max-w-sm text-center">
              Pulsa “Generar estrategia”, configura zonas, edades, presupuesto y medios, y la
              IA propondrá un plan accionable con campañas, tácticas y cronograma.
            </p>
          </div>
        )}

        {/* Estrategia actual */}
        {currentStrategy && !mutation.isPending && (
          <MarketingStrategyView
            dto={currentStrategy}
            onUpdateState={handleUpdateState}
            onAddComment={handleAddComment}
            isUpdatingState={stateMutation.isPending}
            isAddingComment={commentMutation.isPending}
            errorState={stateErr}
            errorComment={commentErr}
          />
        )}

      </main>

      <StrategyHistoryModal
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        strategies={historyQuery.data ?? []}
        currentId={currentStrategy?.id}
        onSelect={(id) => setSelectedId(id)}
      />

      <GenerateStrategyModal
        isOpen={generateOpen}
        onClose={() => setGenerateOpen(false)}
        onSubmit={(input) => mutation.mutate(input)}
        loading={mutation.isPending}
      />
    </div>
  )
}
