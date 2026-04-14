import { useState, useRef, useEffect, type ReactNode } from 'react'

interface DropdownOption {
  value: string
  label: string
}

interface DropdownProps {
  label?:       string
  placeholder?: string
  options:      DropdownOption[]
  value:        string
  onChange:     (value: string) => void
  error?:       string
  disabled?:    boolean
  className?:   string
}

export default function Dropdown({
  label,
  placeholder = 'Seleccionar…',
  options,
  value,
  onChange,
  error       = '',
  disabled    = false,
  className   = '',
}: DropdownProps) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Click-outside-to-close — mismo patrón que UserMenu y Card
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const selectedOption = options.find(o => o.value === value)
  const displayText = selectedOption?.label ?? placeholder
  const hasSelection = selectedOption !== undefined
  const hasError = error !== ''

  const handleSelect = (option: DropdownOption) => {
    onChange(option.value)
    setOpen(false)
  }

  const borderColor = hasError
    ? 'border-[var(--color-hi-danger)]'
    : open
      ? 'border-[var(--color-hi-border-focus)]'
      : 'border-[var(--color-hi-border)]'

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-sm font-semibold text-[var(--color-hi-text-sub)]">
          {label}
        </label>
      )}

      <div ref={wrapperRef} className="relative">
        {/* Trigger */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => { if (!disabled) setOpen(prev => !prev) }}
          aria-haspopup="listbox"
          aria-expanded={open}
          className={`w-full flex items-center justify-between gap-2
            rounded-[var(--radius-md)]
            ${borderColor}
            border
            bg-[var(--color-hi-surface)]
            px-3 py-2 text-sm
            ${hasSelection ? 'text-[var(--color-hi-text-main)]' : 'text-[var(--color-hi-text-hint)]'}
            focus:outline-none
            focus:ring-2 focus:ring-[var(--color-hi-primary)]/20
            transition-colors cursor-pointer
            disabled:bg-[var(--color-hi-bg)]
            disabled:text-[var(--color-hi-text-hint)]
            disabled:cursor-not-allowed`}
        >
          <span className="truncate">{displayText}</span>

          {/* Chevron */}
          <svg
            className={`w-4 h-4 shrink-0 text-[var(--color-hi-text-hint)] transition-transform ${open ? 'rotate-180' : ''}`}
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="4 6 8 10 12 6" />
          </svg>
        </button>

        {/* Options panel */}
        {open && (
          <ul
            role="listbox"
            className="absolute z-20 left-0 right-0 mt-1
              rounded-[var(--radius-md)]
              border border-[var(--color-hi-border)]
              bg-[var(--color-hi-surface)]
              shadow-lg max-h-60 overflow-y-auto py-1"
          >
            {options.map(option => {
              const isSelected = option.value === value
              return (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(option)}
                  className={`px-3 py-2 text-sm cursor-pointer transition-colors
                    ${isSelected
                      ? 'bg-[var(--color-hi-primary-soft)] text-[var(--color-hi-primary-dark)] font-semibold'
                      : 'text-[var(--color-hi-text-main)] hover:bg-[var(--color-hi-bg)]'
                    }`}
                >
                  {option.label}
                </li>
              )
            })}

            {options.length === 0 && (
              <li className="px-3 py-2 text-sm text-[var(--color-hi-text-hint)]">
                Sin opciones disponibles
              </li>
            )}
          </ul>
        )}
      </div>

      {/* Error message */}
      {hasError && (
        <span className="text-xs text-[var(--color-hi-danger)]">{error}</span>
      )}
    </div>
  )
}
