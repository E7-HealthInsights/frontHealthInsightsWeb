import type { ActivityAction } from '../../../../types/ActivityActions'
import DataTable, { type Column } from '../../../common/DataTable'
import ActionBadge from '../Badges/ActionBadge/ActionBadge'


export type ActivityRow = {
  id:        number
  admin:     string          // nombre del admin que ejecutó la acción
  accion:    ActivityAction
  detalle:   string          // justificación ingresada por el admin
  timestamp: string         
}

interface ActivityTableProps {
  data: ActivityRow[]
}


const TimestampCell = ({ timestamp }: { timestamp: string }) => (
  <span className="flex items-center gap-1.5 text-[var(--color-hi-text-sub)] text-sm whitespace-nowrap">
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="6.5" cy="6.5" r="5.5"/>
      <path d="M6.5 3.5v3l2 1.5"/>
    </svg>
    {timestamp}
  </span>
)

const DetalleCell = ({ detalle }: { detalle: string }) => (
  <span className="text-sm text-[var(--color-hi-text-sub)] italic">
    "{detalle}"
  </span>
)

const columns: Column<ActivityRow>[] = [
  {
    key:    'timestamp',
    header: 'Fecha y hora',
    width:  'w-40',
    render: row => <TimestampCell timestamp={row.timestamp} />,
  },
  {
    key:    'admin',
    header: 'Admin',
    width:  'w-36',
  },
  {
    key:    'accion',
    header: 'Acción',
    width:  'w-44',
    render: row => <ActionBadge action={row.accion} />,
  },
  {
    key:    'detalle',
    header: 'Justificación',
    render: row => <DetalleCell detalle={row.detalle} />,
  },
]



export default function ActivityTable({ data }: ActivityTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      emptyText="No hay actividad registrada aún."
    />
  )
}