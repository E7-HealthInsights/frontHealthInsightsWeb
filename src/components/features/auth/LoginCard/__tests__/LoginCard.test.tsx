// src/components/features/auth/LoginCard/__tests__/LoginCard.test.tsx

import { render, screen } from '@testing-library/react'
import userEvent           from '@testing-library/user-event'
import LoginCard           from '../LoginCard'

// ── Helper ────────────────────────────────────────────────────────────────

const renderLoginCard = (overrides = {}) => {
  const props = {
    onSubmit: jest.fn(),
    loading:  false,
    error:    '',
    ...overrides,
  }
  render(<LoginCard {...props} />)
  return props
}

// ── Tests ─────────────────────────────────────────────────────────────────

describe('LoginCard', () => {

  // ── Renderizado ───────────────────────────────────────────────────────────

  test('renderiza el campo de correo electrónico', () => {
    renderLoginCard()
    expect(screen.getByPlaceholderText(/correo@ejemplo\.com/i)).toBeInTheDocument()
  })

  test('renderiza el campo de contraseña', () => {
    renderLoginCard()
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument()
  })

  test('renderiza el botón de ingresar', () => {
    renderLoginCard()
    expect(screen.getByRole('button', { name: /ingresar/i })).toBeInTheDocument()
  })

  test('renderiza el mensaje de contraseña olvidada', () => {
    renderLoginCard()
    expect(screen.getByText(/olvidaste tu contraseña/i)).toBeInTheDocument()
  })

  // ── Interacciones ─────────────────────────────────────────────────────────

  test('actualiza el valor del campo de correo al escribir', async () => {
    const user = userEvent.setup({ delay: null })
    renderLoginCard()

    await user.type(screen.getByPlaceholderText(/correo@ejemplo\.com/i), 'test@example.com')

    expect(screen.getByPlaceholderText(/correo@ejemplo\.com/i)).toHaveValue('test@example.com')
  })

  test('actualiza el valor del campo de contraseña al escribir', async () => {
    const user = userEvent.setup({ delay: null })
    renderLoginCard()

    await user.type(screen.getByPlaceholderText(/••••••••/i), 'mypassword')

    expect(screen.getByPlaceholderText(/••••••••/i)).toHaveValue('mypassword')
  })

  test('llama a onSubmit con email y password al enviar el formulario', async () => {
    const user = userEvent.setup({ delay: null })
    const { onSubmit } = renderLoginCard()

    await user.type(screen.getByPlaceholderText(/correo@ejemplo\.com/i), 'santiago@example.com')
    await user.type(screen.getByPlaceholderText(/••••••••/i), 'password123')
    await user.click(screen.getByRole('button', { name: /ingresar/i }))

    expect(onSubmit).toHaveBeenCalledWith('santiago@example.com', 'password123')
  })

  test('llama a onSubmit solo una vez por clic', async () => {
    const user = userEvent.setup({ delay: null })
    const { onSubmit } = renderLoginCard()

    await user.type(screen.getByPlaceholderText(/correo@ejemplo\.com/i), 'test@example.com')
    await user.type(screen.getByPlaceholderText(/••••••••/i), 'pass')
    await user.click(screen.getByRole('button', { name: /ingresar/i }))

    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  // ── Estado loading ────────────────────────────────────────────────────────

  test('el botón está deshabilitado cuando loading es true', () => {
    renderLoginCard({ loading: true })
    expect(screen.getByRole('button', { name: /ingresar/i })).toBeDisabled()
  })

  test('los inputs se deshabilitan cuando loading es true', () => {
    renderLoginCard({ loading: true })
    expect(screen.getByPlaceholderText(/correo@ejemplo\.com/i)).toBeDisabled()
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeDisabled()
  })

  test('no llama a onSubmit cuando está en loading', async () => {
    const user = userEvent.setup({ delay: null })
    const { onSubmit } = renderLoginCard({ loading: true })

    await user.click(screen.getByRole('button', { name: /ingresar/i }))

    expect(onSubmit).not.toHaveBeenCalled()
  })

  // ── Manejo de error ───────────────────────────────────────────────────────

  test('muestra el mensaje de error cuando la prop error tiene contenido', () => {
    renderLoginCard({ error: 'Correo o contraseña incorrectos. Intenta de nuevo.' })
    expect(screen.getByText(/correo o contraseña incorrectos/i)).toBeInTheDocument()
  })

  test('no muestra error cuando la prop error está vacía', () => {
    renderLoginCard({ error: '' })
    expect(screen.queryByText(/correo o contraseña incorrectos/i)).not.toBeInTheDocument()
  })

  // ── Accesibilidad ─────────────────────────────────────────────────────────

  test('el campo de contraseña es de tipo password', () => {
    renderLoginCard()
    expect(screen.getByPlaceholderText(/••••••••/i)).toHaveAttribute('type', 'password')
  })

  test('el campo de correo es de tipo email', () => {
    renderLoginCard()
    expect(screen.getByPlaceholderText(/correo@ejemplo\.com/i)).toHaveAttribute('type', 'email')
  })

})