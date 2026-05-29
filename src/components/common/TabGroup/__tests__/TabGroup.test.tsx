import { render, screen, fireEvent } from '@testing-library/react'
import TabGroup from '../TabGroup'

const tabs = [
  {
    id: 'usuarios',
    label: 'Usuarios',
  },
  {
    id: 'reportes',
    label: 'Reportes',
  },
]

const renderTabGroup = (overrides = {}) => {
  const props = {
    tabs,
    activeTab: 'usuarios',
    onChange: jest.fn(),
    ...overrides,
  }

  render(<TabGroup {...props} />)

  return props
}

describe('TabGroup', () => {

  // ── Renderizado ───────────────────────────────────────────────────────────

  test('renderiza tabs', () => {
    renderTabGroup()

    expect(
      screen.getByText('Usuarios')
    ).toBeInTheDocument()

    expect(
      screen.getByText('Reportes')
    ).toBeInTheDocument()
  })

  test('renderiza role tablist', () => {
    renderTabGroup()

    expect(
      screen.getByRole('tablist')
    ).toBeInTheDocument()
  })

  test('marca tab activo correctamente', () => {
    renderTabGroup({
      activeTab: 'usuarios',
    })

    expect(
      screen.getByText('Usuarios')
    ).toHaveAttribute('aria-selected', 'true')
  })

  test('marca tabs inactivos correctamente', () => {
    renderTabGroup({
      activeTab: 'usuarios',
    })

    expect(
      screen.getByText('Reportes')
    ).toHaveAttribute('aria-selected', 'false')
  })

  test('aplica className extra', () => {
    const { container } = render(
      <TabGroup
        tabs={tabs}
        activeTab="usuarios"
        onChange={jest.fn()}
        className="mb-4"
      />
    )

    expect(container.firstChild).toHaveClass('mb-4')
  })

  // ── Interacciones ─────────────────────────────────────────────────────────

  test('llama onChange al hacer click en otro tab', () => {
    const handleChange = jest.fn()

    renderTabGroup({
      onChange: handleChange,
    })

    fireEvent.click(screen.getByText('Reportes'))

    expect(handleChange).toHaveBeenCalledWith('reportes')
  })

  // ── Iconos ────────────────────────────────────────────────────────────────

  test('renderiza icono cuando existe', () => {

    const tabsWithIcons = [
      {
        id: 'usuarios',
        label: 'Usuarios',
        icon: <span data-testid="icono">⭐</span>,
      },
    ]

    render(
      <TabGroup
        tabs={tabsWithIcons}
        activeTab="usuarios"
        onChange={jest.fn()}
      />
    )

    expect(
      screen.getByTestId('icono')
    ).toBeInTheDocument()
  })

})