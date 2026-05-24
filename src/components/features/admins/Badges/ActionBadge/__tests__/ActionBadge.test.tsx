import { render, screen } from '@testing-library/react'
import ActionBadge from '../ActionBadge'

describe('ActionBadge', () => {

  test('renderiza el texto de la acción', () => {
    render(
      <ActionBadge action="Usuario creado" />
    )

    expect(
      screen.getByText('Usuario creado')
    ).toBeInTheDocument()
  })

  test('aplica clases verdes para acciones create', () => {
    render(
      <ActionBadge action="Usuario creado" />
    )

    expect(
      screen.getByText('Usuario creado').className
    ).toContain('bg-green-100')
  })

  test('aplica clases azules para acciones edit', () => {
    render(
      <ActionBadge action="Usuario editado" />
    )

    expect(
      screen.getByText('Usuario editado').className
    ).toContain('bg-[var(--color-hi-primary-soft)]')
  })

  test('aplica clases rojas para acciones delete', () => {
    render(
      <ActionBadge action="Usuario eliminado" />
    )

    expect(
      screen.getByText('Usuario eliminado').className
    ).toContain('bg-red-100')
  })

  test('aplica className extra', () => {
    render(
      <ActionBadge
        action="Usuario creado"
        className="extra-class"
      />
    )

    expect(
      screen.getByText('Usuario creado').className
    ).toContain('extra-class')
  })

})