// src/components/common/Modal/__tests__/Modal.test.tsx

import { render, screen, fireEvent } from '@testing-library/react'
import Modal from '../Modal'

// Helper para renderizar con props mínimas
const renderModal = (overrides = {}) => {
  const props = {
    isOpen:  true,
    onClose: jest.fn(),
    title:   'Título de prueba',
    ...overrides,
  }
  render(<Modal {...props}><p>Contenido del modal</p></Modal>)
  return props
}

describe('Modal', () => {

  // ── Renderizado ───────────────────────────────────────────────────────────

  test('no renderiza nada cuando isOpen es false', () => {
    renderModal({ isOpen: false })
    expect(screen.queryByText('Título de prueba')).not.toBeInTheDocument()
    expect(screen.queryByText('Contenido del modal')).not.toBeInTheDocument()
  })

  test('renderiza el título cuando isOpen es true', () => {
    renderModal()
    expect(screen.getByText('Título de prueba')).toBeInTheDocument()
  })

  test('renderiza el contenido children', () => {
    renderModal()
    expect(screen.getByText('Contenido del modal')).toBeInTheDocument()
  })

  test('renderiza el subtítulo cuando se pasa la prop', () => {
    renderModal({ subtitle: 'Subtítulo opcional' })
    expect(screen.getByText('Subtítulo opcional')).toBeInTheDocument()
  })

  test('no renderiza subtítulo si no se pasa la prop', () => {
    renderModal()
    expect(screen.queryByText('Subtítulo opcional')).not.toBeInTheDocument()
  })

  test('renderiza el botón de cerrar (X)', () => {
    renderModal()
    expect(screen.getByLabelText('Cerrar modal')).toBeInTheDocument()
  })

  // ── Cierre ────────────────────────────────────────────────────────────────

  test('llama a onClose al hacer clic en el botón X', () => {
    const { onClose } = renderModal()
    fireEvent.click(screen.getByLabelText('Cerrar modal'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  test('llama a onClose al hacer clic en el backdrop', () => {
    const { onClose } = renderModal()
    // El backdrop es el div externo con el fondo oscuro
    const backdrop = screen.getByText('Título de prueba').closest('[class*="fixed"]')
    if (backdrop) fireEvent.click(backdrop)
    expect(onClose).toHaveBeenCalled()
  })

  test('llama a onClose al presionar Escape', () => {
    const { onClose } = renderModal()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  test('no llama a onClose al presionar otra tecla', () => {
    const { onClose } = renderModal()
    fireEvent.keyDown(document, { key: 'Enter' })
    expect(onClose).not.toHaveBeenCalled()
  })

  test('no cierra al hacer clic dentro del panel del modal', () => {
    const { onClose } = renderModal()
    fireEvent.click(screen.getByText('Contenido del modal'))
    expect(onClose).not.toHaveBeenCalled()
  })

  // ── Tamaños ───────────────────────────────────────────────────────────────

  test('tamaño sm aplica max-w-sm', () => {
    renderModal({ size: 'sm' })
    const panel = screen.getByTestId('modal-panel')
    expect(panel?.className).toContain('max-w-sm')
  })

  test('tamaño lg aplica max-w-2xl', () => {
    renderModal({ size: 'lg' })
    const panel = screen.getByTestId('modal-panel')
    expect(panel?.className).toContain('max-w-2xl')
  })

  test('tamaño por defecto es md (max-w-lg)', () => {
    renderModal()
    const panel = screen.getByTestId('modal-panel')
    expect(panel?.className).toContain('max-w-lg')
  })

})