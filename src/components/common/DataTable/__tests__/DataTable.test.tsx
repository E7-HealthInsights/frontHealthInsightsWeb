import { render, screen } from '@testing-library/react'
import DataTable, { type Column } from '../DataTable'

interface User {
  id: number
  name: string
  email: string
  status?: string
}

const columns: Column<User>[] = [
  {
    key: 'name',
    header: 'Nombre',
  },
  {
    key: 'email',
    header: 'Correo',
  },
]

const data: User[] = [
  {
    id: 1,
    name: 'Santiago',
    email: 'santiago@test.com',
  },
  {
    id: 2,
    name: 'Ana',
    email: 'ana@test.com',
  },
]

const renderTable = (overrides = {}) => {
  const props = {
    columns,
    data,
    ...overrides,
  }

  return render(<DataTable {...props} />)
}

describe('DataTable', () => {

  // ── Renderizado ───────────────────────────────────────────────────────────

  test('renderiza los headers de las columnas', () => {
    renderTable()

    expect(screen.getByText('Nombre')).toBeInTheDocument()
    expect(screen.getByText('Correo')).toBeInTheDocument()
  })

  test('renderiza los datos de las filas', () => {
    renderTable()

    expect(screen.getByText('Santiago')).toBeInTheDocument()
    expect(screen.getByText('santiago@test.com')).toBeInTheDocument()

    expect(screen.getByText('Ana')).toBeInTheDocument()
    expect(screen.getByText('ana@test.com')).toBeInTheDocument()
  })

  test('renderiza emptyText cuando data está vacío', () => {
    renderTable({
      data: [],
      emptyText: 'No hay usuarios',
    })

    expect(
      screen.getByText('No hay usuarios')
    ).toBeInTheDocument()
  })

  test('renderiza emptyText por defecto', () => {
    renderTable({
      data: [],
    })

    expect(
      screen.getByText('No hay datos disponibles.')
    ).toBeInTheDocument()
  })

  test('aplica className extra al contenedor', () => {
    const { container } = renderTable({
      className: 'mb-4',
    })

    expect(container.firstChild).toHaveClass('mb-4')
  })

  // ── Render custom ─────────────────────────────────────────────────────────

  test('usa render custom cuando la columna tiene render()', () => {

    const customColumns: Column<User>[] = [
      {
        key: 'name',
        header: 'Nombre',
      },
      {
        key: 'status',
        header: 'Estado',
        render: row => (
          <span>
            Estado: {row.status}
          </span>
        ),
      },
    ]

    renderTable({
      columns: customColumns,
      data: [
        {
          id: 1,
          name: 'Carlos',
          email: 'carlos@test.com',
          status: 'Activo',
        },
      ],
    })

    expect(
      screen.getByText('Estado: Activo')
    ).toBeInTheDocument()
  })

  test('renderiza — cuando el valor no existe', () => {

    const customColumns: Column<User>[] = [
      {
        key: 'status',
        header: 'Estado',
      },
    ]

    renderTable({
      columns: customColumns,
      data: [
        {
          id: 1,
          name: 'Carlos',
          email: 'carlos@test.com',
        },
      ],
    })

    expect(screen.getByText('—')).toBeInTheDocument()
  })

})