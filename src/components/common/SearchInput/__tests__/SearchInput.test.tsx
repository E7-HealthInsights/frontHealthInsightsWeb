import { render, screen, fireEvent } from '@testing-library/react'
import SearchInput from '../SearchInput'

const renderSearchInput = (overrides = {}) => {
  const props = {
    value: '',
    onChange: jest.fn(),
    ...overrides,
  }

  render(<SearchInput {...props} />)

  return props
}

describe('SearchInput', () => {

  // ── Renderizado ───────────────────────────────────────────────────────────

  test('renderiza placeholder por defecto', () => {
    renderSearchInput()

    expect(
      screen.getByPlaceholderText('Buscar…')
    ).toBeInTheDocument()
  })

  test('renderiza placeholder custom', () => {
    renderSearchInput({
      placeholder: 'Buscar usuarios',
    })

    expect(
      screen.getByPlaceholderText('Buscar usuarios')
    ).toBeInTheDocument()
  })

  test('renderiza valor actual', () => {
    renderSearchInput({
      value: 'Santiago',
    })

    expect(
      screen.getByDisplayValue('Santiago')
    ).toBeInTheDocument()
  })

  test('renderiza botón de limpiar cuando hay texto', () => {
    renderSearchInput({
      value: 'Texto',
    })

    expect(
      screen.getByLabelText('Limpiar búsqueda')
    ).toBeInTheDocument()
  })

  test('no renderiza botón de limpiar cuando value está vacío', () => {
    renderSearchInput()

    expect(
      screen.queryByLabelText('Limpiar búsqueda')
    ).not.toBeInTheDocument()
  })

  test('aplica className extra', () => {
    const { container } = render(
      <SearchInput
        value=""
        onChange={jest.fn()}
        className="mb-4"
      />
    )

    expect(container.firstChild).toHaveClass('mb-4')
  })

  // ── Interacciones ─────────────────────────────────────────────────────────

  test('llama onChange al escribir', () => {
    const handleChange = jest.fn()

    renderSearchInput({
      onChange: handleChange,
    })

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'nuevo valor' },
    })

    expect(handleChange).toHaveBeenCalledWith('nuevo valor')
  })

  test('limpia usando onChange("") cuando no existe onClear', () => {
    const handleChange = jest.fn()

    renderSearchInput({
      value: 'Texto',
      onChange: handleChange,
    })

    fireEvent.click(
      screen.getByLabelText('Limpiar búsqueda')
    )

    expect(handleChange).toHaveBeenCalledWith('')
  })

  test('usa onClear cuando se pasa la prop', () => {
    const handleClear = jest.fn()

    renderSearchInput({
      value: 'Texto',
      onClear: handleClear,
    })

    fireEvent.click(
      screen.getByLabelText('Limpiar búsqueda')
    )

    expect(handleClear).toHaveBeenCalledTimes(1)
  })

  test('está deshabilitado cuando disabled es true', () => {
    renderSearchInput({
      disabled: true,
    })

    expect(
      screen.getByRole('textbox')
    ).toBeDisabled()
  })

  // ── Tamaños ───────────────────────────────────────────────────────────────

  test('size sm aplica clases correctas', () => {
    renderSearchInput({
      size: 'sm',
    })

    expect(
      screen.getByRole('textbox').className
    ).toContain('text-xs')
  })

  test('size lg aplica clases correctas', () => {
    renderSearchInput({
      size: 'lg',
    })

    expect(
      screen.getByRole('textbox').className
    ).toContain('text-base')
  })

  test('size por defecto es md', () => {
    renderSearchInput()

    expect(
      screen.getByRole('textbox').className
    ).toContain('text-sm')
  })

})