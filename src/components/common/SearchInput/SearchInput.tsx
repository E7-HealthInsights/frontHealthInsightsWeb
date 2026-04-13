import { useRef } from 'react'

type SearchInputSize = 'sm' | 'md' | 'lg'

interface SearchInputProps {
  value:        string
  onChange:     (value: string) => void
  placeholder?: string
  disabled?:    boolean
  size?:        SearchInputSize
  className?:   string
  onClear?:     () => void   // override del clear; si no se pasa, usa onChange('')
}

// Tamaños: padding, texto e iconos varían de forma coherente entre sí
const sizeConfig: Record<SearchInputSize, {
  input:    string
  icon:     string
  iconPos:  string
  clearPos: string
}> = {
  sm: {
    input:    'pl-7 pr-7 py-1.5 text-xs',
    icon:     'w-3.5 h-3.5',
    iconPos:  'left-2 top-1/2 -translate-y-1/2',
    clearPos: 'right-1.5 top-1/2 -translate-y-1/2',
  },
  md: {
    input:    'pl-9 pr-8 py-2 text-sm',
    icon:     'w-4 h-4',
    iconPos:  'left-2.5 top-1/2 -translate-y-1/2',
    clearPos: 'right-2 top-1/2 -translate-y-1/2',
  },
  lg: {
    input:    'pl-11 pr-10 py-2.5 text-base',
    icon:     'w-5 h-5',
    iconPos:  'left-3 top-1/2 -translate-y-1/2',
    clearPos: 'right-2.5 top-1/2 -translate-y-1/2',
  },
}


export default function SearchInput({
  value,
  onChange,
  placeholder = 'Buscar…',
  disabled    = false,
  size        = 'md',
  className   = '',
  onClear,
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const cfg = sizeConfig[size]

  const handleClear = () => {
    onClear ? onClear() : onChange('')
    inputRef.current?.focus()
  }

  return (
    <div className={`relative inline-flex w-full ${className}`}>

      {/* Icono de lupa — decorativo, no interactivo */}
      <span
        className={`absolute ${cfg.iconPos} pointer-events-none
          text-[var(--color-hi-text-hint)]`}
        aria-hidden="true"
      >
        <svg
          className={cfg.icon}
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="9" cy="9" r="6" />
          <line x1="13.5" y1="13.5" x2="18" y2="18" />
        </svg>
      </span>

      {/* Campo de texto */}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        aria-label={placeholder}
        className={`w-full rounded-[var(--radius-md)]
          border border-[var(--color-hi-border)]
          bg-[var(--color-hi-surface)]
          ${cfg.input}
          text-[var(--color-hi-text-main)]
          placeholder:text-[var(--color-hi-text-hint)]
          focus:outline-none
          focus:border-[var(--color-hi-border-focus)]
          focus:ring-2 focus:ring-[var(--color-hi-primary)]/20
          transition-colors
          disabled:bg-[var(--color-hi-bg)]
          disabled:text-[var(--color-hi-text-hint)]
          disabled:cursor-not-allowed`}
      />

      {/* Botón de limpiar — solo cuando hay texto y el input no está deshabilitado */}
      {value && !disabled && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Limpiar búsqueda"
          className={`absolute ${cfg.clearPos}
            p-0.5 rounded-md
            text-[var(--color-hi-text-hint)]
            hover:bg-[var(--color-hi-bg)]
            hover:text-[var(--color-hi-text-sub)]
            transition-colors cursor-pointer`}
        >
          <svg
            className={cfg.icon}
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="4" y1="4" x2="12" y2="12" />
            <line x1="12" y1="4" x2="4"  y2="12" />
          </svg>
        </button>
      )}

    </div>
  )
}
