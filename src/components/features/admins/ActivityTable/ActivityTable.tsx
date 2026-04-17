

// ─── Types ────────────────────────────────────────────────────────────────────

import DataTable, { type Column } from "../../../common/DataTable"
import StatusBadge from "../Badges/StatusBadge/StatusBadge"

export type ActivityRow = {
  id:              number
  nombre:          string
  correo:          string
  estatus:         string   
  lastConnection:  string       // fecha formateada ej: '04/03/2026'
  tiempoConectado: string       // ej: '2h 15m' — calculado en backend desde sessions
}

interface ActivityTableProps {
  data: ActivityRow[]
}

// ─── Celdas ───────────────────────────────────────────────────────────────────

const FechaCell = ({ fecha }: { fecha: string }) => (
  <span className="flex items-center gap-1.5 text-[var(--color-hi-text-sub)] text-sm">
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="6.5" cy="6.5" r="5.5"/>
      <path d="M6.5 3.5v3l2 1.5"/>
    </svg>
    {fecha}
  </span>
)

const TiempoCell = ({ tiempo }: { tiempo: string }) => {
  const horas = parseFloat(tiempo)
  const colorClass = horas >= 2
    ? 'text-[var(--color-hi-success)]'
    : horas >= 1
      ? 'text-[var(--color-hi-text-main)]'
      : 'text-[var(--color-hi-text-hint)]'

  return (
    <span className={`font-medium text-sm ${colorClass}`}>
      {tiempo}
    </span>
  )
}

// ─── Columnas ─────────────────────────────────────────────────────────────────

const columns: Column<ActivityRow>[] = [
  { key: 'nombre', header: 'Nombre' },
  { key: 'correo', header: 'Correo' },
  {
    key:    'lastConnection',
    header: 'Última Conexión',
    width:  'w-40',
    render: row => <FechaCell fecha={row.lastConnection} />,
  },
  {
    key:    'tiempoConectado',
    header: 'Tiempo Conectado',
    width:  'w-36',
    render: row => <TiempoCell tiempo={row.tiempoConectado} />,
  },
]

// ─── Component ───────────────────────────────────────────────────────────────

export default function ActivityTable({ data }: ActivityTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      emptyText="No hay actividad reciente registrada."
    />
  )
}