// src/components/features/proyecciones/__tests__/ProjectionCard.test.tsx

import { render, screen } from '@testing-library/react'
import userEvent           from '@testing-library/user-event'
import ProjectionCard      from '../ProjectionCard'
import { Proyeccion } from '../../../../../types/Proyeccion'


// ── Fixtures ──────────────────────────────────────────────────────────────

const mockProyeccionFinanzas: Proyeccion = {
  id:            'fin-001',
  titulo:        'Escenario Finanzas',
  descripcion:   'Descripción finanzas',
  fechaCreacion: '2026-05-01T10:00:00',
  resultado: {
    tipo: 'FINANZAS',
    params: {
      presupuestoTotalMillones: 2000,
      distribucion: { NUTRICION: 25, MEDICAMENTOS: 25, DETECCION: 25, ATENCION: 25 },
      periodoInicio: 2025,
      periodoFin:    2040,
    },
    puntos: [{ año: 2025, sinIntervencion: 16.4, conIntervencion: 16.4 }],
    kpis: {
      reduccionPct:        -8.2,
      casosEvitados:       1_200_000,
      ahorroEstimadoUSD_M: 1725,
      ROI:                 1.2,
    },
  },
}

const mockProyeccionGeneral: Proyeccion = {
  id:            'gen-001',
  titulo:        'Escenario General',
  descripcion:   'Descripción general',
  fechaCreacion: '2026-05-10T10:00:00',
  resultado: {
    tipo: 'GENERAL',
    params: {
      tasaCrecimiento:    2.1,
      intensidadPolitica: 30,
      periodoInicio:      2025,
      periodoFin:         2035,
    },
    puntos: [{ año: 2025, sinIntervencion: 13.59, conIntervencion: 13.59 }],
    kpis: {
      casosProyectados2050: 18.5,
      casosEvitados:        2.1,
      reduccionPorcentual:  -4.2,
    },
  },
}

// ── Tests Finanzas ────────────────────────────────────────────────────────

describe('ProjectionCard — Finanzas', () => {

  test('renderiza el título de la proyección', () => {
    render(<ProjectionCard proyeccion={mockProyeccionFinanzas} onVer={jest.fn()} />)
    expect(screen.getByText('Escenario Finanzas')).toBeInTheDocument()
  })

  test('renderiza la descripción', () => {
    render(<ProjectionCard proyeccion={mockProyeccionFinanzas} onVer={jest.fn()} />)
    expect(screen.getByText('Descripción finanzas')).toBeInTheDocument()
  })

  test('renderiza casos evitados en millones', () => {
    render(<ProjectionCard proyeccion={mockProyeccionFinanzas} onVer={jest.fn()} />)
    expect(screen.getByText('~1.2M')).toBeInTheDocument()
  })

  test('renderiza ahorro USD', () => {
    render(<ProjectionCard proyeccion={mockProyeccionFinanzas} onVer={jest.fn()} />)
    expect(screen.getByText('$1,725M')).toBeInTheDocument()
  })

  test('renderiza el período', () => {
    render(<ProjectionCard proyeccion={mockProyeccionFinanzas} onVer={jest.fn()} />)
    expect(screen.getByText('2025–2040')).toBeInTheDocument()
  })

  test('renderiza el ROI', () => {
    render(<ProjectionCard proyeccion={mockProyeccionFinanzas} onVer={jest.fn()} />)
    expect(screen.getByText('1.2x')).toBeInTheDocument()
  })

  test('llama a onVer al hacer clic en Ver detalle', async () => {
    const onVer = jest.fn()
    const user  = userEvent.setup({ delay: null })
    render(<ProjectionCard proyeccion={mockProyeccionFinanzas} onVer={onVer} />)

    await user.click(screen.getAllByText('Ver')[0])

    expect(onVer).toHaveBeenCalledWith(mockProyeccionFinanzas)
  })

  test('renderiza ImpactBadge con la reducción correcta', () => {
    render(<ProjectionCard proyeccion={mockProyeccionFinanzas} onVer={jest.fn()} />)
    expect(screen.getByText('Alto impacto')).toBeInTheDocument()
    expect(screen.getByText('-8.2%')).toBeInTheDocument()
  })

  test('renderiza la fecha formateada', () => {
    render(<ProjectionCard proyeccion={mockProyeccionFinanzas} onVer={jest.fn()} />)
    expect(screen.getByText('01/05/2026')).toBeInTheDocument()
  })

})

// ── Tests General ─────────────────────────────────────────────────────────

describe('ProjectionCard — General', () => {

  test('renderiza el título de la proyección General', () => {
    render(<ProjectionCard proyeccion={mockProyeccionGeneral} onVer={jest.fn()} />)
    expect(screen.getByText('Escenario General')).toBeInTheDocument()
  })

  test('renderiza casos evitados en millones (General usa decimales)', () => {
    render(<ProjectionCard proyeccion={mockProyeccionGeneral} onVer={jest.fn()} />)
    expect(screen.getByText('~2.1M')).toBeInTheDocument()
  })

  test('renderiza la reducción porcentual', () => {
    render(<ProjectionCard proyeccion={mockProyeccionGeneral} onVer={jest.fn()} />)
    expect(screen.getAllByText('-4.2%')[0]).toBeInTheDocument()
  })

  test('renderiza la intensidad de política', () => {
    render(<ProjectionCard proyeccion={mockProyeccionGeneral} onVer={jest.fn()} />)
    expect(screen.getByText('30%')).toBeInTheDocument()
  })

  test('renderiza el período del General', () => {
    render(<ProjectionCard proyeccion={mockProyeccionGeneral} onVer={jest.fn()} />)
    expect(screen.getByText('2025–2035')).toBeInTheDocument()
  })

  test('llama a onVer con la proyección General', async () => {
    const onVer = jest.fn()
    const user  = userEvent.setup({ delay: null })
    render(<ProjectionCard proyeccion={mockProyeccionGeneral} onVer={onVer} />)

    await user.click(screen.getAllByText('Ver')[0])

    expect(onVer).toHaveBeenCalledWith(mockProyeccionGeneral)
  })

  test('ImpactBadge muestra impacto moderado para -4.2%', () => {
    render(<ProjectionCard proyeccion={mockProyeccionGeneral} onVer={jest.fn()} />)
    expect(screen.getByText('Impacto moderado')).toBeInTheDocument()
  })

})