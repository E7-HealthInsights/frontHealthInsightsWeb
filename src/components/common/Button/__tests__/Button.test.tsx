// src/components/common/Button/__tests__/Button.test.tsx

import { render, screen, fireEvent } from '@testing-library/react'
import Button from '../Button'


describe('Button', () => {

  // ── Renderizado básico ───────────────────────────────────────────────────

  test('renderiza el texto del children', () => {
    render(<Button>Ingresar</Button>)
    expect(screen.getByRole('button', { name: 'Ingresar' })).toBeInTheDocument()
  })

  test('variante primary aplica fondo teal', () => {
    render(<Button variant="primary">Guardar</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('bg-[var(--color-hi-primary)]')
  })

  test('variante secondary aplica borde y fondo surface', () => {
    render(<Button variant="secondary">Cancelar</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('bg-[var(--color-hi-surface)]')
  })

  test('tamaño sm aplica clase px-3', () => {
    render(<Button size="sm">Pequeño</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('px-3')
  })

  test('tamaño lg aplica clase px-5', () => {
    render(<Button size="lg">Grande</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('px-5')
  })

  // ── Interacciones ────────────────────────────────────────────────────────

  test('llama a onClick al hacer clic', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  test('no llama a onClick cuando está disabled', () => {
    const handleClick = jest.fn()
    render(<Button disabled onClick={handleClick}>Click</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).not.toHaveBeenCalled()
  })

  // ── Estado loading ───────────────────────────────────────────────────────

  test('muestra spinner cuando loading es true', () => {
    render(<Button loading>Guardar</Button>)
    const btn = screen.getByRole('button')
    // El spinner es un SVG con animate-spin
    expect(btn.querySelector('svg')).toBeInTheDocument()
  })

  test('deshabilita el botón cuando loading es true', () => {
    render(<Button loading>Guardar</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  test('no llama a onClick cuando está en loading', () => {
    const handleClick = jest.fn()
    render(<Button loading onClick={handleClick}>Guardar</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).not.toHaveBeenCalled()
  })

  // ── Type ─────────────────────────────────────────────────────────────────

  test('type submit se aplica correctamente', () => {
    render(<Button type="submit">Enviar</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
  })

  test('type por defecto es button', () => {
    render(<Button>Click</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })

  // ── className extra ───────────────────────────────────────────────────────

  test('aplica className extra sin romper las clases base', () => {
    render(<Button className="w-full">Full width</Button>)
    expect(screen.getByRole('button').className).toContain('w-full')
  })

  // ── ariaLabel ─────────────────────────────────────────────────────────────

  test('aplica aria-label cuando se pasa la prop', () => {
    render(<Button ariaLabel="Cerrar modal" variant="icon">X</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Cerrar modal')
  })

})