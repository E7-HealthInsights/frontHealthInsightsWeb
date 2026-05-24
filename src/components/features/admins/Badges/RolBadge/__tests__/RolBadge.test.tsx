import { render, screen } from '@testing-library/react'
import RolBadge from '../RolBadge'

describe('RolBadge', () => {

  test('renderiza el rol', () => {
    render(
      <RolBadge rol="Administrador" />
    )

    expect(
      screen.getByText('Administrador')
    ).toBeInTheDocument()
  })

  test('aplica className extra', () => {
    render(
      <RolBadge
        rol="Administrador"
        className="extra-class"
      />
    )

    expect(
      screen.getByText('Administrador').className
    ).toContain('extra-class')
  })

})