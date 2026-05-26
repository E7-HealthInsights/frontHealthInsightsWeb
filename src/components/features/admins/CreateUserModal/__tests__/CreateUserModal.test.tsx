// src/components/features/admins/CreateUserModal/__tests__/CreateUserModal.test.tsx

import { render, screen, waitFor } from '@testing-library/react'
import userEvent                    from '@testing-library/user-event'
import CreateUserModal              from '../CreateUserModal'

// ── Helper ────────────────────────────────────────────────────────────────

const renderModal = (overrides = {}) => {
  const props = {
    isOpen:   true,
    onClose:  jest.fn(),
    onCreate: jest.fn(),
    ...overrides,
  }
  render(<CreateUserModal {...props} />)
  return props
}

// ── Helpers reutilizables ─────────────────────────────────────────────────

const fillForm = async (user: ReturnType<typeof userEvent.setup>, overrides: Record<string, string> = {}) => {
  const values = {
    nombre:   'Juan',
    apellido: 'Pérez',
    correo:   'juan@test.com',
    password: 'Password1',
    ...overrides,
  }
  if (values.nombre)   await user.type(screen.getByLabelText('Nombre'),             values.nombre)
  if (values.apellido) await user.type(screen.getByLabelText('Apellido'),           values.apellido)
  if (values.correo)   await user.type(screen.getByLabelText('Correo electrónico'), values.correo)
  if (values.password) await user.type(screen.getByLabelText('Contraseña'),         values.password)
}

const selectRol = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('button', { name: /selecciona un rol/i }))
  await user.click(screen.getByRole('option',  { name: 'Admin' }))
}

// El flujo completo incluye el ConfirmActionModal de justificación
const completarFlujo = async (user: ReturnType<typeof userEvent.setup>, justificacion = 'Justificación de prueba') => {
  // 1. Clic en "Crear Usuario" — abre ConfirmActionModal paso 1
  await user.click(screen.getByRole('button', { name: /crear usuario/i }))

  // 2. Paso "confirm" — clic en "Continuar"
  await waitFor(() =>
    expect(screen.getByRole('button', { name: /continuar/i })).toBeInTheDocument()
  )
  await user.click(screen.getByRole('button', { name: /continuar/i }))

  // 3. Paso "justify" — ingresa justificación y confirma
  await waitFor(() =>
    expect(screen.getByPlaceholderText(/solicitud aprobada/i)).toBeInTheDocument()
  )
  await user.type(screen.getByPlaceholderText(/solicitud aprobada/i), justificacion)
  await user.click(screen.getByRole('button', { name: /confirmar/i }))
}

// ── Tests ─────────────────────────────────────────────────────────────────

