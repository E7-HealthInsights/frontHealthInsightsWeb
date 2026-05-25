interface ImpactBadgeProps {
    reduccion: number   // negativo = bueno, ej: -8.2
  }
  
  /**
   * ImpactBadge — muestra el nivel de impacto de una proyección.
   * Verde  → reducción ≤ -6%  (alto impacto)
   * Amarillo → reducción ≤ -2% (impacto moderado)
   * Rojo   → reducción > -2%  (bajo impacto)
   */
  export default function ImpactBadge({ reduccion }: ImpactBadgeProps) {
    const isAlto     = reduccion <= -6
    const isModerado = reduccion <= -2 && reduccion > -6
    const isBajo     = reduccion > -2
  
    const config = isAlto
      ? { label: 'Alto impacto',     bar: 'bg-[var(--color-hi-success)]', fill: 3, text: 'text-[var(--color-hi-success)]'  }
      : isModerado
      ? { label: 'Impacto moderado', bar: 'bg-[var(--color-hi-warning)]', fill: 2, text: 'text-[var(--color-hi-warning)]'  }
      : { label: 'Bajo impacto',     bar: 'bg-[var(--color-hi-danger)]',  fill: 1, text: 'text-[var(--color-hi-danger)]'   }
  
    return (
      <div className="flex items-center gap-2">
        {/* Barras de impacto */}
        <div className="flex items-end gap-0.5">
          {[1, 2, 3].map(level => (
            <div
              key={level}
              className={`w-1.5 rounded-sm transition-all ${
                level <= config.fill
                  ? config.bar
                  : 'bg-[var(--color-hi-border)]'
              }`}
              style={{ height: `${level * 5 + 4}px` }}
            />
          ))}
        </div>
  
        {/* Label + valor */}
        <div>
          <p className="text-[10px] text-[var(--color-hi-text-hint)] leading-none">
            {config.label}
          </p>
          <p className={`text-xs font-semibold leading-none mt-0.5 ${config.text}`}>
            {reduccion}%
          </p>
        </div>
      </div>
    )
  }