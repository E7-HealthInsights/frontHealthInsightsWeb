export interface Tab {
  id:       string
  label:    string
  icon?:    React.ReactNode   // ícono SVG opcional antes del label
}

interface TabGroupProps {
  tabs:        Tab[]
  activeTab:   string                    // id del tab activo (controlled)
  onChange:    (tabId: string) => void   // callback al cambiar de tab
  className?:  string
}

/**
 * TabGroup — barra de pestañas genérica.
 * Cambia contenido dentro de la misma página, NO navega entre rutas.
 *
 * Se repite en:
 *   - Actividad Reciente: "Usuarios Activos | Reportes | Simulaciones"
 *   - Usuarios: "Usuarios Activos | Usuarios Inactivos"
 *
 * @example
 * const [tab, setTab] = useState('activos')
 *
 * <TabGroup
 *   tabs={[
 *     { id: 'activos',   label: 'Usuarios Activos' },
 *     { id: 'inactivos', label: 'Usuarios Inactivos' },
 *   ]}
 *   activeTab={tab}
 *   onChange={setTab}
 * />
 */
export default function TabGroup({
  tabs,
  activeTab,
  onChange,
  className = '',
}: TabGroupProps) {
  return (
    <div
      role="tablist"
      className={`
        inline-flex items-center
        rounded-[var(--radius-md)]
        border border-[var(--color-hi-border)]
        bg-[var(--color-hi-bg)]
        p-0.5
        gap-0.5
        ${className}
      `}
    >
      {tabs.map(tab => {
        const isActive = tab.id === activeTab

        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`
              inline-flex items-center gap-1.5
              px-3.5 py-1.5
              text-sm font-medium
              rounded-[var(--radius-sm)]
              transition-all duration-150
              cursor-pointer
              ${isActive
                ? 'bg-[var(--color-hi-surface)] text-[var(--color-hi-primary)] shadow-sm'
                : 'text-[var(--color-hi-text-sub)] hover:text-[var(--color-hi-text-main)] hover:bg-[var(--color-hi-surface)]/60'
              }
            `}
          >
            {tab.icon && (
              <span aria-hidden="true" className="shrink-0">
                {tab.icon}
              </span>
            )}
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}