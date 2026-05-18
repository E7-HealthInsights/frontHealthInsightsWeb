import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CreateUserModal from '../CreateUserModal'

const renderModal = (overrides = {}) => {
  const props = {
    isOpen: true,
    onClose: jest.fn(),
    onCreate: jest.fn(),
    ...overrides,
  }

  render(<CreateUserModal {...props} />)

  return props
}

describe('CreateUserModal', () => {

  // ── Renderizado ───────────────────────────────────────────────────────────

  test('renderiza título', () => {
    renderModal()

    expect(
      screen.getByText('Nuevo Usuario')
    ).toBeInTheDocument()
  })

  test('renderiza campos del formulario', () => {
    renderModal()

    expect(screen.getByLabelText('Nombre')).toBeInTheDocument()
    expect(screen.getByLabelText('Apellido')).toBeInTheDocument()
    expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument()
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument()
  })

  // ── Validaciones ──────────────────────────────────────────────────────────

  test('muestra errores cuando el formulario está vacío', async () => {
    renderModal()

    fireEvent.click(
      screen.getByText('Crear Usuario')
    )

    await waitFor(() => {
      expect(screen.getAllByText('Campo requerido').length)
        .toBeGreaterThan(0)
    })
  })

  test('muestra error de correo inválido', async () => {
    renderModal()

    fireEvent.change(
      screen.getByLabelText('Correo electrónico'),
      {
        target: { value: 'correo-invalido' },
      }
    )

    fireEvent.click(screen.getByText('Crear Usuario'))

    await waitFor(() => {
      expect(
        screen.getByText('Correo inválido')
      ).toBeInTheDocument()
    })
  })

  test('muestra error de password corta', async () => {
    renderModal()

    fireEvent.change(
      screen.getByLabelText('Contraseña'),
      {
        target: { value: '123' },
      }
    )

    fireEvent.click(screen.getByText('Crear Usuario'))

    await waitFor(() => {
      expect(
        screen.getByText('Mínimo 8 caracteres')
      ).toBeInTheDocument()
    })
  })

  // ── Submit ────────────────────────────────────────────────────────────────

  test('llama onCreate con payload válido', async () => {
    const onCreate = jest.fn()

    renderModal({ onCreate })

    fireEvent.change(screen.getByLabelText('Nombre'), {
      target: { value: 'Juan' },
    })

    fireEvent.change(screen.getByLabelText('Apellido'), {
      target: { value: 'Pérez' },
    })

    fireEvent.change(screen.getByLabelText('Correo electrónico'), {
      target: { value: 'juan@test.com' },
    })

    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'Password1' },
    })

    // abrir dropdown
    fireEvent.click(screen.getByText('Selecciona un rol…'))

    fireEvent.click(
      screen.getByText('Admin')
    )

    fireEvent.click(screen.getByText('Crear Usuario'))

    await waitFor(() => {
      expect(onCreate).toHaveBeenCalled()
    })
  })

  test('llama onClose después de crear', async () => {
    const onClose = jest.fn()

    renderModal({ onClose })

    fireEvent.change(screen.getByLabelText('Nombre'), {
      target: { value: 'Juan' },
    })

    fireEvent.change(screen.getByLabelText('Apellido'), {
      target: { value: 'Pérez' },
    })

    fireEvent.change(screen.getByLabelText('Correo electrónico'), {
      target: { value: 'juan@test.com' },
    })

    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'Password1' },
    })

    fireEvent.click(screen.getByText('Selecciona un rol…'))

    fireEvent.click(screen.getByText('Admin'))

    fireEvent.click(screen.getByText('Crear Usuario'))

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled()
    })
  })

})