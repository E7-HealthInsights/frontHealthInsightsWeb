import api from '../lib/api'
import type {
  MarketingStrategyDTO,
  GenerateStrategyInput,
  EstadoStrategy,
} from '../types/MarketingStrategy'

// La generación llama a OpenAI por detrás (puede tardar): timeout extendido a 90s.
const AI_TIMEOUT_MS = 90_000

export async function generateStrategy(input: GenerateStrategyInput = {}): Promise<MarketingStrategyDTO> {
  const res = await api.post<MarketingStrategyDTO>(
    '/marketing/strategies',
    input,
    { timeout: AI_TIMEOUT_MS },
  )
  return res.data
}

export async function getStrategyHistory(): Promise<MarketingStrategyDTO[]> {
  const res = await api.get<MarketingStrategyDTO[]>('/marketing/strategies')
  return res.data
}

export async function getStrategyById(id: string): Promise<MarketingStrategyDTO> {
  const res = await api.get<MarketingStrategyDTO>(`/marketing/strategies/${id}`)
  return res.data
}

export interface UpdateStrategyStateInput {
  estado:         EstadoStrategy
  notaResultado?: string
}

export async function updateStrategyState(
  id: string,
  input: UpdateStrategyStateInput,
): Promise<MarketingStrategyDTO> {
  const res = await api.patch<MarketingStrategyDTO>(
    `/marketing/strategies/${id}/estado`,
    input,
  )
  return res.data
}

export async function addStrategyComment(
  id: string,
  contenido: string,
): Promise<MarketingStrategyDTO> {
  const res = await api.post<MarketingStrategyDTO>(
    `/marketing/strategies/${id}/comentarios`,
    { contenido },
  )
  return res.data
}
