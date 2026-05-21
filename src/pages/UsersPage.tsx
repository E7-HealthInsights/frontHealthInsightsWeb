import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth }     from '../context/AuthContext'
import { logout }      from '../services/authService'
import { createUser, getUsers, updateUser, deleteUser } from '../services/userService'

import Navbar           from '../components/common/Navbar'
import Card             from '../components/common/Card'
import TabGroup         from '../components/common/TabGroup'
import SearchInput      from '../components/common/SearchInput/SearchInput'
import Button           from '../components/common/Button'
import UsersTable       from '../components/features/admins/UsersTable/UsersTable'
import CreateUserModal, { type NewUserPayload } from '../components/features/admins/CreateUserModal/CreateUserModal'
import EditUserModal        from '../components/features/admins/EditUserModal/EditUserModal'
import ConfirmActionModal  from '../components/features/admins/ConfirmActionModal/ConfirmActionModal'

import type { User } from '../types/User'
import type { UserResponse, UpdateUserPayload } from '../services/userService'

// ── Nav links ─────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { key: 'inicio',   label: 'Inicio',   path: '/admin'          },
  { key: 'usuarios', label: 'Usuarios', path: '/admin/usuarios' },
  { key: 'datos',    label: 'Datos',    path: '/admin/datos'    },
]

const TABS = [
  { id: 'activos',   label: 'Usuarios Activos'   },
  { id: 'inactivos', label: 'Usuarios Inactivos' },
]

// ── Mappers ───────────────────────────────────────────────────────────────────

const toUser = (u: UserResponse): User => ({
  id:       u.id,
  nombre:   u.name,
  apellido: u.lastName,
  correo:   u.email,
  rol:      u.role,
  estatus:  u.status ? 'Activo' : 'Inactivo',
})

// ── Component ─────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const { setUser } = useAuth()
  const navigate    = useNavigate()

  const [tab,         setTab]         = useState('activos')
  const [search,      setSearch]      = useState('')
  const [modalOpen,   setModalOpen]   = useState(false)
  const [editTarget,    setEditTarget]    = useState<User | null>(null)
  const [deleteTarget,  setDeleteTarget]  = useState<User | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [users,         setUsers]         = useState<User[]>([])

  useEffect(() => {
    getUsers()
      .then(list => setUsers(list.map(toUser)))
      .catch(err => console.error('Error al cargar usuarios', err))
  }, [])

  const handleLogout = async () => {
    await logout()
    setUser(null)
    navigate('/login', { replace: true })
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await deleteUser(deleteTarget.id)
      setUsers(prev => prev.filter(u => u.id !== deleteTarget.id))
      setDeleteTarget(null)
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleEdit = async (id: string, payload: UpdateUserPayload) => {
    const updated = await updateUser(id, payload)
    setUsers(prev => prev.map(u => u.id === id ? toUser(updated) : u))
  }

  const handleCreate = async (payload: NewUserPayload) => {
    const created = await createUser({
      name:     payload.nombre,
      lastName: payload.apellido,
      email:    payload.correo,
      password: payload.password,
      roleId:   payload.roleId,
    })
    setUsers(prev => [...prev, toUser(created)])
  }

  const filtered = users.filter(user => {
    const matchTab    = tab === 'activos' ? user.estatus === 'Activo' : user.estatus === 'Inactivo'
    const matchSearch = search === '' ||
      `${user.nombre} ${user.apellido}`.toLowerCase().includes(search.toLowerCase()) ||
      user.correo.toLowerCase().includes(search.toLowerCase())                        ||
      user.rol.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  return (
    <div className="min-h-screen bg-[var(--color-hi-bg)]">

      <Navbar
        links={NAV_LINKS}
        activePath={window.location.pathname}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Encabezado */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[var(--color-hi-navy)]">
            Lista de Usuarios
          </h1>
          <p className="text-sm text-[var(--color-hi-text-sub)] mt-0.5">
            Gestiona los usuarios de la plataforma
          </p>
        </div>

        {/* Tabla de usuarios */}
        <Card title="Usuarios">
          <div className="flex items-center gap-3 mb-4">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Buscar por nombre o correo..."
              className="flex-1"
            />

            <TabGroup
              tabs={TABS}
              activeTab={tab}
              onChange={setTab}
            />

            <Button variant="primary" size="md" onClick={() => setModalOpen(true)}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                aria-hidden="true">
                <line x1="8" y1="2" x2="8" y2="14" />
                <line x1="2" y1="8" x2="14" y2="8" />
              </svg>
              Agregar Usuario
            </Button>
          </div>

          <UsersTable
            data={filtered}
            onEdit={user => setEditTarget(user)}
            onDelete={user => setDeleteTarget(user)}
          />
        </Card>

      </main>

      <CreateUserModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreate}
      />

      <EditUserModal
        user={editTarget}
        isOpen={editTarget !== null}
        onClose={() => setEditTarget(null)}
        onEdit={handleEdit}
      />

      <ConfirmActionModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        accionLabel={deleteTarget ? `eliminar al usuario "${deleteTarget.nombre} ${deleteTarget.apellido}"` : ''}
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </div>
  )
}
