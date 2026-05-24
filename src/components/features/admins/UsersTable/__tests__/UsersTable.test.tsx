import { render, screen, fireEvent } from '@testing-library/react'
import UsersTable from '../UsersTable'
import type { User } from '../../../../../types/User'

const mockUsers: User[] = [
  {
    id: "1",
    nombre: 'Juan',
    apellido: 'Pérez',
    correo: 'juan@test.com',
    rol: 'Admin',
    estatus: 'Activo',
  },
]

const renderTable = (overrides = {}) => {
  const props = {
    data: mockUsers,
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    ...overrides,
  }

  render(<UsersTable {...props} />)

  return props
}

describe('UsersTable', () => {

  test('renderiza usuarios', () => {
    renderTable()

    expect(
      screen.getByText('Juan Pérez')
    ).toBeInTheDocument()
  })

  test('renderiza correo', () => {
    renderTable()

    expect(
      screen.getByText('juan@test.com')
    ).toBeInTheDocument()
  })

  test('renderiza badges', () => {
    renderTable()

    expect(screen.getByText('Admin')).toBeInTheDocument()
    expect(screen.getByText('Activo')).toBeInTheDocument()
  })

  test('llama onEdit', () => {
    const onEdit = jest.fn()

    renderTable({ onEdit })

    fireEvent.click(
      screen.getByLabelText('Editar')
    )

    expect(onEdit).toHaveBeenCalledWith(mockUsers[0])
  })

  test('llama onDelete', () => {
    const onDelete = jest.fn()

    renderTable({ onDelete })

    fireEvent.click(
      screen.getByLabelText('Eliminar')
    )

    expect(onDelete).toHaveBeenCalledWith(mockUsers[0])
  })

  test('renderiza empty state', () => {
    renderTable({
      data: [],
    })

    expect(
      screen.getByText('No se encontraron usuarios.')
    ).toBeInTheDocument()
  })

})