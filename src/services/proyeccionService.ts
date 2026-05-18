import api from "../lib/api"
import type { GeneralProyeccionParams, GeneralPunto, GeneralResultado } from "../types/GeneralProyeccion"
import type { ProyeccionDTO, Proyeccion, ProyeccionResultado, TipoInversion, ProyeccionParams, PuntoProyeccion } from "../types/Proyeccion"



// ─── Helpers ──────────────────────────────────────────────────────────────────

export function parseProyeccion(dto: ProyeccionDTO): Proyeccion {
  return { ...dto, resultado: JSON.parse(dto.resultado) as ProyeccionResultado }
}

// ─── Modelo matemático ────────────────────────────────────────────────────────
//
// Fuentes:
//   - PREVALENCIA_BASE_2024: IDF Diabetes Atlas 2024 (dato real en BD)
//   - TASA_CRECIMIENTO_BASE: calculada de PAHO 1990–2022
//   - IMPACTO_POR_100M: estimaciones basadas en DPP Study (NEJM 2002),
//     WHO Global Diabetes Compact 2021, CDC 2023.
//     ⚠ Son estimaciones bibliográficas, no calculadas desde nuestros CSVs.
//
// Fórmulas:
//   sinIntervencion(n) = P₀ × (1 + r)^n
//   conIntervencion(n) = P₀ × (1 + r × (1 – impacto))^n
//   impacto = IMPACTO_POR_100M[tipo] × (inversión / 100)
//
// KPIs:
//   reduccionProyectada  = (con_final – sin_final) / sin_final × 100
//   casosEvitados        = (sin_final – con_final) × 800_000
//   ahorroEstimadoMill.  = casosEvitados × 1_438 / 1_000_000

const PREVALENCIA_BASE_2024 = 16.4    // % — IDF 2024
const TASA_CRECIMIENTO_BASE = 0.021   // 2.1% anual histórico — PAHO 1990–2022

// Reducción de la tasa de crecimiento por cada 100M MXN invertidos
const IMPACTO_POR_100M: Record<TipoInversion, number> = {
  PREVENCION:  0.045,   // DPP Study NEJM 2002
  TRATAMIENTO: 0.024,   // WHO Global Diabetes Compact 2021
  DETECCION:   0.012,   // CDC 2023
}

export function calcularProyeccion(params: ProyeccionParams): ProyeccionResultado {
  const { tipoInversion, inversionAnualMillones, periodoInicio, periodoFin } = params

  // Impacto sobre la tasa de crecimiento (se satura en 1 para no hacerla negativa)
  const impacto = Math.min(
    IMPACTO_POR_100M[tipoInversion] * (inversionAnualMillones / 100),
    1
  )

  const años = Array.from(
    { length: periodoFin - periodoInicio + 1 },
    (_, i) => periodoInicio + i
  )

  const puntos: PuntoProyeccion[] = años.map(año => {
    const n = año - periodoInicio
    return {
      año,
      sinIntervencion: parseFloat(
        (PREVALENCIA_BASE_2024 * Math.pow(1 + TASA_CRECIMIENTO_BASE, n)).toFixed(2)
      ),
      conIntervencion: parseFloat(
        (PREVALENCIA_BASE_2024 * Math.pow(1 + TASA_CRECIMIENTO_BASE * (1 - impacto), n)).toFixed(2)
      ),
    }
  })

  const ultimo  = puntos[puntos.length - 1]
  const reduccionProyectada = parseFloat(
    (((ultimo.conIntervencion - ultimo.sinIntervencion) / ultimo.sinIntervencion) * 100).toFixed(1)
  )
  // 1% prevalencia ≈ 800,000 personas (población adulta México ~85M)
  const casosEvitados = Math.round(
    (ultimo.sinIntervencion - ultimo.conIntervencion) * 800_000
  )
  // $1,438 USD = gasto per cápita diabetes México 2024 — IDF 2024 (dato real de BD)
  const ahorroEstimadoMillones = Math.round(casosEvitados * 1_438 / 1_000_000)

  return {
    params,
    puntos,
    kpis: { reduccionProyectada, casosEvitados, ahorroEstimadoMillones },
  }
}

// ─── Modelo matemático ────────────────────────────────────────────────────────
//
// Personas con diabetes México 2024: 13.587 millones — IDF Diabetes Atlas 2024
// Fórmula:
//   sinIntervencion(n) = 13.587 × (1 + tasa)^n
//   conIntervencion(n) = 13.587 × (1 + tasa × (1 – intensidad/100))^n
//
// intensidadPolitica: 0 = ninguna política, 50 = intervención muy fuerte
// Fuente referencia: Barquera et al. 2022 (Salud Pública de México)
 
const CASOS_BASE_2024_MILLONES = 13.587  // IDF 2024, dato real en BD
 
export function calcularProyeccionGeneral(params: GeneralProyeccionParams): GeneralResultado {
  const { tasaCrecimiento, intensidadPolitica, periodoInicio, periodoFin } = params
 
  const tasa   = tasaCrecimiento / 100
  const factor = 1 - intensidadPolitica / 100   // 0% → factor=1, 50% → factor=0.5
 
  const años = Array.from(
    { length: periodoFin - periodoInicio + 1 },
    (_, i) => periodoInicio + i
  )
 
  const puntos: GeneralPunto[] = años.map(año => {
    const n = año - periodoInicio
    return {
      año,
      sinIntervencion: parseFloat(
        (CASOS_BASE_2024_MILLONES * Math.pow(1 + tasa, n)).toFixed(2)
      ),
      conIntervencion: parseFloat(
        (CASOS_BASE_2024_MILLONES * Math.pow(1 + tasa * factor, n)).toFixed(2)
      ),
    }
  })
 
  const ultimo           = puntos[puntos.length - 1]
  const casosEvitados    = parseFloat((ultimo.sinIntervencion - ultimo.conIntervencion).toFixed(2))
  const reduccionPorc    = parseFloat(
    (((ultimo.conIntervencion - ultimo.sinIntervencion) / ultimo.sinIntervencion) * 100).toFixed(1)
  )
 
  return {
    tipo: 'GENERAL',
    params,
    puntos,
    kpis: {
      casosProyectados2050:  ultimo.sinIntervencion,
      casosEvitados,
      reduccionPorcentual:   reduccionPorc,
    },
  }
}

// ─── API calls ────────────────────────────────────────────────────────────────

export async function getProyecciones(): Promise<Proyeccion[]> {
  const res = await api.get<ProyeccionDTO[]>('/proyecciones')
  return res.data.map(parseProyeccion)
}

export async function saveProyeccion(
  titulo:      string,
  descripcion: string,
  resultado:   ProyeccionResultado
): Promise<Proyeccion> {
  const res = await api.post<ProyeccionDTO>('/proyecciones', {
    titulo,
    descripcion,
    resultado: JSON.stringify(resultado),
  })
  return parseProyeccion(res.data)
}

export async function deleteProyeccion(id: string): Promise<void> {
  await api.delete(`/proyecciones/${id}`)
}