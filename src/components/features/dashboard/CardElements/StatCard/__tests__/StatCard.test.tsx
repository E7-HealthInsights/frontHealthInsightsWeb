import { render, screen } from '@testing-library/react'
import StatCard from '../StatCard'

describe('StatCard', () => {

  test('renderiza título', () => {
    render(
      <StatCard
        title="Usuarios"
        value={25}
      />
    )

    expect(
      screen.getByText('Usuarios')
    ).toBeInTheDocument()
  })

  test('renderiza subtitle', () => {
    render(
      <StatCard
        title="Usuarios"
        subtitle="Últimos 30 días"
        value={25}
      />
    )

    expect(
      screen.getByText('Últimos 30 días')
    ).toBeInTheDocument()
  })

  test('renderiza valor numérico', () => {
    render(
      <StatCard
        title="Usuarios"
        value={25}
      />
    )

    expect(
      screen.getByText('25')
    ).toBeInTheDocument()
  })

  test('renderiza porcentaje correctamente', () => {
    render(
      <StatCard
        title="Conversión"
        value={80}
        label="%"
      />
    )

    expect(
      screen.getByText('80%')
    ).toBeInTheDocument()
  })

  test('renderiza label normal', () => {
    render(
      <StatCard
        title="Usuarios"
        value={25}
        label="usuarios activos"
      />
    )

    expect(
      screen.getByText('usuarios activos')
    ).toBeInTheDocument()
  })

})