import { render, screen } from '@testing-library/react'
import ActivityTable, { ActivityRow } from '../ActivityTable'

const mockData: ActivityRow[] = [
  {
    id: 1,
    admin: 'Santiago',
    accion: 'Usuario creado',
    detalle: 'Se creó un nuevo usuario',
    timestamp: '2026-05-18 10:00',
  },
  {
    id: 2,
    admin: 'Ana',
    accion: 'Usuario eliminado',
    detalle: 'Se eliminó un usuario',
    timestamp: '2026-05-18 11:00',
  },
]

const renderTable = (overrides = {}) => {
  const props = {
    data: mockData,
    ...overrides,
  }

  render(<ActivityTable {...props} />)
}

describe('ActivityTable', () => {

  // ── Renderizado ───────────────────────────────────────────────────────────

  test('renderiza headers', () => {
    renderTable()

    expect(
      screen.getByText('Fecha y hora')
    ).toBeInTheDocument()

    expect(
      screen.getByText('Admin')
    ).toBeInTheDocument()

    expect(
      screen.getByText('Acción')
    ).toBeInTheDocument()

    expect(
      screen.getByText('Justificación')
    ).toBeInTheDocument()
  })

  test('renderiza filas', () => {
    renderTable()

    expect(
      screen.getByText('Santiago')
    ).toBeInTheDocument()

    expect(
      screen.getByText('Ana')
    ).toBeInTheDocument()
  })

  test('renderiza detalles', () => {
    renderTable()

    expect(
      screen.getByText('"Se creó un nuevo usuario"')
    ).toBeInTheDocument()

    expect(
      screen.getByText('"Se eliminó un usuario"')
    ).toBeInTheDocument()
  })

  test('renderiza timestamps', () => {
    renderTable()

    expect(
      screen.getByText('2026-05-18 10:00')
    ).toBeInTheDocument()

    expect(
      screen.getByText('2026-05-18 11:00')
    ).toBeInTheDocument()
  })

  test('renderiza ActionBadge', () => {
    renderTable()

    expect(
      screen.getByText('Usuario creado')
    ).toBeInTheDocument()

    expect(
      screen.getByText('Usuario eliminado')
    ).toBeInTheDocument()
  })

  test('renderiza mensaje vacío cuando no hay data', () => {
    renderTable({
      data: [],
    })

    expect(
      screen.getByText('No hay actividad registrada aún.')
    ).toBeInTheDocument()
  })

})