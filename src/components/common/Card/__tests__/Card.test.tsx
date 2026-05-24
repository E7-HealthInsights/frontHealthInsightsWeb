// src/components/common/Card/__tests__/Card.test.tsx

import { render, screen, fireEvent } from '@testing-library/react'
import Card from '../Card'

describe('Card', () => {

  // ── Renderizado básico ────────────────────────────────────────────────────

  test('renderiza los children correctamente', () => {
    render(<Card><p>Contenido</p></Card>)
    expect(screen.getByText('Contenido')).toBeInTheDocument()
  })

  test('renderiza el título cuando se pasa la prop', () => {
    render(<Card title="Mi Card"><p>Contenido</p></Card>)
    expect(screen.getByText('Mi Card')).toBeInTheDocument()
  })

  test('renderiza el subtítulo cuando se pasa la prop', () => {
    render(<Card title="Título" subtitle="Subtítulo"><p>Contenido</p></Card>)
    expect(screen.getByText('Subtítulo')).toBeInTheDocument()
  })

  test('no renderiza el header si no hay título ni acciones', () => {
    render(<Card><p>Solo contenido</p></Card>)
    // El header no debería existir
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })

  test('aplica className extra al contenedor', () => {
    const { container } = render(
      <Card className="mt-4"><p>Contenido</p></Card>
    )
    expect(container.firstChild).toHaveClass('mt-4')
  })

  // ── Menú de acciones ⋮ ────────────────────────────────────────────────────

  test('no muestra el botón ⋮ si no hay acciones', () => {
    render(<Card title="Título"><p>Contenido</p></Card>)
    expect(screen.queryByLabelText('Opciones')).not.toBeInTheDocument()
  })

  test('muestra el botón ⋮ cuando hay acciones', () => {
    render(
      <Card actions={[{ label: 'Editar', onClick: jest.fn() }]}>
        <p>Contenido</p>
      </Card>
    )
    expect(screen.getByLabelText('Opciones')).toBeInTheDocument()
  })

  test('el dropdown no es visible antes de hacer clic en ⋮', () => {
    render(
      <Card actions={[{ label: 'Editar', onClick: jest.fn() }]}>
        <p>Contenido</p>
      </Card>
    )
    expect(screen.queryByText('Editar')).not.toBeInTheDocument()
  })

  test('abre el dropdown al hacer clic en ⋮', () => {
    render(
      <Card actions={[{ label: 'Editar', onClick: jest.fn() }]}>
        <p>Contenido</p>
      </Card>
    )
    fireEvent.click(screen.getByLabelText('Opciones'))
    expect(screen.getByText('Editar')).toBeInTheDocument()
  })

  test('llama a onClick de la acción al hacer clic en ella', () => {
    const handleEditar = jest.fn()
    render(
      <Card actions={[{ label: 'Editar', onClick: handleEditar }]}>
        <p>Contenido</p>
      </Card>
    )
    fireEvent.click(screen.getByLabelText('Opciones'))
    fireEvent.click(screen.getByText('Editar'))
    expect(handleEditar).toHaveBeenCalledTimes(1)
  })

  test('cierra el dropdown después de hacer clic en una acción', () => {
    render(
      <Card actions={[{ label: 'Editar', onClick: jest.fn() }]}>
        <p>Contenido</p>
      </Card>
    )
    fireEvent.click(screen.getByLabelText('Opciones'))
    fireEvent.click(screen.getByText('Editar'))
    expect(screen.queryByText('Editar')).not.toBeInTheDocument()
  })

  test('renderiza múltiples acciones en el dropdown', () => {
    render(
      <Card actions={[
        { label: 'Editar',   onClick: jest.fn() },
        { label: 'Eliminar', onClick: jest.fn(), danger: true },
      ]}>
        <p>Contenido</p>
      </Card>
    )
    fireEvent.click(screen.getByLabelText('Opciones'))
    expect(screen.getByText('Editar')).toBeInTheDocument()
    expect(screen.getByText('Eliminar')).toBeInTheDocument()
  })

  test('acción danger aplica color rojo', () => {
    render(
      <Card actions={[{ label: 'Eliminar', onClick: jest.fn(), danger: true }]}>
        <p>Contenido</p>
      </Card>
    )
    fireEvent.click(screen.getByLabelText('Opciones'))
    expect(screen.getByText('Eliminar').className).toContain('text-[var(--color-hi-danger)]')
  })

})