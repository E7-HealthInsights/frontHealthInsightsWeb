import { useCallback, useEffect, useMemo, useState } from 'react'
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
import { debounce } from 'lodash'
import Pagination from '../components/common/Pagination/Pagination'

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
  rol:      typeof u.role === 'string' ? u.role : (u.role?.name ?? ''),
  estatus:  u.status ? 'Activo' : 'Inactivo',
})

// ── Component ─────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const { setUser } = useAuth()
  const navigate    = useNavigate()

  const PAGE_SIZE = 10

  const [tab,         setTab]         = useState('activos')
  const [search,      setSearch]      = useState('')
  const [page,         setPage]         = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [loading,      setLoading]      = useState(false)
  const [modalOpen,   setModalOpen]   = useState(false)
  const [editTarget,    setEditTarget]    = useState<User | null>(null)
  const [deleteTarget,  setDeleteTarget]  = useState<User | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [users,         setUsers]         = useState<User[]>([])

  const isActivos = tab === 'activos'

  const fetchUsers = useCallback((p: number, s: string, activos: boolean) => {
    setLoading(true)
    getUsers(p, PAGE_SIZE, s, activos)
      .then(res => {
        setUsers(res.data.map(toUser))
        setTotalPaginas(res.totalPaginas)
      })
      .catch(err => console.error('Error al cargar usuarios', err))
      .finally(() => setLoading(false))
  }, [])

  // Carga cuando cambia página o tab
  useEffect(() => {
    fetchUsers(page, search, isActivos)
  }, [page, tab])

  // Debounce para búsqueda
  const debouncedSearch = useMemo(
    () => debounce((value: string, activos: boolean) => {
      setPage(1)
      fetchUsers(1, value, activos)
    }, 400),
    [fetchUsers]
  )

  useEffect(() => () => debouncedSearch.cancel(), [debouncedSearch])

  const handleSearch = (value: string) => {
    setSearch(value)
    debouncedSearch(value, isActivos)
  }

  const handleTabChange = (newTab: string) => {
    setTab(newTab)
    setSearch('')
    setPage(1)
    // el useEffect de [page, tab] se encarga del fetch
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }


  const handleLogout = async () => {
    await logout()
    setUser(null)
    navigate('/login', { replace: true })
  }

  const handleDelete = async (justification: string) => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await deleteUser(deleteTarget.id, justification)
      setUsers(prev => prev.map(u => u.id === deleteTarget.id ? { ...u, estatus: 'Inactivo' as const } : u))
      setDeleteTarget(null)
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleEdit = async (id: string, payload: UpdateUserPayload) => {
    const updated = await updateUser(id, payload)
    setUsers(prev => prev.map(u => u.id === id ? toUser(updated) : u))
    fetchUsers(page, search, isActivos) // recarga para reflejar cambios de estatus o rol
  }

  const handleCreate = async (payload: NewUserPayload) => {
    const created = await createUser({
      name:          payload.nombre,
      lastName:      payload.apellido,
      email:         payload.correo,
      password:      payload.password,
      roleId:        payload.roleId,
      justification: payload.justification,
    })
    setUsers(prev => [...prev, toUser(created)])
    setPage(1)
    fetchUsers(1, search, isActivos)
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
              onChange={handleSearch}
              placeholder="Buscar por nombre o correo..."
              className="flex-1"
            />

            <TabGroup
              tabs={TABS}
              activeTab={tab}
              onChange={handleTabChange}
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

          {loading
            ? <p className="text-sm text-[var(--color-hi-text-sub)] py-8 text-center">
                Cargando usuarios…
              </p>
            : <UsersTable
                data={users}
                onEdit={user => setEditTarget(user)}
                onDelete={user => setDeleteTarget(user)}
              />
          }

          <div className="mt-6">
            <Pagination
              currentPage={page}
              totalPages={totalPaginas}
              onChange={handlePageChange}
            />
          </div>
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
