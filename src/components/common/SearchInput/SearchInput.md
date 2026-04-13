# SearchInput — Guía de Diseño

Componente de entrada de texto para búsqueda. Incluye icono de lupa, botón de limpiar (cuando hay texto) y soporte completo de accesibilidad y teclado.

---

## Tokens de diseño utilizados

| Token | Valor | Uso en el componente |
|---|---|---|
| `--color-hi-surface` | `#FFFFFF` | Fondo del input |
| `--color-hi-bg` | `#F4F6F9` | Fondo en estado disabled; hover del botón clear |
| `--color-hi-border` | `#E2E8F0` | Borde por defecto |
| `--color-hi-border-focus` | `#38BDD1` | Borde al hacer focus |
| `--color-hi-primary` | `#38BDD1` | Ring de focus (20 % opacidad) |
| `--color-hi-text-main` | `#1A2B4A` | Texto ingresado |
| `--color-hi-text-sub` | `#64748B` | Hover del icono clear |
| `--color-hi-text-hint` | `#94A3B8` | Placeholder, iconos, texto disabled |
| `--radius-md` | `10px` | Border radius del input |
| `--font-sans` | `Inter` | Tipografía heredada del body |

---

## API del componente

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `value` | `string` | — | Valor controlado del input (requerido) |
| `onChange` | `(value: string) => void` | — | Callback al cambiar el texto (requerido) |
| `placeholder` | `string` | `'Buscar…'` | Texto de placeholder |
| `disabled` | `boolean` | `false` | Deshabilita el campo |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamaño del componente |
| `className` | `string` | `''` | Clases extra para el contenedor |
| `onClear` | `() => void` | — | Callback personalizado al limpiar; si no se pasa, ejecuta `onChange('')` |

---

## Tamaños

| Size | Padding | Font size | Casos de uso |
|---|---|---|---|
| `sm` | `py-1.5 pl-7 pr-7` | `text-xs` | Filtros dentro de tablas o paneles compactos |
| `md` | `py-2 pl-9 pr-8` | `text-sm` | Búsqueda general, barra principal (default) |
| `lg` | `py-2.5 pl-11 pr-10` | `text-base` | Heroes, buscadores prominentes |

---

## Estados visuales

### Default
- Borde: `--color-hi-border` (`#E2E8F0`)
- Fondo: `--color-hi-surface` (`#FFFFFF`)
- Icono lupa: `--color-hi-text-hint`

### Focus
- Borde: `--color-hi-border-focus` (`#38BDD1`)
- Ring: `ring-2` con `--color-hi-primary` al 20 % de opacidad
- El icono de lupa permanece igual (no interactivo)

### Con texto (value no vacío)
- Aparece el botón `×` en el extremo derecho
- El botón tiene hover con `--color-hi-bg` de fondo y `--color-hi-text-sub` de color
- Al hacer click limpia el valor y devuelve el foco al input

### Disabled
- Fondo: `--color-hi-bg` (`#F4F6F9`)
- Texto: `--color-hi-text-hint`
- Cursor: `not-allowed`
- El botón clear no se renderiza

---

## Ejemplos de uso

### Básico

```tsx
import { useState } from 'react'
import SearchInput from '@/components/common/SearchInput'

function Example() {
  const [query, setQuery] = useState('')

  return (
    <SearchInput
      value={query}
      onChange={setQuery}
      placeholder="Buscar paciente…"
    />
  )
}
```

### Tamaño pequeño dentro de una Card

```tsx
<Card title="Actividad Reciente" subtitle="Usuarios conectados esta semana">
  <div className="mb-3">
    <SearchInput
      value={query}
      onChange={setQuery}
      size="sm"
      placeholder="Filtrar por nombre…"
    />
  </div>
  <DataTable columns={columns} data={filteredData} />
</Card>
```

### Con onClear personalizado (reset de filtros adicionales)

```tsx
<SearchInput
  value={query}
  onChange={setQuery}
  onClear={() => {
    setQuery('')
    setActiveFilters([])   // limpia también otros filtros
  }}
  placeholder="Buscar…"
/>
```

### Deshabilitado

```tsx
<SearchInput
  value=""
  onChange={() => {}}
  disabled
  placeholder="Búsqueda no disponible"
/>
```

---

## Integración con DataTable

El uso más común es filtrar los datos de `DataTable` antes de pasarlos al componente:

```tsx
import { useState, useMemo } from 'react'
import SearchInput from '@/components/common/SearchInput'
import DataTable, { type Column } from '@/components/common/DataTable'
import Card from '@/components/common/Card'
import { type User } from '@/types/User'

const columns: Column<User>[] = [
  { key: 'nombre_completo', header: 'Nombre', render: r => `${r.nombre} ${r.apellido}` },
  { key: 'correo', header: 'Correo' },
  { key: 'estatus', header: 'Estatus' },
]

function ActivityCard({ data }: { data: User[] }) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!query.trim()) return data
    const q = query.toLowerCase()
    return data.filter(u =>
      `${u.nombre} ${u.apellido}`.toLowerCase().includes(q) ||
      u.correo.toLowerCase().includes(q)
    )
  }, [data, query])

  return (
    <Card title="Actividad Reciente" subtitle="Usuarios conectados esta semana">
      <div className="mb-3">
        <SearchInput
          value={query}
          onChange={setQuery}
          size="sm"
          placeholder="Filtrar por nombre o correo…"
        />
      </div>
      <DataTable columns={columns} data={filtered} emptyText="Sin resultados." />
    </Card>
  )
}
```

---

## Accesibilidad

- El icono de lupa lleva `aria-hidden="true"` para que los lectores de pantalla lo ignoren.
- El `<input>` tiene `aria-label` con el valor del placeholder.
- El botón clear tiene `aria-label="Limpiar búsqueda"`.
- El componente es completamente navegable con teclado:
  - `Tab` enfoca el input.
  - Escribir texto muestra el botón clear.
  - `Tab` de nuevo enfoca el botón clear.
  - `Enter` / `Space` sobre el botón clear limpia el valor y devuelve el foco al input.
  - El campo respeta `disabled` correctamente.

---

## Estructura de archivos

```
src/components/common/SearchInput/
├── SearchInput.tsx   # Componente principal
├── SearchInput.md    # Esta guía de diseño
└── index.ts          # Re-export: export { default } from './SearchInput'
```
