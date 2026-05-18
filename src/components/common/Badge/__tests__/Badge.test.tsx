// src/components/common/Badge/__tests__/Badge.test.tsx

import { render, screen } from '@testing-library/react'
import Badge from '../Badge'



describe('Badge', () => {

  // ── Renderizado básico ───────────────────────────────────────────────────

  test('renderiza el label correctamente', () => {
    render(<Badge label="Activo" />)
    expect(screen.getByText('Activo')).toBeInTheDocument()
  })

  // ── Variantes de color ───────────────────────────────────────────────────

  test('variante success aplica clases verdes', () => {
    render(<Badge label="Activo" variant="success" />)
    const badge = screen.getByText('Activo')
    expect(badge.className).toContain('bg-green-100')
    expect(badge.className).toContain('text-green-700')
  })

  test('variante danger aplica clases rojas', () => {
    render(<Badge label="Inactivo" variant="danger" />)
    const badge = screen.getByText('Inactivo')
    expect(badge.className).toContain('bg-red-100')
    expect(badge.className).toContain('text-red-600')
  })

  test('variante warning aplica clases amarillas', () => {
    render(<Badge label="En riesgo" variant="warning" />)
    const badge = screen.getByText('En riesgo')
    expect(badge.className).toContain('bg-amber-100')
    expect(badge.className).toContain('text-amber-700')
  })

  test('variante info aplica clases del primary-soft', () => {
    render(<Badge label="D.G." variant="info" />)
    const badge = screen.getByText('D.G.')
    expect(badge.className).toContain('bg-[var(--color-hi-primary-soft)]')
  })

  test('variante neutral es la variante por defecto', () => {
    render(<Badge label="Pendiente" />)
    const badge = screen.getByText('Pendiente')
    expect(badge.className).toContain('bg-[var(--color-hi-bg)]')
  })

  // ── Formas ───────────────────────────────────────────────────────────────

  test('shape pill aplica rounded-full', () => {
    render(<Badge label="Activo" shape="pill" />)
    expect(screen.getByText('Activo').className).toContain('rounded-full')
  })

  test('shape rounded aplica radius-sm', () => {
    render(<Badge label="D.G." shape="rounded" />)
    expect(screen.getByText('D.G.').className).toContain('rounded-[var(--radius-sm)]')
  })

  test('shape por defecto es pill', () => {
    render(<Badge label="Activo" />)
    expect(screen.getByText('Activo').className).toContain('rounded-full')
  })

  // ── className extra ───────────────────────────────────────────────────────

  test('aplica className extra', () => {
    render(<Badge label="Activo" className="mt-2" />)
    expect(screen.getByText('Activo').className).toContain('mt-2')
  })

})