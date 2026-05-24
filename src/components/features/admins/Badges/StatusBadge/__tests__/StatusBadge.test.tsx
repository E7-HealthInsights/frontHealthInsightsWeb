import { render, screen } from '@testing-library/react'
import StatusBadge from '../StatusBadge'

describe('StatusBadge', () => {

  test('renderiza status activo', () => {
    render(
      <StatusBadge status="Activo" />
    )

    expect(
      screen.getByText('Activo')
    ).toBeInTheDocument()
  })

  test('renderiza status inactivo', () => {
    render(
      <StatusBadge status="Inactivo" />
    )

    expect(
      screen.getByText('Inactivo')
    ).toBeInTheDocument()
  })

  test('usa variant success cuando status es Activo', () => {
    render(
      <StatusBadge status="Activo" />
    )

    expect(
      screen.getByText('Activo').className
    ).toContain('bg-green-100')
  })

  test('usa variant danger cuando status NO es Activo', () => {
    render(
      <StatusBadge status="Inactivo" />
    )

    expect(
      screen.getByText('Inactivo').className
    ).toContain('bg-red-100')
  })

  test('aplica className extra', () => {
    render(
      <StatusBadge
        status="Activo"
        className="extra-class"
      />
    )

    expect(
      screen.getByText('Activo').className
    ).toContain('extra-class')
  })

})