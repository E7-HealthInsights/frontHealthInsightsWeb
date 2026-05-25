// src/components/features/proyecciones/__tests__/ImpactBadge.test.tsx

import { render, screen } from '@testing-library/react'
import ImpactBadge from '../ImpactBadge'

describe('ImpactBadge', () => {

  // ── Variantes de impacto ──────────────────────────────────────────────────

  test('muestra "Alto impacto" cuando reduccion ≤ -6', () => {
    render(<ImpactBadge reduccion={-8.2} />)
    expect(screen.getByText('Alto impacto')).toBeInTheDocument()
  })

  test('muestra "Impacto moderado" cuando -6 < reduccion ≤ -2', () => {
    render(<ImpactBadge reduccion={-4.5} />)
    expect(screen.getByText('Impacto moderado')).toBeInTheDocument()
  })

  test('muestra "Bajo impacto" cuando reduccion > -2', () => {
    render(<ImpactBadge reduccion={-0.8} />)
    expect(screen.getByText('Bajo impacto')).toBeInTheDocument()
  })

  test('en el límite exacto de -6 es "Alto impacto"', () => {
    render(<ImpactBadge reduccion={-6} />)
    expect(screen.getByText('Alto impacto')).toBeInTheDocument()
  })

  test('en el límite exacto de -2 es "Impacto moderado"', () => {
    render(<ImpactBadge reduccion={-2} />)
    expect(screen.getByText('Impacto moderado')).toBeInTheDocument()
  })

  // ── Valor mostrado ────────────────────────────────────────────────────────

  test('muestra el valor de reducción', () => {
    render(<ImpactBadge reduccion={-5.7} />)
    expect(screen.getByText('-5.7%')).toBeInTheDocument()
  })

  test('muestra valor positivo cuando no hay reducción', () => {
    render(<ImpactBadge reduccion={0.5} />)
    expect(screen.getByText('0.5%')).toBeInTheDocument()
  })

  // ── Colores semánticos ─────────────────────────────────────────────────────

  test('alto impacto aplica color verde (success)', () => {
    const { container } = render(<ImpactBadge reduccion={-10} />)
    const barRellena = container.querySelector('[class*="hi-success"]')
    expect(barRellena).toBeInTheDocument()
  })

  test('bajo impacto aplica color rojo (danger)', () => {
    const { container } = render(<ImpactBadge reduccion={0} />)
    const barRellena = container.querySelector('[class*="hi-danger"]')
    expect(barRellena).toBeInTheDocument()
  })

})