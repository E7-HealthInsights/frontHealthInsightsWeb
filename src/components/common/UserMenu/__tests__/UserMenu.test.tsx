import { render, screen, fireEvent } from '@testing-library/react'
import UserMenu from '../UserMenu'

const renderUserMenu = (overrides = {}) => {
  const props = {
    onLogout: jest.fn(),
    ...overrides,
  }

  render(<UserMenu {...props} />)

  return props
}

describe('UserMenu', () => {

  // ── Renderizado ───────────────────────────────────────────────────────────

  test('renderiza botón de menú', () => {
    renderUserMenu()

    expect(
      screen.getByLabelText('Menú de usuario')
    ).toBeInTheDocument()
  })

  test('no renderiza dropdown inicialmente', () => {
    renderUserMenu()

    expect(
      screen.queryByText('Cerrar Sesión')
    ).not.toBeInTheDocument()
  })

  test('aplica className extra', () => {
    const { container } = render(
      <UserMenu
        onLogout={jest.fn()}
        className="mb-4"
      />
    )

    expect(container.firstChild).toHaveClass('mb-4')
  })

  // ── Apertura ──────────────────────────────────────────────────────────────

  test('abre menú al hacer click', () => {
    renderUserMenu()

    fireEvent.click(
      screen.getByLabelText('Menú de usuario')
    )

    expect(
      screen.getByText('Cerrar Sesión')
    ).toBeInTheDocument()
  })

  test('cierra menú al volver a hacer click', () => {
    renderUserMenu()

    const button = screen.getByLabelText('Menú de usuario')

    fireEvent.click(button)

    expect(
      screen.getByText('Cerrar Sesión')
    ).toBeInTheDocument()

    fireEvent.click(button)

    expect(
      screen.queryByText('Cerrar Sesión')
    ).not.toBeInTheDocument()
  })

  // ── Logout ────────────────────────────────────────────────────────────────

  test('llama onLogout al hacer click en cerrar sesión', () => {
    const handleLogout = jest.fn()

    renderUserMenu({
      onLogout: handleLogout,
    })

    fireEvent.click(
      screen.getByLabelText('Menú de usuario')
    )

    fireEvent.click(
      screen.getByText('Cerrar Sesión')
    )

    expect(handleLogout).toHaveBeenCalledTimes(1)
  })

  test('cierra menú después de logout', () => {
    renderUserMenu()

    fireEvent.click(
      screen.getByLabelText('Menú de usuario')
    )

    fireEvent.click(
      screen.getByText('Cerrar Sesión')
    )

    expect(
      screen.queryByText('Cerrar Sesión')
    ).not.toBeInTheDocument()
  })

})