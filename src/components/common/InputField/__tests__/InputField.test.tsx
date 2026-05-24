import { render, screen, fireEvent } from '@testing-library/react'
import InputField from '../InputField'

const renderInput = (overrides = {}) => {
  const props = {
    label: 'Campo',
    value: '',
    onChange: jest.fn(),
    ...overrides,
  }

  render(<InputField {...props} />)

  return props
}

describe('InputField', () => {

  test('renderiza el label cuando se pasa la prop', () => {
    renderInput({ label: 'Correo electrónico' })

    expect(
      screen.getByText('Correo electrónico')
    ).toBeInTheDocument()
  })

  test('renderiza el placeholder', () => {
    renderInput({
      placeholder: 'usuario@ejemplo.com',
    })

    expect(
      screen.getByPlaceholderText('usuario@ejemplo.com')
    ).toBeInTheDocument()
  })

  test('renderiza el valor actual', () => {
    renderInput({
      value: 'texto inicial',
    })

    expect(
      screen.getByDisplayValue('texto inicial')
    ).toBeInTheDocument()
  })

  test('type por defecto es text', () => {
    renderInput()

    expect(
      screen.getByRole('textbox')
    ).toHaveAttribute('type', 'text')
  })

  test('type password oculta el texto', () => {
    renderInput({
      type: 'password',
    })

    const input = document.querySelector('input[type="password"]')

    expect(input).toBeInTheDocument()
  })

  test('renderiza el mensaje de error cuando se pasa la prop', () => {
    renderInput({
      error: 'Este campo es obligatorio',
    })

    expect(
      screen.getByText('Este campo es obligatorio')
    ).toBeInTheDocument()
  })

  test('aplica borde rojo cuando hay error', () => {
    renderInput({
      error: 'Error',
    })

    const input = screen.getByRole('textbox')

    expect(input.className).toContain(
      'border-[var(--color-hi-danger)]'
    )
  })

  test('llama a onChange al escribir', () => {
    const handleChange = jest.fn()

    renderInput({
      onChange: handleChange,
    })

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'nuevo valor' },
    })

    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  test('está deshabilitado cuando disabled es true', () => {
    renderInput({
      disabled: true,
    })

    expect(
      screen.getByRole('textbox')
    ).toBeDisabled()
  })

  test('aplica className extra al contenedor', () => {
    const { container } = render(
      <InputField
        label="Campo"
        value=""
        onChange={jest.fn()}
        className="mb-4"
      />
    )

    expect(container.firstChild).toHaveClass('mb-4')
  })

})