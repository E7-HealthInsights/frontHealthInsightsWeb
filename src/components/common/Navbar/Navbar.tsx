import UserMenu from '../UserMenu'

interface NavLink {
  key:   string
  label: string
  path:  string
}

interface NavbarProps {
  links:      NavLink[]
  activePath: string
  onLogout:   () => void
}

export default function Navbar({ links, activePath, onLogout }: NavbarProps) {
  return (
    <header className="w-full bg-[var(--color-hi-surface)] border-b border-[var(--color-hi-border)] px-6 h-16">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between gap-4">

        {/* Logo */}
        <a
          href="/"
          className="flex items-center gap-2 shrink-0 no-underline"
          aria-label="Health Insights — Inicio"
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <rect width="28" height="28" rx="8" fill="var(--color-hi-primary)" />
            <path
              d="M8 14h3l2-5 3 10 2-7 2 2h2"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-base font-semibold text-[var(--color-hi-navy)] leading-none">
            Health<span className="text-[var(--color-hi-primary)]">Insights</span>
          </span>
        </a>

        {/* NavLinks */}
        <nav aria-label="Navegación principal">
          <ul className="flex items-center gap-1 list-none m-0 p-0">
            {links.map(({ key, label, path }) => {
              const isActive = activePath === path
              return (
                <li key={key}>
                  <a
                    href={path}
                    aria-current={isActive ? 'page' : undefined}
                    className={`
                      px-4 py-2 rounded-[var(--radius-md)] text-sm font-medium
                      transition-colors no-underline
                      ${isActive
                        ? 'bg-[var(--color-hi-primary-soft)] text-[var(--color-hi-primary)]'
                        : 'text-[var(--color-hi-text-sub)] hover:bg-[var(--color-hi-bg)] hover:text-[var(--color-hi-text-main)]'
                      }
                    `}
                  >
                    {label}
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* UserMenu */}
        <UserMenu onLogout={onLogout} />

      </div>
    </header>
  )
}
