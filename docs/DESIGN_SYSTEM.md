# Health Insights — Design System

Guía de referencia del sistema de diseño del proyecto. Cubre tokens de diseño, componentes disponibles, convenciones de código y patrones de uso.

---

## Tabla de contenidos

1. [Tokens de diseño](#1-tokens-de-diseño)
2. [Convenciones de componentes](#2-convenciones-de-componentes)
3. [Componentes](#3-componentes)
   - [Card](#card)
   - [Modal](#modal)
   - [DataTable](#datatable)
   - [StatCard](#statcard)
   - [SearchInput](#searchinput)
4. [Patrones de layout](#4-patrones-de-layout)
5. [Accesibilidad](#5-accesibilidad)
6. [Estructura de archivos](#6-estructura-de-archivos)

---

## 1. Tokens de diseño

Definidos en `src/index.css` bajo `@theme`. Se consumen con `var(--token)` en las clases de Tailwind.

### Colores

#### Brand

| Token | Valor | Uso |
|---|---|---|
| `--color-hi-primary` | `#38BDD1` | Botones primarios, bordes de focus, elementos activos |
| `--color-hi-primary-dark` | `#2AA3B8` | Hover de botón primario |
| `--color-hi-primary-soft` | `#E8F7FA` | Fondos suaves, badges informativos |
| `--color-hi-navy` | `#1B3A6B` | Logo, títulos principales, valores destacados |
| `--color-hi-navy-light` | `#2D5090` | Textos secundarios con peso visual |

#### Neutros

| Token | Valor | Uso |
|---|---|---|
| `--color-hi-bg` | `#F4F6F9` | Fondo general de la página |
| `--color-hi-surface` | `#FFFFFF` | Fondo de cards, modales, inputs |
| `--color-hi-border` | `#E2E8F0` | Bordes de cards e inputs en reposo |
| `--color-hi-border-focus` | `#38BDD1` | Borde de input al hacer focus |

#### Texto

| Token | Valor | Uso |
|---|---|---|
| `--color-hi-text-main` | `#1A2B4A` | Texto principal, celdas de tabla |
| `--color-hi-text-sub` | `#64748B` | Labels, subtítulos, headers de tabla |
| `--color-hi-text-hint` | `#94A3B8` | Placeholders, iconos decorativos, texto disabled |

#### Semánticos

| Token | Valor | Uso |
|---|---|---|
| `--color-hi-success` | `#22C55E` | Estados positivos, badges de activo |
| `--color-hi-warning` | `#F59E0B` | Alertas, valores en riesgo |
| `--color-hi-danger` | `#EF4444` | Errores, acciones destructivas |

---

### Tipografía

| Token | Valor |
|---|---|
| `--font-sans` | `'Inter', ui-sans-serif, system-ui, sans-serif` |

**Escala de texto** (clases de Tailwind estándar):

| Clase | Tamaño | Uso típico |
|---|---|---|
| `text-xs` | 12 px | Headers de tabla, labels pequeños |
| `text-sm` | 14 px | Texto de cuerpo, botones, celdas |
| `text-base` | 16 px | Texto general |
| `text-xl` | 20 px | Títulos de modal |
| `text-3xl` | 30 px | Valores de StatCard |

**Pesos:**

| Clase | Peso | Uso |
|---|---|---|
| `font-normal` | 400 | Texto de cuerpo |
| `font-semibold` | 600 | Títulos de card, headers |
| `font-bold` | 700 | Valores numéricos destacados (StatCard) |

---

### Radios de borde

| Token | Valor | Uso |
|---|---|---|
| `--radius-sm` | `6px` | Elementos internos pequeños (placeholders de gráfica) |
| `--radius-md` | `10px` | Inputs, menús desplegables |
| `--radius-lg` | `14px` | Cards, modales |
| `--radius-xl` | `20px` | Reservado para elementos muy redondeados |

---

## 2. Convenciones de componentes

- **Controlled components**: los componentes no manejan estado propio de negocio; el padre controla `value`, `isOpen`, etc.
- **`className?` siempre opcional**: todos los componentes aceptan clases extra para ajustes puntuales desde el padre.
- **Sin librerías de iconos**: los iconos se escriben como SVG inline para evitar dependencias y mantener tamaños precisos.
- **CSS variables en clases Tailwind**: `bg-[var(--color-hi-surface)]`, nunca valores hex hardcodeados fuera de `index.css`.
- **TypeScript estricto**: todas las props se tipan con `interface`; los unions de variantes se tipan con `type`.

---

## 3. Componentes

---

### Card

**Ruta:** `src/components/common/Card/Card.tsx`

Contenedor visual con soporte de encabezado, subtítulo y menú de acciones (tres puntos).

#### Props

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `title` | `string` | — | Título del encabezado |
| `subtitle` | `string` | — | Subtítulo debajo del título |
| `actions` | `CardAction[]` | `[]` | Opciones del menú de tres puntos |
| `className` | `string` | `''` | Clases extra para el contenedor |
| `children` | `ReactNode` | — | Contenido de la card (requerido) |

**`CardAction`:**

```ts
type CardAction = {
  label:   string
  onClick: () => void
  danger?: boolean   // pinta el item en --color-hi-danger
}
```

#### Ejemplos

```tsx
// Solo contenido
<Card>
  <p className="text-sm text-[var(--color-hi-text-sub)]">Texto libre.</p>
</Card>

// Con encabezado
<Card title="Presupuesto vs Gasto Real" subtitle="Comparativa por trimestre">
  {/* gráfica u otro contenido */}
</Card>

// Con menú de acciones
<Card
  title="Expediente"
  actions={[
    { label: 'Editar',   onClick: () => {} },
    { label: 'Eliminar', onClick: () => {}, danger: true },
  ]}
>
  {/* contenido */}
</Card>
```

#### Estados

- El menú de tres puntos se abre/cierra con click y se cierra al hacer click fuera (listener en `document`).
- Si no hay `title` ni `actions`, el encabezado no se renderiza.

---

### Modal

**Ruta:** `src/components/common/Modal/Modal.tsx`

Diálogo centrado con backdrop, soporte de `Escape` para cerrar y bloqueo de scroll del body.

#### Props

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `isOpen` | `boolean` | — | Controla visibilidad (requerido) |
| `onClose` | `() => void` | — | Callback al cerrar (requerido) |
| `title` | `string` | — | Título del modal (requerido) |
| `subtitle` | `string` | — | Subtítulo opcional |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Ancho máximo |
| `children` | `ReactNode` | — | Contenido (requerido) |

**Tamaños:**

| Size | `max-width` |
|---|---|
| `sm` | `max-w-sm` (384 px) |
| `md` | `max-w-lg` (512 px) |
| `lg` | `max-w-2xl` (672 px) |

#### Ejemplo

```tsx
const [open, setOpen] = useState(false)

<button onClick={() => setOpen(true)}>Abrir</button>

<Modal
  isOpen={open}
  onClose={() => setOpen(false)}
  title="Confirmar acción"
  subtitle="Esta operación no se puede deshacer."
  size="sm"
>
  <p className="text-sm text-[var(--color-hi-text-sub)]">¿Deseas continuar?</p>
</Modal>
```

#### Comportamiento

- `Escape` llama a `onClose`.
- Click en el backdrop llama a `onClose`.
- Click dentro del panel **no** propaga al backdrop (`stopPropagation`).
- Mientras está abierto, `body` tiene `overflow: hidden`.

---

### DataTable

**Ruta:** `src/components/common/DataTable/DataTable.tsx`

Tabla HTML estilizada con columnas configurables y soporte de renders custom por celda.

#### Props

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `columns` | `Column<T>[]` | — | Definición de columnas (requerido) |
| `data` | `T[]` | — | Datos a mostrar (requerido) |
| `emptyText` | `string` | `'No hay datos disponibles.'` | Mensaje cuando `data` está vacío |
| `className` | `string` | `''` | Clases extra para el wrapper |

**`Column<T>`:**

```ts
type Column<T> = {
  key:     keyof T | string
  header:  string
  width?:  string                       // clase de Tailwind, ej. 'w-32'
  render?: (row: T) => ReactNode        // renderer custom
}
```

El tipo genérico `T` debe tener `id?: string | number` para las keys de React.

#### Ejemplo

```tsx
import DataTable, { type Column } from '@/components/common/DataTable'
import { type User } from '@/types/User'

const columns: Column<User>[] = [
  {
    key: 'nombre_completo',
    header: 'Nombre',
    render: row => `${row.nombre} ${row.apellido}`,
  },
  { key: 'correo',  header: 'Correo' },
  { key: 'estatus', header: 'Estatus', width: 'w-24' },
]

<DataTable columns={columns} data={users} emptyText="Sin usuarios registrados." />
```

#### Estilos

- Headers: `text-xs font-semibold text-[var(--color-hi-text-sub)] uppercase tracking-wide`
- Filas: hover con `--color-hi-bg`, separadas por `border-[var(--color-hi-border)]`
- Última fila sin borde inferior (`last:border-0`)

---

### StatCard

**Ruta:** `src/components/features/dashboard/StatCard.tsx`

Card especializada para mostrar un KPI o métrica con valor destacado. Envuelve `Card`.

#### Props

| Prop | Tipo | Descripción |
|---|---|---|
| `title` | `string` | Nombre del indicador |
| `subtitle` | `string` | Contexto (ubicación, período) |
| `value` | `string \| number` | Valor principal destacado |
| `label` | `string` | Nota al pie (ej. fecha de actualización) |

#### Ejemplo

```tsx
<StatCard
  title="Personas con diabetes"
  subtitle="CDMX, 2026"
  value="1,250K"
  label="Última actualización: 2025-12-31"
/>
```

#### Tipografía del valor

- `text-3xl font-bold text-[var(--color-hi-navy)]`

---

### SearchInput

**Ruta:** `src/components/common/SearchInput/SearchInput.tsx`

Input de búsqueda con icono de lupa, botón de limpiar y tres tamaños.

#### Props

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `value` | `string` | — | Valor controlado (requerido) |
| `onChange` | `(value: string) => void` | — | Callback al escribir (requerido) |
| `placeholder` | `string` | `'Buscar…'` | Texto de placeholder |
| `disabled` | `boolean` | `false` | Deshabilita el campo |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamaño del componente |
| `className` | `string` | `''` | Clases extra para el contenedor |
| `onClear` | `() => void` | — | Override del clear; si no se pasa, llama `onChange('')` |

**Tamaños:**

| Size | Padding | Font | Caso de uso |
|---|---|---|---|
| `sm` | `py-1.5 pl-7 pr-7` | `text-xs` | Filtros dentro de tablas o paneles compactos |
| `md` | `py-2 pl-9 pr-8` | `text-sm` | Búsqueda general (default) |
| `lg` | `py-2.5 pl-11 pr-10` | `text-base` | Buscadores prominentes |

#### Estados

| Estado | Visual |
|---|---|
| Default | Borde `--color-hi-border` |
| Focus | Borde `--color-hi-border-focus` + ring teal 20 % |
| Con texto | Aparece botón `×` a la derecha |
| Disabled | Fondo `--color-hi-bg`, cursor `not-allowed`, sin botón clear |

#### Ejemplo con DataTable

```tsx
import { useState, useMemo } from 'react'
import Card from '@/components/common/Card'
import SearchInput from '@/components/common/SearchInput'
import DataTable, { type Column } from '@/components/common/DataTable'
import { type User } from '@/types/User'

const columns: Column<User>[] = [
  { key: 'nombre_completo', header: 'Nombre', render: r => `${r.nombre} ${r.apellido}` },
  { key: 'correo',  header: 'Correo' },
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

## 4. Patrones de layout

### Grid de cards

```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <StatCard ... />
  <StatCard ... />
  <Card ...>...</Card>
</div>
```

### Card con tabla filtrable

```tsx
<Card title="..." subtitle="...">
  <div className="mb-3">
    <SearchInput value={query} onChange={setQuery} size="sm" placeholder="Buscar…" />
  </div>
  <DataTable columns={columns} data={filteredData} />
</Card>
```

### Acción con confirmación en Modal

```tsx
// El modal actúa como confirmación antes de una acción destructiva
<Card actions={[{ label: 'Eliminar', onClick: () => setConfirmOpen(true), danger: true }]}>
  ...
</Card>

<Modal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} title="¿Eliminar registro?" size="sm">
  <p className="text-sm text-[var(--color-hi-text-sub)]">Esta acción no se puede deshacer.</p>
</Modal>
```

---

## 5. Accesibilidad

- Todos los botones icon-only tienen `aria-label` descriptivo.
- Los iconos decorativos llevan `aria-hidden="true"`.
- Los modales bloquean el scroll y escuchan `Escape`.
- Los inputs tienen `aria-label` explícito (no solo placeholder).
- Los menús desplegables (Card) se cierran con click fuera via listener en `document`.

---

## 6. Estructura de archivos

```
src/
├── index.css                          # Tokens de diseño (@theme)
├── components/
│   ├── common/                        # Componentes reutilizables en toda la app
│   │   ├── Card/
│   │   │   ├── Card.tsx
│   │   │   └── index.ts
│   │   ├── Modal/
│   │   │   ├── Modal.tsx
│   │   │   └── index.ts
│   │   ├── DataTable/
│   │   │   ├── DataTable.tsx
│   │   │   └── index.ts
│   │   └── SearchInput/
│   │       ├── SearchInput.tsx
│   │       └── index.ts
│   └── features/                      # Componentes específicos de dominio
│       └── dashboard/
│           └── StatCard.tsx
├── types/
│   └── User.ts
docs/
└── DESIGN_SYSTEM.md                   # Este archivo
```

### Convención de exports

Cada componente común tiene un `index.ts` que re-exporta el default:

```ts
// index.ts
export { default } from './NombreComponente'

// Si el componente exporta tipos adicionales:
export { default } from './DataTable'
export type { Column } from './DataTable'
```

Importar siempre desde la carpeta, no desde el archivo directamente:

```ts
// correcto
import Card from '@/components/common/Card'

// evitar
import Card from '@/components/common/Card/Card'
```
