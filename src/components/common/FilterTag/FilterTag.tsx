interface FilterTagProps {
  label:      string           // Nombre del filtro, ej. "Estado"
  value:      string           // Valor activo, ej. "Tabasco"
  onRemove:   () => void       // Callback al pulsar el botón ×
  className?: string
}

/**
 * FilterTag — etiqueta removible que muestra un par label:valor.
 * Aparece en el modal de proyecciones (Estado: Tabasco, Año: 2024).
 *
 * @example
 * <FilterTag label="Estado" value="Tabasco" onRemove={() => removeFilter('estado')} />
 * <FilterTag label="Año"    value="2024"    onRemove={() => removeFilter('año')} />
 */
export default function FilterTag({
  label,
  value,
  onRemove,
  className = '',
}: FilterTagProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        pl-2.5 pr-1.5 py-0.5
        rounded-full
        bg-[var(--color-hi-primary-soft)]
        border border-[var(--color-hi-primary)]/30
        text-xs font-medium text-[var(--color-hi-navy-light)]
        ${className}
      `}
    >
      {/* Texto: "Estado: Tabasco" */}
      <span>
        <span className="font-semibold">{label}:</span>{' '}
        {value}
      </span>

      {/* Botón de eliminar */}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Eliminar filtro ${label}: ${value}`}
        className="
          flex items-center justify-center
          w-3.5 h-3.5 rounded-full
          text-[var(--color-hi-navy-light)]
          hover:bg-[var(--color-hi-primary)]/20
          transition-colors cursor-pointer
        "
      >
        {/* ícono × inline, sin dependencias */}
        <svg
          width="8" height="8"
          viewBox="0 0 8 8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <line x1="1" y1="1" x2="7" y2="7" />
          <line x1="7" y1="1" x2="1" y2="7" />
        </svg>
      </button>
    </span>
  )
}