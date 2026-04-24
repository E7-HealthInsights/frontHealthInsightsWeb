import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth }     from '../context/AuthContext'
import { logout }      from '../services/authService'
import { createUser }  from '../services/userService'

import Navbar           from '../components/common/Navbar'
import Card             from '../components/common/Card'
import TabGroup         from '../components/common/TabGroup'
import SearchInput      from '../components/common/SearchInput/SearchInput'
import Button           from '../components/common/Button'
import UsersTable       from '../components/features/admins/UsersTable/UsersTable'
import CreateUserModal, { type NewUserPayload } from '../components/features/admins/CreateUserModal/CreateUserModal'

import type { User } from '../types/User'

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

// ── Datos mock ────────────────────────────────────────────────────────────────

const MOCK_USERS: User[] = [
  { id: '1', nombre: 'María',  apellido: 'López',    correo: 'maria.lopez@hi.mx',   fecha: '2026-01-10', tiempo: '3 meses', rol: 'D.G.',  estatus: 'Activo'   },
  { id: '2', nombre: 'Carlos', apellido: 'Ruiz',     correo: 'carlos.ruiz@hi.mx',   fecha: '2026-02-14', tiempo: '2 meses', rol: 'D.F.',  estatus: 'Activo'   },
  { id: '3', nombre: 'Ana',    apellido: 'Martínez', correo: 'ana.martinez@hi.mx',  fecha: '2025-11-05', tiempo: '5 meses', rol: 'D.M.',  estatus: 'Activo'   },
  { id: '4', nombre: 'Pedro',  apellido: 'Sánchez',  correo: 'pedro.sanchez@hi.mx', fecha: '2025-09-20', tiempo: '7 meses', rol: 'D.F.',  estatus: 'Inactivo' },
  { id: '5', nombre: 'Lucía',  apellido: 'Flores',   correo: 'lucia.flores@hi.mx',  fecha: '2026-03-01', tiempo: '1 mes',   rol: 'Admin', estatus: 'Activo'   },
  { id: '6', nombre: 'Jorge',  apellido: 'Mendoza',  correo: 'jorge.mendoza@hi.mx', fecha: '2025-08-15', tiempo: '8 meses', rol: 'D.G.',  estatus: 'Inactivo' },
]

// ── Component ─────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const { setUser } = useAuth()
  const navigate    = useNavigate()

  const [tab,         setTab]         = useState('activos')
  const [search,      setSearch]      = useState('')
  const [modalOpen,   setModalOpen]   = useState(false)
  const [users,       setUsers]       = useState<User[]>(MOCK_USERS)

  const handleLogout = async () => {
    await logout()
    setUser(null)
    navigate('/login', { replace: true })
  }

  const handleCreate = async (payload: NewUserPayload) => {
    const created = await createUser({
      name:     payload.nombre,
      lastName: payload.apellido,
      email:    payload.correo,
      password: payload.password,
      roleId:   payload.roleId,
    })
    const newUser: User = {
      id:       created.id,
      nombre:   created.name,
      apellido: created.lastName,
      correo:   created.email,
      rol:      payload.rol,
      estatus:  payload.estatus,
      fecha:    new Date().toISOString().slice(0, 10),
      tiempo:   'Recién creado',
    }
    setUsers(prev => [...prev, newUser])
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
            onEdit={user => console.log('Editar', user)}
            onDelete={user => console.log('Eliminar', user)}
          />
        </Card>

      </main>

      <CreateUserModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  )
}
