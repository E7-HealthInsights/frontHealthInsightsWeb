import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import DataTable, { type Column } from './DataTable'
import Button from '../Button/Button'

const meta = {
  title: 'Common/DataTable',
  component: DataTable,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof DataTable>

export default meta
type Story = StoryObj<typeof meta>

// ── Tipos de datos ────────────────────────────────────────────────────────────

type Usuario = {
  id:      number
  nombre:  string
  correo:  string
  rol:     string
  estatus: 'Activo' | 'Inactivo'
}

type Prevalencia = {
  id:        number
  estado:    string
  casos:     number
  porcentaje: string
  anio:      number
}

type Dataset = {
  id:        number
  nombre:    string
  fuente:    string
  registros: number
  cargado:   string
}

// ── Datos de prueba ───────────────────────────────────────────────────────────

const usuarios: Usuario[] = [
  { id: 1, nombre: 'Dr. García',    correo: 'garcia@healthinsights.mx',  rol: 'Director General',     estatus: 'Activo'   },
  { id: 2, nombre: 'Lic. Ramírez',  correo: 'ramirez@healthinsights.mx', rol: 'Director de Finanzas', estatus: 'Activo'   },
  { id: 3, nombre: 'Mtra. Torres',  correo: 'torres@healthinsights.mx',  rol: 'Dir. Mercadotecnia',   estatus: 'Activo'   },
  { id: 4, nombre: 'Ing. Morales',  correo: 'morales@healthinsights.mx', rol: 'Administrador',        estatus: 'Inactivo' },
]

const prevalencia: Prevalencia[] = [
  { id: 1, estado: 'Ciudad de México', casos: 1_240_000, porcentaje: '14.2 %', anio: 2025 },
  { id: 2, estado: 'Jalisco',          casos:   890_000, porcentaje: '11.8 %', anio: 2025 },
  { id: 3, estado: 'Nuevo León',       casos:   670_000, porcentaje: '12.5 %', anio: 2025 },
  { id: 4, estado: 'Veracruz',         casos:   540_000, porcentaje: '10.9 %', anio: 2025 },
  { id: 5, estado: 'Tabasco',          casos:   310_000, porcentaje: '16.1 %', anio: 2025 },
]

const datasets: Dataset[] = [
  { id: 1, nombre: 'Prevalencia nacional 2025', fuente: 'INEGI',            registros: 32,  cargado: '02 ene 2026' },
  { id: 2, nombre: 'Gasto IMSS por entidad',    fuente: 'IMSS',             registros: 32,  cargado: '15 ene 2026' },
  { id: 3, nombre: 'Proyección 2026-2030',      fuente: 'Secretaría Salud', registros: 240, cargado: '20 feb 2026' },
]

// ── Columnas ──────────────────────────────────────────────────────────────────

const colsUsuarios: Column<Usuario>[] = [
  { key: 'nombre',  header: 'Nombre' },
  { key: 'correo',  header: 'Correo' },
  { key: 'rol',     header: 'Rol' },
  {
    key: 'estatus',
    header: 'Estatus',
    width: 'w-28',
    render: row => (
      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold
        ${row.estatus === 'Activo'
          ? 'bg-green-100 text-[var(--color-hi-success)]'
          : 'bg-red-50   text-[var(--color-hi-danger)]'
        }`}>
        {row.estatus}
      </span>
    ),
  },
]

const colsPrevalencia: Column<Prevalencia>[] = [
  { key: 'estado',     header: 'Estado' },
  { key: 'casos',      header: 'Casos estimados', render: row => row.casos.toLocaleString('es-MX') },
  { key: 'porcentaje', header: 'Prevalencia', width: 'w-32' },
  { key: 'anio',       header: 'Año',         width: 'w-20' },
]

const colsDatasets: Column<Dataset>[] = [
  { key: 'nombre',    header: 'Dataset' },
  { key: 'fuente',    header: 'Fuente',     width: 'w-36' },
  { key: 'registros', header: 'Registros',  width: 'w-28' },
  { key: 'cargado',   header: 'Cargado el', width: 'w-36' },
  {
    key: 'acciones',
    header: '',
    width: 'w-20',
    render: () => (
      <Button variant="icon" ariaLabel="Eliminar dataset" onClick={fn()}>
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="2,4 14,4" />
          <path d="M5 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
          <rect x="3" y="4" width="10" height="10" rx="1" />
          <line x1="6" y1="7" x2="6" y2="11" />
          <line x1="10" y1="7" x2="10" y2="11" />
        </svg>
      </Button>
    ),
  },
]

// ── Stories ───────────────────────────────────────────────────────────────────

export const Usuarios: Story = {
  name: 'Tabla de usuarios',
  args: {
    columns: colsUsuarios as Column<{ id?: string | number }>[],
    data:    usuarios,
  },
}

export const Prevalencia: Story = {
  name: 'Prevalencia por estado',
  args: {
    columns: colsPrevalencia as Column<{ id?: string | number }>[],
    data:    prevalencia,
  },
}

export const Datasets: Story = {
  name: 'Datasets cargados (con acciones)',
  args: {
    columns: colsDatasets as Column<{ id?: string | number }>[],
    data:    datasets,
  },
}

export const SinDatos: Story = {
  name: 'Sin datos',
  args: {
    columns:   colsUsuarios as Column<{ id?: string | number }>[],
    data:      [],
    emptyText: 'Sin usuarios registrados.',
  },
}

export const SinDatosDefault: Story = {
  name: 'Sin datos (mensaje default)',
  args: {
    columns: colsPrevalencia as Column<{ id?: string | number }>[],
    data:    [],
  },
}
