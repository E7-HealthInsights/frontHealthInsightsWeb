import { render, screen, fireEvent } from '@testing-library/react'
import Navbar from '../Navbar'

jest.mock('../../UserMenu', () => {
  return function MockUserMenu({
    onLogout,
  }: {
    onLogout: () => void
  }) {
    return (
      <button onClick={onLogout}>
        Logout
      </button>
    )
  }
})

const links = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
  },
  {
    key: 'patients',
    label: 'Pacientes',
    path: '/patients',
  },
]

const renderNavbar = (overrides = {}) => {
  const props = {
    links,
    activePath: '/dashboard',
    onLogout: jest.fn(),
    ...overrides,
  }

  render(<Navbar {...props} />)

  return props
}

describe('Navbar', () => {

  // ── Renderizado ───────────────────────────────────────────────────────────

  test('renderiza el logo', () => {
    renderNavbar()

    expect(
      screen.getByText('Health')
    ).toBeInTheDocument()
  })

  test('renderiza los links', () => {
    renderNavbar()

    expect(
      screen.getByText('Dashboard')
    ).toBeInTheDocument()

    expect(
      screen.getByText('Pacientes')
    ).toBeInTheDocument()
  })

  test('marca el link activo', () => {
    renderNavbar({
      activePath: '/dashboard',
    })

    const activeLink = screen.getByText('Dashboard')

    expect(activeLink).toHaveAttribute(
      'aria-current',
      'page'
    )
  })

  test('no marca links inactivos', () => {
    renderNavbar({
      activePath: '/dashboard',
    })

    const inactiveLink = screen.getByText('Pacientes')

    expect(inactiveLink).not.toHaveAttribute(
      'aria-current'
    )
  })

  test('renderiza href correcto en links', () => {
    renderNavbar()

    expect(
      screen.getByText('Dashboard')
    ).toHaveAttribute('href', '/dashboard')

    expect(
      screen.getByText('Pacientes')
    ).toHaveAttribute('href', '/patients')
  })

  // ── Logout ────────────────────────────────────────────────────────────────

  test('llama onLogout desde UserMenu', () => {
    const handleLogout = jest.fn()

    renderNavbar({
      onLogout: handleLogout,
    })

    fireEvent.click(screen.getByText('Logout'))

    expect(handleLogout).toHaveBeenCalledTimes(1)
  })

})