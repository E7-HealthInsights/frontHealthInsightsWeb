// src/components/features/auth/__tests__/LoginCard.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginCard from '../LoginCard'

// ── Helper ────────────────────────────────────────────────────────────────

const renderLoginCard = (overrides = {}) => {
  const defaultProps = {
    onSubmit: jest.fn(),
    loading:  false,
    error:    '',
    ...overrides,
  }
  render(<LoginCard {...defaultProps} />)
  return defaultProps
}

// ── Tests ─────────────────────────────────────────────────────────────────

describe('LoginCard', () => {

  // ── Renderizado ───────────────────────────────────────────────────────────

  test('renderiza el campo de correo electrónico', () => {
    renderLoginCard()
    expect(
      screen.getByPlaceholderText(/correo@ejemplo\.com/i)
    ).toBeInTheDocument()
  })

  test('renderiza el campo de contraseña', () => {
    renderLoginCard()
    expect(
      screen.getByPlaceholderText(/••••••••/i)
    ).toBeInTheDocument()
  })

  test('renderiza el botón de ingresar', () => {
    renderLoginCard()
    expect(
      screen.getByRole('button', { name: /ingresar/i })
    ).toBeInTheDocument()
  })

  test('renderiza el mensaje de contraseña olvidada', () => {
    renderLoginCard()
    expect(
      screen.getByText(/olvidaste tu contraseña/i)
    ).toBeInTheDocument()
  })

  // ── Interacciones ─────────────────────────────────────────────────────────

  test('actualiza el valor del campo de correo al escribir', async () => {
    renderLoginCard()
    const emailInput = screen.getByPlaceholderText(/correo@ejemplo\.com/i)
    await userEvent.type(emailInput, 'test@example.com')
    expect(emailInput).toHaveValue('test@example.com')
  })

  test('actualiza el valor del campo de contraseña al escribir', async () => {
    renderLoginCard()
    const passwordInput = screen.getByPlaceholderText(/••••••••/i)
    await userEvent.type(passwordInput, 'mypassword')
    expect(passwordInput).toHaveValue('mypassword')
  })

  test('llama a onSubmit con email y password al enviar el formulario', async () => {
    const { onSubmit } = renderLoginCard()

    await userEvent.type(
      screen.getByPlaceholderText(/correo@ejemplo\.com/i),
      'santiago@example.com'
    )
    await userEvent.type(
      screen.getByPlaceholderText(/••••••••/i),
      'password123'
    )
    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        'santiago@example.com',
        'password123'
      )
    })
  })

  test('llama a onSubmit solo una vez por clic', async () => {
    const { onSubmit } = renderLoginCard()

    await userEvent.type(
      screen.getByPlaceholderText(/correo@ejemplo\.com/i),
      'test@example.com'
    )
    await userEvent.type(
      screen.getByPlaceholderText(/••••••••/i),
      'pass'
    )
    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1)
    })
  })

  // ── Estado loading ────────────────────────────────────────────────────────

  test('el botón muestra loading cuando la prop loading es true', () => {
    renderLoginCard({ loading: true })
    const btn = screen.getByRole('button', { name: /ingresar/i })
    expect(btn).toBeDisabled()
  })

  test('los inputs se deshabilitan cuando loading es true', () => {
    renderLoginCard({ loading: true })
    expect(screen.getByPlaceholderText(/correo@ejemplo\.com/i)).toBeDisabled()
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeDisabled()
  })

  // ── Manejo de error ───────────────────────────────────────────────────────

  test('muestra el mensaje de error cuando la prop error tiene contenido', () => {
    renderLoginCard({ error: 'Correo o contraseña incorrectos. Intenta de nuevo.' })
    expect(
      screen.getByText(/correo o contraseña incorrectos/i)
    ).toBeInTheDocument()
  })

  test('no muestra error cuando la prop error está vacía', () => {
    renderLoginCard({ error: '' })
    expect(
      screen.queryByText(/correo o contraseña incorrectos/i)
    ).not.toBeInTheDocument()
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