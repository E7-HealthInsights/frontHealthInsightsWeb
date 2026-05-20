import { render, screen, fireEvent } from '@testing-library/react'
import EditActionButton from '../EditActionButton'

const renderEditButton = (overrides = {}) => {
  const props = {
    onClick: jest.fn(),
    ...overrides,
  }

  render(<EditActionButton {...props} />)

  return props
}

describe('EditActionButton', () => {

  // ── Renderizado ───────────────────────────────────────────────────────────

  test('renderiza el botón', () => {
    renderEditButton()

    expect(
      screen.getByLabelText('Editar')
    ).toBeInTheDocument()
  })

  test('aplica className extra', () => {
    renderEditButton({
      className: 'custom-class',
    })

    expect(
      screen.getByLabelText('Editar').className
    ).toContain('custom-class')
  })

  test('está deshabilitado cuando disabled es true', () => {
    renderEditButton({
      disabled: true,
    })

    expect(
      screen.getByLabelText('Editar')
    ).toBeDisabled()
  })

  // ── Interacciones ─────────────────────────────────────────────────────────

  test('llama onClick al hacer click', () => {
    const handleClick = jest.fn()

    renderEditButton({
      onClick: handleClick,
    })

    fireEvent.click(
      screen.getByLabelText('Editar')
    )

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  test('no llama onClick cuando está disabled', () => {
    const handleClick = jest.fn()

    renderEditButton({
      onClick: handleClick,
      disabled: true,
    })

    fireEvent.click(
      screen.getByLabelText('Editar')
    )

    expect(handleClick).not.toHaveBeenCalled()
  })

})