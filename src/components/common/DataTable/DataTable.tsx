

export type Column<T> = {
  key:       keyof T | string   // key del dato
  header:    string             
  width?:    string             
  render?:   (row: T) => React.ReactNode  // renderer custom (badges, botones que hagan el resto del equipo, etc.)
}


  interface DataTableProps<T> {
    columns:    Column<T>[]
    data:       T[]
    emptyText?: string            // mensaje cuando no hay datos
    className?: string
  }
  
  //una vil y tipica tabla html, con estilos y opciones para personalizar columnas y celdas. 
  // El tipo genérico T permite que la tabla sea flexible y se adapte a cualquier estructura de datos, 
  // siempre que tenga un campo id opcional para las keys de React.

  export default function DataTable<T extends { id?: string | number }>({
    columns,
    data,
    emptyText = 'No hay datos disponibles.',
    className = '',
  }: DataTableProps<T>) {
    return (
      <div className={`w-full overflow-x-auto ${className}`}>
        <table className="w-full text-sm border-collapse">
  
          
          <thead>
            <tr className="border-b border-[var(--color-hi-border)]">
              {columns.map(col => (
                <th
                  key={String(col.key)}
                  className={`px-4 py-3 text-left text-xs font-semibold
                    text-[var(--color-hi-text-sub)] uppercase tracking-wide
                    ${col.width ?? ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
  
    
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-10 text-center text-sm text-[var(--color-hi-text-hint)]"
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={row.id ?? rowIndex}
                  className="border-b border-[var(--color-hi-border)] last:border-0
                    hover:bg-[var(--color-hi-bg)] transition-colors"
                >
                  {columns.map(col => (
                    <td
                      key={String(col.key)}
                      className="px-4 py-3 text-[var(--color-hi-text-main)]"
                    >
                      {col.render
                        ? col.render(row)                              //renderer custom
                        : String((row as Record<string, unknown>)[String(col.key)] ?? '—')
                      }
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
  
        </table>
      </div>
    )
  }