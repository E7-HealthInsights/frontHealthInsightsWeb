import DataTable, { type Column } from '../../../common/DataTable'
import ActionBadge from '../Badges/ActionBadge/ActionBadge'


export type ActivityRow = {
  id:        string
  admin:     string
  accion:    string
  detalle:   string
  timestamp: string
}

interface ActivityTableProps {
  data: ActivityRow[]
  wrap?: boolean
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


export default function ActivityTable({ data, wrap = false }: ActivityTableProps) {
  const columns: Column<ActivityRow>[] = [
    {
      key:    'accion',
      header: 'Acción',
      width:  'w-[30%]',
      render: row => <ActionBadge action={row.accion} />,
    },
    {
      key:    'timestamp',
      header: 'Fecha y hora',
      width:  'w-[18%]',
      render: row => <TimestampCell timestamp={row.timestamp} />,
    },
    {
      key:    'admin',
      header: 'Admin',
      width:  'w-[17%]',
      render: row => <span className="whitespace-nowrap">{row.admin}</span>,
    },
    {
      key:    'detalle',
      header: 'Justificación',
      width:  'w-[35%]',
      render: row => (
        <span
          className={`block text-sm text-[var(--color-hi-text-sub)] italic ${wrap ? 'break-words' : 'truncate'}`}
          title={row.detalle}
        >
          "{row.detalle}"
        </span>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={data}
      emptyText="No hay actividad registrada aún."
      fixed
    />
  )
}
