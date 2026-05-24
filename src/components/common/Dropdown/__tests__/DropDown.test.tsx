import { render, screen, fireEvent } from '@testing-library/react'
import Dropdown from '../Dropdown'

const options = [
  { value: '1', label: 'Opción 1' },
  { value: '2', label: 'Opción 2' },
]

const renderDropdown = (overrides = {}) => {
  const props = {
    options,
    value: '',
    onChange: jest.fn(),
    ...overrides,
  }

  render(<Dropdown {...props} />)

  return props
}

describe('Dropdown', () => {

  // ── Renderizado ───────────────────────────────────────────────────────────

  test('renderiza label cuando se pasa la prop', () => {
    renderDropdown({
      label: 'Categoría',
    })

    expect(
      screen.getByText('Categoría')
    ).toBeInTheDocument()
  })

  test('renderiza placeholder por defecto', () => {
    renderDropdown()

    expect(
      screen.getByText('Seleccionar…')
    ).toBeInTheDocument()
  })

  test('renderiza placeholder custom', () => {
    renderDropdown({
      placeholder: 'Elegir opción',
    })

    expect(
      screen.getByText('Elegir opción')
    ).toBeInTheDocument()
  })

  test('renderiza valor seleccionado', () => {
    renderDropdown({
      value: '1',
    })

    expect(
      screen.getByText('Opción 1')
    ).toBeInTheDocument()
  })

  test('renderiza mensaje de error', () => {
    renderDropdown({
      error: 'Campo obligatorio',
    })

    expect(
      screen.getByText('Campo obligatorio')
    ).toBeInTheDocument()
  })

  test('aplica className extra', () => {
    const { container } = render(
      <Dropdown
        options={options}
        value=""
        onChange={jest.fn()}
        className="mb-4"
      />
    )

    expect(container.firstChild).toHaveClass('mb-4')
  })

  // ── Apertura ──────────────────────────────────────────────────────────────

  test('abre opciones al hacer click', () => {
    renderDropdown()

    fireEvent.click(screen.getByRole('button'))

    expect(
      screen.getByText('Opción 1')
    ).toBeInTheDocument()

    expect(
      screen.getByText('Opción 2')
    ).toBeInTheDocument()
  })

  test('cierra opciones al seleccionar una opción', () => {
    renderDropdown()

    fireEvent.click(screen.getByRole('button'))

    fireEvent.click(screen.getByText('Opción 1'))

    expect(
      screen.queryByRole('listbox')
    ).not.toBeInTheDocument()
  })

  test('llama onChange al seleccionar opción', () => {
    const handleChange = jest.fn()

    renderDropdown({
      onChange: handleChange,
    })

    fireEvent.click(screen.getByRole('button'))

    fireEvent.click(screen.getByText('Opción 2'))

    expect(handleChange).toHaveBeenCalledWith('2')
  })

  test('no abre cuando disabled es true', () => {
    renderDropdown({
      disabled: true,
    })

    fireEvent.click(screen.getByRole('button'))

    expect(
      screen.queryByRole('listbox')
    ).not.toBeInTheDocument()
  })

  test('muestra mensaje cuando no hay opciones', () => {
    renderDropdown({
      options: [],
    })

    fireEvent.click(screen.getByRole('button'))

    expect(
      screen.getByText('Sin opciones disponibles')
    ).toBeInTheDocument()
  })

})