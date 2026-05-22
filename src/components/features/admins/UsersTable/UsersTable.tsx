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

// ─── Columnas ─────────────────────────────────────────────────────────────────

const buildColumns = (
  onEdit?:   (u: User) => void,
  onDelete?: (u: User) => void,
): Column<User>[] => [
  { key: 'nombreCompleto', header: 'Nombre Completo', render: row => `${row.nombre} ${row.apellido}` },
  { key: 'correo', header: 'Correo' },
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
        <EditActionButton onClick={() => onEdit?.(row)} />
        {row.estatus === 'Activo' && (
          <DeleteActionButton onClick={() => onDelete?.(row)} />
        )}
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