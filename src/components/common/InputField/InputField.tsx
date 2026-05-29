import { useState, useId } from 'react'

type InputFieldType = 'text' | 'password' | 'email' | 'number'

interface InputFieldProps {
  label:        string
  placeholder?: string
  type?:        InputFieldType
  value:        string
  onChange:     (value: string) => void
  error?:       string
  disabled?:    boolean
  className?:   string
}

export default function InputField({
  label,
  placeholder = '',
  type       = 'text',
  value,
  onChange,
  error      = '',
  disabled   = false,
  className  = '',
}: InputFieldProps) {
  const [showPassword, setShowPassword] = useState(false)
  const id = useId()
  const hasError   = error.length > 0
  const isPassword = type === 'password'

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label
        htmlFor={id}
        className="text-xs font-semibold text-[var(--color-hi-text-sub)]"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? `${id}-error` : undefined}
          className={`
            w-full rounded-[var(--radius-md)]
            border bg-[var(--color-hi-surface)]
            px-3 py-2 text-sm
            text-[var(--color-hi-text-main)]
            placeholder:text-[var(--color-hi-text-hint)]
            focus:outline-none
            transition-colors
            disabled:bg-[var(--color-hi-bg)]
            disabled:text-[var(--color-hi-text-hint)]
            disabled:cursor-not-allowed
            ${hasError
              ? 'border-[var(--color-hi-danger)] focus:border-[var(--color-hi-danger)] focus:ring-2 focus:ring-[var(--color-hi-danger)]/20'
              : 'border-[var(--color-hi-border)] focus:border-[var(--color-hi-border-focus)] focus:ring-2 focus:ring-[var(--color-hi-primary)]/20'
            }
            ${isPassword ? 'pr-10' : ''}
          `}
        />

        {/* Toggle de visibilidad para password */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(prev => !prev)}
            disabled={disabled}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className="
              absolute right-2 top-1/2 -translate-y-1/2
              p-1 rounded-md
              text-[var(--color-hi-text-hint)]
              hover:bg-[var(--color-hi-bg)]
              hover:text-[var(--color-hi-text-sub)]
              transition-colors cursor-pointer
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {showPassword ? (
              <svg
                width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg
                width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </div>

      {/* Mensaje de error */}
      {hasError && (
        <p id={`${id}-error`} className="text-xs text-[var(--color-hi-danger)]">
          {error}
        </p>
      )}
    </div>
  )
}
