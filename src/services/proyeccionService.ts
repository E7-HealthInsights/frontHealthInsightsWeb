import api from "../lib/api"
import type { GeneralProyeccionParams, GeneralResultado } from "../types/GeneralProyeccion"
import type { FinanzasParams, FinanzasResultado, RubroFinanzas } from "../types/FinanzasProyeccion"
import { parseProyeccion, type Proyeccion, type ProyeccionDTO, type ProyeccionResultado, type PuntoProyeccion } from "../types/Proyeccion"


// ─── Director de Finanzas v2 ──────────────────────────────────────────────────
//
// Modelo: inversión en PREVENCIÓN para los ~12.75M mexicanos con prediabetes.
// Fuentes: DPP Study NEJM 2002, WHO Global Action Plan 2013-2020, IDF 2024.
// ⚠ Simulación de política pública — no es un modelo clínico validado.


const PREVALENCIA_BASE_2024 = 16.4    // % — IDF 2024
const TASA_CRECIMIENTO_BASE = 0.021   // 2.1% anual histórico — PAHO 1990–2022
const POBLACION_ADULTA      = 85_000_000
const GASTO_PER_CAPITA_USD  = 1_438     // IDF 2024

// Efectividad clínica por rubro — porcentaje de reducción de incidencia
// con cobertura del 100% de la población en riesgo
const EFECTIVIDAD: Record<RubroFinanzas, number> = {
  NUTRICION:    0.58,   // DPP Study NEJM 2002: -58% en pre-diabéticos
  MEDICAMENTOS: 0.31,   // DPP Study NEJM 2002: -31% con metformina
  DETECCION:    0.10,   // CDC Diabetes Prevention Program
  ATENCION:     0.35,   // WHO Global Action Plan 2013-2020 (promedio 25-45%)
}
 
// Costo en MXN millones para cubrir al 100% de los 12.75M pre-diabéticos
const COSTO_COBERTURA_TOTAL: Record<RubroFinanzas, number> = {
  NUTRICION:    10_000,  // programa intensivo
  MEDICAMENTOS:  2_000,  // metformina genérica
  DETECCION:     1_000,  // tamizaje masivo
  ATENCION:      5_000,  // consultas primer nivel
}

const TIPO_CAMBIO_MXN_USD = 17.5   // aproximado para el cálculo de ROI

// ── Cálculo ──────────────────────────────────────────────────────────────────
 
export function calcularProyeccionFinanzas(params: FinanzasParams): FinanzasResultado {
  const { presupuestoTotalMillones, distribucion, periodoInicio, periodoFin } = params
 
  // Impacto total sumando los 4 rubros
  const rubros: RubroFinanzas[] = ['NUTRICION', 'MEDICAMENTOS', 'DETECCION', 'ATENCION']
 
  let impactoTotal = 0
  for (const rubro of rubros) {
    const inversionRubroM = presupuestoTotalMillones * (distribucion[rubro] / 100)
    const coberturaRubro  = Math.min(inversionRubroM / COSTO_COBERTURA_TOTAL[rubro], 1.0)
    impactoTotal += EFECTIVIDAD[rubro] * coberturaRubro
  }
 
  // Tasa de crecimiento reducida por la intervención
  const tasaReducida = Math.max(0, TASA_CRECIMIENTO_BASE * (1 - impactoTotal))
 
  // Curvas año a año
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
        (PREVALENCIA_BASE_2024 * Math.pow(1 + tasaReducida, n)).toFixed(2)
      ),
    }
  })
 
  // KPIs al año final
  const ultimo   = puntos[puntos.length - 1]
  const años_n   = periodoFin - periodoInicio
 
  const reduccionPct = parseFloat(
    (((ultimo.conIntervencion - ultimo.sinIntervencion) / ultimo.sinIntervencion) * 100).toFixed(1)
  )
  const casosEvitados = Math.round(
    ((ultimo.sinIntervencion - ultimo.conIntervencion) / 100) * POBLACION_ADULTA
  )
  const ahorroEstimadoUSD_M = Math.round(casosEvitados * GASTO_PER_CAPITA_USD / 1_000_000)
 
  // ROI: ahorro en MXN / inversión total en MXN
  const inversionTotalM = presupuestoTotalMillones * años_n
  const ahorroMXN_M     = ahorroEstimadoUSD_M * TIPO_CAMBIO_MXN_USD
  const ROI = inversionTotalM > 0
    ? parseFloat((ahorroMXN_M / inversionTotalM).toFixed(2))
    : 0
 
  return {
    tipo: 'FINANZAS',
    params,
    puntos,
    kpis: { reduccionPct, casosEvitados, ahorroEstimadoUSD_M, ROI },
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
 
  const puntos: PuntoProyeccion[] = años.map(año => {
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

// TODO: conectar cuando el backend tenga PUT /proyecciones/{id}
export async function updateProyeccion(
  id:          string,
  titulo:      string,
  descripcion: string,
  resultado:   ProyeccionResultado
): Promise<Proyeccion> {
  const res = await api.patch<ProyeccionDTO>(`/proyecciones/${id}`, {
    titulo,
    descripcion,
    resultado: JSON.stringify(resultado),
  })
  return parseProyeccion(res.data)
}
 
export async function deleteProyeccion(id: string): Promise<void> {
  await api.delete(`/proyecciones/${id}`)
}