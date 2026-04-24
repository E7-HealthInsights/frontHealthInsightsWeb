export const ROUTES = {
  admin:            '/admin',
  directorGeneral:  '/director/general',
  directorFinanzas: '/director/finanzas',
  directorMarketing:'/director/marketing',
} as const

const ROLE_DEFAULT_ROUTE: Record<string, string> = {
  'Admin':         ROUTES.admin,
  'Administrador': ROUTES.admin,
  'D.G.':          ROUTES.directorGeneral,
  'D.F.':          ROUTES.directorFinanzas,
  'D.M.':          ROUTES.directorMarketing,
}

const FALLBACK_ROUTE = '/login'

export function getDefaultRouteForRole(role: string | undefined | null): string {
  if (!role) return FALLBACK_ROUTE
  return ROLE_DEFAULT_ROUTE[role] ?? FALLBACK_ROUTE
}
