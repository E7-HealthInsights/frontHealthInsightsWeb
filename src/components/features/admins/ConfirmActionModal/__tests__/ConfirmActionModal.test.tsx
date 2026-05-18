import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ConfirmActionModal from '../ConfirmActionModal'

const renderModal = (overrides = {}) => {
  const props = {
    isOpen: true,
    onClose: jest.fn(),
    accionLabel: 'eliminar el usuario "Carlos"',
    onConfirm: jest.fn(),
    loading: false,
    ...overrides,
  }

  render(<ConfirmActionModal {...props} />)

  return props
}

describe('ConfirmActionModal', () => {

  // ── Renderizado inicial ───────────────────────────────────────────────────

  test('renderiza step de confirmación inicialmente', () => {
    renderModal()

    expect(
      screen.getByText('¿Confirmar acción?')
    ).toBeInTheDocument()

    expect(
      screen.getByText('eliminar el usuario "Carlos"')
    ).toBeInTheDocument()
  })

  test('renderiza botones de confirmación', () => {
    renderModal()

    expect(
      screen.getByText('Cancelar')
    ).toBeInTheDocument()

    expect(
      screen.getByText('Continuar')
    ).toBeInTheDocument()
  })

  // ── Navegación entre pasos ────────────────────────────────────────────────

  test('avanza al step de justificación', () => {
    renderModal()

    fireEvent.click(
      screen.getByText('Continuar')
    )

    expect(
      screen.getByText('Ingresa una justificación')
    ).toBeInTheDocument()

    expect(
      screen.getByPlaceholderText(
        'Ej: Solicitud aprobada por director de área.'
      )
    ).toBeInTheDocument()
  })

  test('regresa al step confirm al hacer click en Atrás', () => {
    renderModal()

    fireEvent.click(screen.getByText('Continuar'))

    fireEvent.click(screen.getByText('Atrás'))

    expect(
      screen.getByText('¿Confirmar acción?')
    ).toBeInTheDocument()
  })

  // ── Validación ────────────────────────────────────────────────────────────

  test('muestra error si la justificación está vacía', async () => {
    renderModal()

    fireEvent.click(screen.getByText('Continuar'))

    fireEvent.click(screen.getByText('Confirmar'))

    expect(
      screen.getByText('La justificación es obligatoria.')
    ).toBeInTheDocument()
  })

  test('limpia error al escribir una justificación válida', () => {
    renderModal()

    fireEvent.click(screen.getByText('Continuar'))

    fireEvent.click(screen.getByText('Confirmar'))

    const textarea = screen.getByPlaceholderText(
      'Ej: Solicitud aprobada por director de área.'
    )

    fireEvent.change(textarea, {
      target: { value: 'Justificación válida' },
    })

    expect(
      screen.queryByText('La justificación es obligatoria.')
    ).not.toBeInTheDocument()
  })

  // ── Confirmación ──────────────────────────────────────────────────────────

  test('llama onConfirm con la justificación', async () => {
    const handleConfirm = jest.fn()

    renderModal({
      onConfirm: handleConfirm,
    })

    fireEvent.click(screen.getByText('Continuar'))

    fireEvent.change(
      screen.getByPlaceholderText(
        'Ej: Solicitud aprobada por director de área.'
      ),
      {
        target: { value: 'Texto válido' },
      }
    )

    fireEvent.click(screen.getByText('Confirmar'))

    await waitFor(() => {
      expect(handleConfirm).toHaveBeenCalledWith('Texto válido')
    })
  })

  test('llama onClose después de confirmar', async () => {
    const onClose = jest.fn()

    renderModal({
      onClose,
    })

    fireEvent.click(screen.getByText('Continuar'))

    fireEvent.change(
      screen.getByPlaceholderText(
        'Ej: Solicitud aprobada por director de área.'
      ),
      {
        target: { value: 'Texto válido' },
      }
    )

    fireEvent.click(screen.getByText('Confirmar'))

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled()
    })
  })

  test('deshabilita botón cuando loading es true', () => {
    renderModal({
      loading: true,
    })

    fireEvent.click(screen.getByText('Continuar'))

    expect(
      screen.getByText('Confirmar')
    ).toBeDisabled()
  })

})