describe('CreateUserModal', () => {

  // ── Renderizado ───────────────────────────────────────────────────────────

  test('renderiza el título del modal', () => {
    renderModal()
    expect(screen.getByText('Nuevo Usuario')).toBeInTheDocument()
  })

  test('renderiza todos los campos del formulario', () => {
    renderModal()
    expect(screen.getByLabelText('Nombre')).toBeInTheDocument()
    expect(screen.getByLabelText('Apellido')).toBeInTheDocument()
    expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument()
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument()
  })

  test('renderiza el dropdown de Rol', () => {
    renderModal()
    expect(screen.getByRole('button', { name: /selecciona un rol/i })).toBeInTheDocument()
  })

  test('renderiza los botones Cancelar y Crear Usuario', () => {
    renderModal()
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /crear usuario/i })).toBeInTheDocument()
  })

  // ── Validaciones ──────────────────────────────────────────────────────────

  test('muestra errores de campo requerido al enviar formulario vacío', async () => {
    const user = userEvent.setup({ delay: null })
    renderModal()

    await user.click(screen.getByRole('button', { name: /crear usuario/i }))

    expect(screen.getAllByText('Campo requerido').length).toBeGreaterThan(0)
  })

  test('muestra error de correo inválido', async () => {
    const user = userEvent.setup({ delay: null })
    renderModal()

    await user.type(screen.getByLabelText('Correo electrónico'), 'correo-invalido')
    await user.click(screen.getByRole('button', { name: /crear usuario/i }))

    expect(screen.getByText('Correo inválido')).toBeInTheDocument()
  })

  test('muestra error cuando la contraseña tiene menos de 8 caracteres', async () => {
    const user = userEvent.setup({ delay: null })
    renderModal()

    await user.type(screen.getByLabelText('Contraseña'), '123')
    await user.click(screen.getByRole('button', { name: /crear usuario/i }))

    expect(screen.getByText('Mínimo 8 caracteres')).toBeInTheDocument()
  })

  test('muestra error de patrón de contraseña', async () => {
    const user = userEvent.setup({ delay: null })
    renderModal()

    await user.type(screen.getByLabelText('Contraseña'), 'sinmayuscula1')
    await user.click(screen.getByRole('button', { name: /crear usuario/i }))

    expect(screen.getByText('Debe incluir mayúscula, minúscula y número')).toBeInTheDocument()
  })

  test('muestra error si no se selecciona rol', async () => {
    const user = userEvent.setup({ delay: null })
    renderModal()

    await fillForm(user)
    await user.click(screen.getByRole('button', { name: /crear usuario/i }))

    expect(screen.getByText('Selecciona un rol')).toBeInTheDocument()
  })

  // ── Formulario válido abre ConfirmActionModal ─────────────────────────────

  test('abre el ConfirmActionModal al enviar formulario válido', async () => {
    const user = userEvent.setup({ delay: null })
    renderModal()

    await fillForm(user)
    await selectRol(user)
    await user.click(screen.getByRole('button', { name: /crear usuario/i }))

    await waitFor(() =>
      expect(screen.getByText(/confirmar acción/i)).toBeInTheDocument()
    )
  })

  test('el ConfirmActionModal muestra el nombre y apellido del usuario a crear', async () => {
    const user = userEvent.setup({ delay: null })
    renderModal()

    await fillForm(user)
    await selectRol(user)
    await user.click(screen.getByRole('button', { name: /crear usuario/i }))

    await waitFor(() =>
      expect(screen.getByText(/juan pérez/i)).toBeInTheDocument()
    )
  })

  test('NO llama a onCreate si el formulario tiene errores', async () => {
    const onCreate = jest.fn()
    const user     = userEvent.setup({ delay: null })
    renderModal({ onCreate })

    await user.type(screen.getByLabelText('Nombre'), 'Juan')
    await user.click(screen.getByRole('button', { name: /crear usuario/i }))

    expect(onCreate).not.toHaveBeenCalled()
  })

  // ── Submit con justificación ──────────────────────────────────────────────

  test('llama a onCreate con el payload correcto después de completar el flujo', async () => {
    const onCreate = jest.fn()
    const user     = userEvent.setup({ delay: null })
    renderModal({ onCreate })

    await fillForm(user)
    await selectRol(user)
    await completarFlujo(user)

    await waitFor(() =>
      expect(onCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          nombre:        'Juan',
          apellido:      'Pérez',
          correo:        'juan@test.com',
          password:      'Password1',
          rol:           'Admin',
          justification: 'Justificación de prueba',
        })
      )
    )
  })

  test('llama a onClose después de completar el flujo exitosamente', async () => {
    const onClose = jest.fn()
    const user    = userEvent.setup({ delay: null })
    renderModal({ onClose })

    await fillForm(user)
    await selectRol(user)
    await completarFlujo(user)

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))
  })

  // ── Dropdown de Rol ───────────────────────────────────────────────────────

  test('abre el dropdown al hacer clic en el trigger', async () => {
    const user = userEvent.setup({ delay: null })
    renderModal()

    await user.click(screen.getByRole('button', { name: /selecciona un rol/i }))

    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  test('selecciona Admin correctamente', async () => {
    const user = userEvent.setup({ delay: null })
    renderModal()

    await user.click(screen.getByRole('button', { name: /selecciona un rol/i }))
    await user.click(screen.getByRole('option', { name: 'Admin' }))

    expect(screen.getByRole('button', { name: 'Admin' })).toBeInTheDocument()
  })

  // ── Cancelar ──────────────────────────────────────────────────────────────

  test('llama a onClose al hacer clic en Cancelar', async () => {
    const onClose = jest.fn()
    const user    = userEvent.setup({ delay: null })
    renderModal({ onClose })

    await user.click(screen.getByRole('button', { name: /cancelar/i }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  test('limpia el formulario al cancelar', async () => {
    const user = userEvent.setup({ delay: null })
    renderModal()

    await user.type(screen.getByLabelText('Nombre'), 'Juan')
    await user.click(screen.getByRole('button', { name: /cancelar/i }))

    expect(screen.getByLabelText('Nombre')).toHaveValue('')
  })

})