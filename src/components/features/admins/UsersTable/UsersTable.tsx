import type { User } from "../../../../types/User"
import DataTable, { type Column } from "../../../common/DataTable"
import DeleteActionButton from "../../actionButtons/DeleteActionButton/DeleteActionButton"
import EditActionButton from "../../actionButtons/EditActionButton/EditActionButton"
import RolBadge from "../Badges/RolBadge/RolBadge"
import StatusBadge from "../Badges/StatusBadge/StatusBadge"



interface UsersTableProps {
  data:        User[]
  onEdit?:     (user: User) => void
  onDelete?:   (user: User) => void
}

// Contraseña siempre como puntos — nunca se muestra el valor real
const PasswordCell = () => (
  <span className="tracking-widest text-[var(--color-hi-text-hint)] select-none">
    ••••••••
  </span>
)


// ─── Columnas ─────────────────────────────────────────────────────────────────

const buildColumns = (
  onEdit?:   (u: User) => void,
  onDelete?: (u: User) => void,
): Column<User>[] => [
  { key: 'id',     header: 'ID',     width: 'w-24' },
  { key: 'nombreCompleto', header: 'Nombre Completo', render: row => `${row.nombre} ${row.apellido}` },
  { key: 'correo', header: 'Correo' },
  {
    key:    'password',
    header: 'Password',
    width:  'w-28',
    render: () => <PasswordCell />,
  },
  {
    key: 'rol',
    header: 'Rol',
    width: 'w-20',
    render: row => <RolBadge rol={row.rol} />,
  },
  {
    key: 'estatus',
    header: 'Estatus',
    width: 'w-24',
    render: row => <StatusBadge status={row.estatus} />,
  },
  {
    key: 'acciones',
    header: 'Acciones',
    width: 'w-24',
    render: row => (
      <div className="flex gap-1">
        <EditActionButton   onClick={() => onEdit?.(row)}   />
        <DeleteActionButton onClick={() => onDelete?.(row)} />
      </div>
    ),
  },
]

export default function UsersTable({ data, onEdit, onDelete }: UsersTableProps) {
  return (
    <DataTable
      columns={buildColumns(onEdit, onDelete)}
      data={data}
      emptyText="No se encontraron usuarios."
    />
  )
}