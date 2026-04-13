import { useEffect } from 'react'

type ModalSize = 'sm' | 'md' | 'lg'

interface ModalProps {
  isOpen:    boolean
  onClose:   () => void
  title:     string
  subtitle?: string
  size?:     ModalSize        // default: 'md'
  children:  React.ReactNode
}

//  Size map para clases de Tailwind. Se podría hacer con variantes de Stitches o lo que sea, pero así es más directo y fácil de entender.

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}


export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  size = 'md',
  children,
}: ModalProps) {

  // Cierra con Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  // Bloquea scroll del body mientras está abierto
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(27, 58, 107, 0.45)' }}
      onClick={onClose}                          // click fuera = cierra
    >
      
      <div
        className={`relative w-full ${sizeClasses[size]} bg-[var(--color-hi-surface)]
          rounded-[var(--radius-lg)] p-6 shadow-xl`}
        onClick={e => e.stopPropagation()}       // evita que el click burbujee
      >
        
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-xl font-semibold text-[var(--color-hi-navy)]">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-0.5 text-sm text-[var(--color-hi-text-sub)]">
                {subtitle}
              </p>
            )}
          </div>

          
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="ml-4 p-1.5 rounded-md text-[var(--color-hi-text-sub)]
              hover:bg-[var(--color-hi-bg)] hover:text-[var(--color-hi-text-main)]
              transition-colors cursor-pointer"
          >
            
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="4" y1="4" x2="14" y2="14" />
              <line x1="14" y1="4" x2="4"  y2="14" />
            </svg>
          </button>
        </div>

        
        <div>{children}</div>
      </div>
    </div>
  )
}