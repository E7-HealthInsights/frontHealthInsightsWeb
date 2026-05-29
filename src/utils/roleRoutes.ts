export const ROUTES = {
  admin:            '/admin',
  directorGeneral:  '/director/general',
  directorFinanzas: '/director/finanzas',
  directorMarketing:'/director/marketing',
} as const

const ROLE_DEFAULT_ROUTE: Record<string, string> = {
  'Admin':                  ROUTES.admin,
  'Administrador':          ROUTES.admin,
  'ADMIN':                  ROUTES.admin,
  'D.G.':                   ROUTES.directorGeneral,
  'DIRECTOR_GENERAL':       ROUTES.directorGeneral,
  'D.F.':                   ROUTES.directorFinanzas,
  'DIRECTOR_FINANZAS':      ROUTES.directorFinanzas,
  'D.M.':                   ROUTES.directorMarketing,
  'DIRECTOR_MERCADOTECNIA': ROUTES.directorMarketing,
}

const FALLBACK_ROUTE = '/login'

export function getDefaultRouteForRole(role: string | undefined | null): string {
  if (!role) return FALLBACK_ROUTE
  return ROLE_DEFAULT_ROUTE[role] ?? FALLBACK_ROUTE
}

const ADMIN_ROLES = new Set(['Admin', 'Administrador', 'ADMIN'])

export function isAdminRole(role: string | undefined | null): boolean {
  return !!role && ADMIN_ROLES.has(role)
}
