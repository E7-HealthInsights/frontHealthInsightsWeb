import { useState, useRef, useEffect } from 'react'

interface UserMenuProps {
  onLogout:   () => void
  className?: string
}

export default function UserMenu({ onLogout, className = '' }: UserMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  return (
    <div className={`relative ${className}`} ref={menuRef}>

      {/* Botón circular */}
      <button
        onClick={() => setMenuOpen(prev => !prev)}
        aria-label="Menú de usuario"
        className="w-9 h-9 rounded-full flex items-center justify-center
          bg-[var(--color-hi-primary-soft)] text-[var(--color-hi-primary)]
          hover:bg-[var(--color-hi-primary)] hover:text-white
          transition-colors cursor-pointer"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
      </button>

      {/* Dropdown */}
      {menuOpen && (
        <div className="absolute right-0 top-11 z-20 min-w-44
          bg-[var(--color-hi-surface)] border border-[var(--color-hi-border)]
          rounded-[var(--radius-md)] shadow-lg py-1 overflow-hidden">
          <button
            onClick={() => { onLogout(); setMenuOpen(false) }}
            className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm
              text-[var(--color-hi-danger)] hover:bg-red-50 transition-colors cursor-pointer"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Cerrar Sesión
          </button>
        </div>
      )}

    </div>
  )
}
