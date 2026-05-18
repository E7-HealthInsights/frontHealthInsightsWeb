import { render, screen, fireEvent } from '@testing-library/react'
import DeleteActionButton from '../DeleteActionButton'

const renderDeleteButton = (overrides = {}) => {
  const props = {
    onClick: jest.fn(),
    ...overrides,
  }

  render(<DeleteActionButton {...props} />)

  return props
}

describe('DeleteActionButton', () => {

  // ── Renderizado ───────────────────────────────────────────────────────────

  test('renderiza el botón', () => {
    renderDeleteButton()

    expect(
      screen.getByLabelText('Eliminar')
    ).toBeInTheDocument()
  })

  test('aplica className extra', () => {
    renderDeleteButton({
      className: 'custom-class',
    })

    expect(
      screen.getByLabelText('Eliminar').className
    ).toContain('custom-class')
  })

  test('está deshabilitado cuando disabled es true', () => {
    renderDeleteButton({
      disabled: true,
    })

    expect(
      screen.getByLabelText('Eliminar')
    ).toBeDisabled()
  })

  // ── Interacciones ─────────────────────────────────────────────────────────

  test('llama onClick al hacer click', () => {
    const handleClick = jest.fn()

    renderDeleteButton({
      onClick: handleClick,
    })

    fireEvent.click(
      screen.getByLabelText('Eliminar')
    )

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  test('no llama onClick cuando está disabled', () => {
    const handleClick = jest.fn()

    renderDeleteButton({
      onClick: handleClick,
      disabled: true,
    })

    fireEvent.click(
      screen.getByLabelText('Eliminar')
    )

    expect(handleClick).not.toHaveBeenCalled()
  })

})