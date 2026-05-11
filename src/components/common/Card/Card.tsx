import { useState, useRef, useEffect } from 'react'


type CardAction = {
  label:   string
  onClick: () => void
  danger?: boolean        // si es true, lo pinta en rojo, como eliminar
}

interface CardProps {
  title?:      string
  subtitle?:   string
  actions?:    CardAction[]     // opciones del menú, tres puntitos, op
  className?:  string           // clases extra para el contenedor
  children:    React.ReactNode
}



export default function Card({
  title,
  subtitle,
  actions = [],
  className = '',
  children,
}: CardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)  // Cierra el menú si se hace click fuera
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  const hasHeader = title || actions.length > 0

  return (
    <div
      className={`bg-[var(--color-hi-surface)] rounded-[var(--radius-lg)]
        border border-[var(--color-hi-border)] p-5 ${className}`}
    >
      
      {hasHeader && (
        <div className="flex items-start justify-between gap-3 mb-4">

          <div className="min-w-0 flex-1">
            {title && (
              <h3 className="text-sm font-semibold text-[var(--color-hi-text-main)] break-words">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="mt-0.5 text-xs text-[var(--color-hi-text-sub)] break-words">
                {subtitle}
              </p>
            )}
          </div>


          {actions.length > 0 && (
            <div className="relative flex-shrink-0" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(prev => !prev)}
                aria-label="Opciones"
                className="p-1 rounded-md text-[var(--color-hi-text-hint)]
                  hover:bg-[var(--color-hi-bg)] hover:text-[var(--color-hi-text-sub)]
                  transition-colors cursor-pointer"
              >
                
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <circle cx="8" cy="3"  r="1.4" />
                  <circle cx="8" cy="8"  r="1.4" />
                  <circle cx="8" cy="13" r="1.4" />
                </svg>
              </button>

              
              {menuOpen && (
                <div className="absolute right-0 top-7 z-20 min-w-36
                  bg-[var(--color-hi-surface)] border border-[var(--color-hi-border)]
                  rounded-[var(--radius-md)] shadow-lg py-1 overflow-hidden">
                  {actions.map((action, i) => (
                    <button
                      key={i}
                      onClick={() => { action.onClick(); setMenuOpen(false) }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer
                        ${action.danger
                          ? 'text-[var(--color-hi-danger)] hover:bg-red-50'
                          : 'text-[var(--color-hi-text-main)] hover:bg-[var(--color-hi-bg)]'
                        }`}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      
      {children}
    </div>
  )
}