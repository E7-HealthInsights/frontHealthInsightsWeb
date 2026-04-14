# Health Insights — Design System

Guía de referencia del sistema de diseño del proyecto. Cubre tokens de diseño, componentes disponibles (implementados y planificados), convenciones de código, patrones de uso y la estructura de vistas.

---

## Tabla de contenidos

1. [Tokens de diseño](#1-tokens-de-diseño)
2. [Convenciones de componentes](#2-convenciones-de-componentes)
3. [Componentes básicos](#3-componentes-básicos)
   - [Button](#button)
   - [InputField](#inputfield)
   - [Dropdown](#dropdown)
   - [SearchInput](#searchinput)
   - [Badge](#badge)
   - [FilterTag](#filtertag)
   - [TabGroup](#tabgroup)
4. [Componentes compuestos](#4-componentes-compuestos)
   - [Card](#card)
   - [Modal](#modal)
   - [DataTable](#datatable)
   - [StatCard](#statcard)
<<<<<<< HEAD
   - [SearchInput](#searchinput)
   - [Button](#button)
   - [UserMenu](#usermenu)
4. [Patrones de layout](#4-patrones-de-layout)
5. [Accesibilidad](#5-accesibilidad)
6. [Estructura de archivos](#6-estructura-de-archivos)
=======
   - [Navbar](#navbar)
   - [UserMenu](#usermenu)
   - [FileUploadZone](#fileuploadzone)
   - [CSVPreviewTable](#csvpreviewtable)
   - [ColumnMapper](#columnmapper)
5. [Variantes especializadas de Card](#5-variantes-especializadas-de-card)
6. [Variantes especializadas de Modal](#6-variantes-especializadas-de-modal)
7. [Vistas / Páginas](#7-vistas--páginas)
8. [Patrones de layout](#8-patrones-de-layout)
9. [Accesibilidad](#9-accesibilidad)
10. [Estructura de archivos](#10-estructura-de-archivos)
>>>>>>> 10b5977898ab6904ca69f942134ec61a80c703cb

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
- **Variantes via props**: los componentes con múltiples variantes visuales (Button, Badge, etc.) usan una prop `variant` en lugar de componentes separados.

---

## 3. Componentes básicos

### Button

> **Estado:** Planificado

Botón unificado con tres variantes. Un solo componente `<Button>` evita triplicar código.

#### Props

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `variant` | `'primary' \| 'secondary' \| 'icon'` | `'primary'` | Variante visual |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamaño del botón |
| `icon` | `ReactNode` | — | Icono SVG inline |
| `children` | `ReactNode` | — | Label del botón (no aplica en `icon`) |
| `onClick` | `() => void` | — | Callback de click |
| `disabled` | `boolean` | `false` | Deshabilita el botón |
| `className` | `string` | `''` | Clases extra |

#### Variantes

| Variante | Estilo | Uso |
|---|---|---|
| `primary` | Fondo `--color-hi-primary`, texto blanco | "Ingresar", "Generar reporte", "Crear Usuario", "Generar", "Descargar" |
| `secondary` | Borde `--color-hi-border`, fondo transparente | "Cancelar", "Preview", "Agregar", "Ver", "Volver", "Editar" |
| `icon` | Fondo transparente, solo icono | Editar (lápiz), Borrar (papelera), +, × |

---

### InputField

> **Estado:** Planificado

Campo de entrada unificado. Cubre texto, contraseña y búsqueda.

#### Props

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `label` | `string` | — | Label visible sobre el input |
| `placeholder` | `string` | `''` | Placeholder del campo |
| `type` | `'text' \| 'password' \| 'email' \| 'number'` | `'text'` | Tipo de input |
| `value` | `string` | — | Valor controlado (requerido) |
| `onChange` | `(value: string) => void` | — | Callback al escribir (requerido) |
| `error` | `string` | `''` | Mensaje de error bajo el campo |
| `disabled` | `boolean` | `false` | Deshabilita el campo |
| `className` | `string` | `''` | Clases extra |

#### Notas

- `type="password"` incluye toggle de visibilidad (ojo/eye icon).
- El error se muestra debajo del campo en `text-xs text-[var(--color-hi-danger)]`.
- El borde cambia a `--color-hi-danger` cuando hay error.

---

### Dropdown

> **Estado:** Planificado

Menú desplegable para selección de una opción.

#### Props

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `label` | `string` | — | Label visible |
| `placeholder` | `string` | `'Seleccionar…'` | Placeholder |
| `options` | `{ value: string; label: string }[]` | `[]` | Opciones disponibles |
| `value` | `string` | — | Valor seleccionado (requerido) |
| `onChange` | `(value: string) => void` | — | Callback al seleccionar |
| `error` | `string` | `''` | Mensaje de error |
| `className` | `string` | `''` | Clases extra |

#### Uso en el proyecto

- Selección de fuente de datos (Dashboard, Proyecciones).
- Selección de tipo (Dashboard, Proyecciones).
- Selección de rol (Usuarios).

---

### SearchInput

> **Estado:** Implementado

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

---

### Badge

> **Estado:** Planificado

Badge unificado para roles, estatus y tags de filtro.

#### Props

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `variant` | `'success' \| 'warning' \| 'danger' \| 'info' \| 'neutral'` | `'neutral'` | Color del badge |
| `children` | `ReactNode` | — | Contenido del badge |

#### Uso en el proyecto

- **RolLabel**: badge con el rol del usuario (ej. "D.G.", "Admin").
- **StatusLabel**: badge con el estatus (ej. "Activo" = success, "Inactivo" = danger).
- **FilterTag**: badge removible con `label: valor`, lleva botón `×` para eliminar.

---

### FilterTag

> **Estado:** Planificado

Tag removible con label y valor. Aparece en modales de Dashboard y Proyecciones.

#### Props

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `label` | `string` | — | Nombre del filtro (ej. "Estado") |
| `value` | `string` | — | Valor del filtro (ej. "Tabasco") |
| `onRemove` | `() => void` | — | Callback al eliminar el tag |

#### Visual

Estilo tipo badge con fondo `--color-hi-primary-soft`, texto `--color-hi-primary-dark` y botón `×`.

---

### TabGroup

> **Estado:** Planificado

Grupo de tabs genérico para alternar contenido dentro de la misma página. No navega rutas (para eso está Navbar).

#### Props

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `tabs` | `{ key: string; label: string }[]` | `[]` | Lista de tabs |
| `activeTab` | `string` | — | Key del tab activo |
| `onChange` | `(key: string) => void` | — | Callback al cambiar tab |
| `className` | `string` | `''` | Clases extra |

#### Uso en el proyecto

- Actividad Reciente: tabs para tipos de actividad.
- Usuarios: tabs "Activos" / "Inactivos".

---

## 4. Componentes compuestos

### Card

> **Estado:** Implementado

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

#### Comportamiento

- El menú de tres puntos se abre/cierra con click y se cierra al hacer click fuera (listener en `document`).
- Si no hay `title` ni `actions`, el encabezado no se renderiza.

---

### Modal

> **Estado:** Implementado

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

> **Estado:** Implementado

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

> **Estado:** Implementado

**Ruta:** `src/components/features/dashboard/StatCard.tsx`

Card especializada para mostrar un KPI o métrica con valor destacado. Envuelve `Card`.

#### Props

| Prop | Tipo | Descripción |
|---|---|---|
| `title` | `string` | Nombre del indicador |
| `subtitle` | `string` | Contexto (ubicación, período) |
| `value` | `string \| number` | Valor principal destacado |
| `label` | `string` | Nota al pie (ej. fecha de actualización) |

#### Tipografía del valor

- `text-3xl font-bold text-[var(--color-hi-navy)]`

---

### Navbar

> **Estado:** Planificado

Barra de navegación superior con logo, links de navegación y menú de usuario.

#### Props

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `links` | `{ key: string; label: string; path: string }[]` | — | Links de navegación |
| `activePath` | `string` | — | Ruta activa actual |

#### Elementos internos

- **Logo**: link a inicio.
- **NavLinks**: links que cambian de ruta (react-router). Su estado activo depende de la URL.
- **UserMenu**: avatar + dropdown de sesión (ver componente UserMenu).

#### Links del proyecto

| Label | Ruta |
|---|---|
| Inicio | `/` |
| Proyecciones | `/proyecciones` |
| Reportes | `/reportes` |

---

<<<<<<< HEAD
---

### Button

**Ruta:** `src/components/common/Button/Button.tsx`

Botón reutilizable con tres variantes, tres tamaños, estado de carga y soporte de accesibilidad.

#### Props

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `variant` | `'primary' \| 'secondary' \| 'icon'` | `'primary'` | Estilo visual del botón |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamaño (ignorado en variante `icon`) |
| `disabled` | `boolean` | `false` | Deshabilita el botón |
| `loading` | `boolean` | `false` | Muestra spinner y deshabilita el botón |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Tipo HTML del botón |
| `ariaLabel` | `string` | — | Requerido en variante `icon` (sin texto visible) |
| `className` | `string` | `''` | Clases extra para el botón |
| `onClick` | `() => void` | — | Callback al hacer click |
| `children` | `ReactNode` | — | Contenido del botón (requerido) |

**Variantes:**

| Variante | Apariencia |
|---|---|
| `primary` | Fondo `--color-hi-primary`, texto blanco; hover `--color-hi-primary-dark` |
| `secondary` | Fondo `--color-hi-surface`, borde `--color-hi-border`; hover `--color-hi-bg` |
| `icon` | Transparente, sin padding extra — para envolver SVGs; hover `--color-hi-bg` |

**Tamaños:**

| Size | Padding | Font |
|---|---|---|
| `sm` | `px-3 py-1.5` | `text-xs` |
| `md` | `px-4 py-2` | `text-sm` |
| `lg` | `px-5 py-2.5` | `text-base` |

#### Ejemplos

```tsx
// Primario
<Button onClick={handleSave}>Guardar</Button>

// Secundario
<Button variant="secondary" onClick={handleCancel}>Cancelar</Button>

// Icon (aria-label obligatorio)
<Button variant="icon" ariaLabel="Eliminar">
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
</Button>

// Cargando
<Button loading>Guardando…</Button>

// Submit en formulario
<Button type="submit" size="lg">Crear cuenta</Button>
```

#### Notas

- En variante `icon`, los `size` no aplican — el padding lo define la propia variante.
- El spinner del estado `loading` lleva `aria-hidden="true"` al ser decorativo.

---

### UserMenu

**Ruta:** `src/components/common/UserMenu/UserMenu.tsx`

Botón circular con ícono de perfil que despliega un menú de usuario con la opción de cerrar sesión.

#### Props

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `onLogout` | `() => void` | — | Callback al seleccionar "Cerrar Sesión" (requerido) |
| `className` | `string` | `''` | Clases extra para el contenedor |

#### Ejemplo

```tsx
<UserMenu onLogout={() => auth.logout()} />
```

#### Comportamiento

- Click en el botón circular abre/cierra el dropdown.
- Click fuera del componente cierra el dropdown (listener `mousedown` en `document`).
- "Cerrar Sesión" llama a `onLogout` y cierra el menú.

#### Estilos

- Botón: círculo `w-9 h-9`, fondo `--color-hi-primary-soft`, ícono `--color-hi-primary`; hover relleno teal.
- Dropdown: misma superficie y bordes que Card (`--color-hi-surface`, `--color-hi-border`, `--radius-md`).
- Ítem "Cerrar Sesión": `--color-hi-danger` con ícono de salida.

---

## 4. Patrones de layout
=======
### UserMenu

> **Estado:** Planificado

Avatar de usuario con dropdown para acciones de sesión.

#### Props

| Prop | Tipo | Descripción |
|---|---|---|
| `userName` | `string` | Nombre visible |
| `userAvatar` | `string` | URL del avatar |
| `onLogout` | `() => void` | Callback al cerrar sesión |

#### Comportamiento

- Click en avatar abre/cierra dropdown.
- Click fuera cierra el dropdown.
- Opciones: "Mi perfil", "Cerrar sesión".

---

### FileUploadZone

> **Estado:** Planificado

Zona de arrastre para subir archivos CSV. Dos estados visuales: vacío y archivo cargado.

#### Props

| Prop | Tipo | Descripción |
|---|---|---|
| `onFileSelect` | `(file: File) => void` | Callback al seleccionar archivo |
| `accept` | `string` | Tipos aceptados (default: `.csv`) |
| `maxSize` | `number` | Tamaño máximo en bytes |
| `className` | `string` | Clases extra |

#### Estados visuales

| Estado | Visual |
|---|---|
| Vacío | Borde punteado, icono de upload, texto "Arrastra un archivo CSV o haz click" |
| Cargado | Fondo `--color-hi-success` suave, icono check, nombre del archivo |

---

### CSVPreviewTable

> **Estado:** Planificado

Tabla de previsualización de las primeras 5 filas de un CSV parseado. Componente presentacional puro.

#### Props

| Prop | Tipo | Descripción |
|---|---|---|
| `data` | `Record<string, string>[]` | Primeras 5 filas del CSV parseado |

---

### ColumnMapper

> **Estado:** Planificado

Componente de mapeo de columnas CSV a campos del sistema.

#### Props

| Prop | Tipo | Descripción |
|---|---|---|
| `columns` | `string[]` | Nombres de columnas originales del CSV |
| `onChange` | `(mapping: Record<string, string>) => void` | Callback con el mapeo resultado |

---

## 5. Variantes especializadas de Card

Todas comparten la estructura del `Card` genérico: título, subtítulo, menú de tres puntos y área de contenido. Cada variante es un hijo que le pasa su contenido especializado al Card base.

| Variante | Contenido | Uso |
|---|---|---|
| **ChartCard** | Gráfica (barras, líneas, etc.) | Dashboard — métricas visuales |
| **MapCard** | Mapa geográfico interactivo | Dashboard — distribución geográfica |
| **StatCard** | Valor numérico destacado | Dashboard — KPIs (ya implementado) |
| **ProjectionCard** | Resumen de proyección + botones Ver/Editar/Borrar | Proyecciones — listado |
| **ReportCard** | Resumen de reporte + botones Ver/Descargar/Borrar | Reportes — listado |
| **DataCard** | Resumen de dataset + botones Editar/Borrar | Datos — listado |
| **VariablesCard** | Lista de variables de una proyección | Proyecciones — detalle |
| **ParamCard** | Parámetros de una proyección | Proyecciones — detalle |
| **ResultsCard** | Resultados de una proyección | Proyecciones — detalle |

---

## 6. Variantes especializadas de Modal

Todas envuelven el `Modal` genérico con contenido específico.

| Variante | Contenido | Uso |
|---|---|---|
| **GenerateElementModal** | Dropdown fuente + agregar + tags de filtro + inputs + preview + botones Generar/Preview/Cancelar | Dashboard — generar elemento de gráfica |
| **NewProjectionModal** | Similar a GenerateElementModal con campos de proyección | Proyecciones — nueva proyección |
| **AddUserModal** | InputFields (Nombre, Apellido, Correo) + Passwords + Dropdown Rol + botones Cancelar/Crear | Usuarios — agregar usuario |
| **NewDatasetModal** | InputField título + TextArea descripción + InputField fuente + FileUploadZone + CSVPreviewTable + ColumnMapper + botones Cancelar/Avanzar/Finalizar | Datos — nuevo dataset |

---

## 7. Vistas / Páginas

### Login

| Componente | Notas |
|---|---|
| Logo | Centrado arriba |
| LoginCard | Card que agrupa el formulario |
| InputField (email) | Campo de correo |
| InputField (password) | Campo con toggle de visibilidad |
| Button (primary) | "Ingresar" |
| Text Link | "ForgotPassword" |

### Dashboard

| Componente | Notas |
|---|---|
| Button (primary) | "Generar reporte" |
| Button (icon) | Editar |
| ChartCard | Gráfica de métricas |
| StatCard | KPIs numéricos |
| MapCard | Mapa geográfico |
| GenerateElementModal | Modal para generar elementos |

### Proyecciones

| Componente | Notas |
|---|---|
| ProjectionCard | Listado de proyecciones |
| Button (secondary) | "Ver" |
| Button (icon) | Editar, Borrar, + |
| NewProjectionModal | Modal para nueva proyección |
| ChartCard | Detalle — gráfica |
| VariablesCard | Detalle — variables |
| ParamCard | Detalle — parámetros |
| ResultsCard | Detalle — resultados |
| Button (primary) | "Generar Reporte" |
| Button (secondary) | "Volver" |

### Reportes

| Componente | Notas |
|---|---|
| Button (primary) | "Descargar toda" |
| ReportCard | Listado de reportes |
| Button (secondary) | "Ver" |
| Button (icon) | Descargar, Borrar |

### Actividad Reciente

| Componente | Notas |
|---|---|
| SearchInput | Búsqueda de actividades |
| TabGroup | Filtros de tipo de actividad |
| DataTable | Tabla de actividades |
| Button (primary) | "Generar reporte" |

### Usuarios

| Componente | Notas |
|---|---|
| SearchInput | Búsqueda de usuarios |
| TabGroup | "Activos" / "Inactivos" |
| DataTable | Tabla de usuarios |
| Button (primary) | "Agregar Usuario" |
| Button (icon) | Editar, Eliminar |
| Badge | Rol / Estatus de cada usuario |
| AddUserModal | Modal para crear usuario |

### Datos

| Componente | Notas |
|---|---|
| SearchInput | Búsqueda de datasets |
| Button (primary) | "Agregar" |
| DataCard | Listado de datasets |
| Button (secondary) | "Editar" |
| Button (icon) | Borrar |
| NewDatasetModal | Modal con FileUploadZone + ColumnMapper |

---

## 8. Patrones de layout
>>>>>>> 10b5977898ab6904ca69f942134ec61a80c703cb

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

### Vista con tabs y búsqueda

```tsx
<Card title="Usuarios" subtitle="Gestión de usuarios del sistema">
  <div className="flex items-center gap-3 mb-4">
    <SearchInput value={query} onChange={setQuery} size="sm" placeholder="Buscar usuario…" />
    <TabGroup tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
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

## 9. Accesibilidad

- Todos los botones icon-only tienen `aria-label` descriptivo.
- Los iconos decorativos llevan `aria-hidden="true"`.
- Los modales bloquean el scroll y escuchan `Escape`.
- Los inputs tienen `aria-label` explícito (no solo placeholder).
- Los menús desplegables (Card, Dropdown, UserMenu) se cierran con click fuera via listener en `document`.
- Los TabGroup usan `role="tablist"`, `role="tab"` y `role="tabpanel"`.

---

## 10. Estructura de archivos

```
src/
├── index.css                          # Tokens de diseño (@theme)
├── components/
│   ├── common/                        # Componentes reutilizables en toda la app
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   └── index.ts
│   │   ├── InputField/
│   │   │   ├── InputField.tsx
│   │   │   └── index.ts
│   │   ├── Dropdown/
│   │   │   ├── Dropdown.tsx
│   │   │   └── index.ts
│   │   ├── Card/
│   │   │   ├── Card.tsx               # ✅ Implementado
│   │   │   └── index.ts
│   │   ├── Modal/
│   │   │   ├── Modal.tsx              # ✅ Implementado
│   │   │   └── index.ts
│   │   ├── DataTable/
│   │   │   ├── DataTable.tsx          # ✅ Implementado
│   │   │   └── index.ts
│   │   ├── SearchInput/
<<<<<<< HEAD
│   │   │   ├── SearchInput.tsx
│   │   │   └── index.ts
│   │   ├── Button/
│   │   │   ├── Button.tsx
=======
│   │   │   ├── SearchInput.tsx        # ✅ Implementado
│   │   │   └── index.ts
│   │   ├── Badge/
│   │   │   ├── Badge.tsx
│   │   │   └── index.ts
│   │   ├── FilterTag/
│   │   │   ├── FilterTag.tsx
│   │   │   └── index.ts
│   │   ├── TabGroup/
│   │   │   ├── TabGroup.tsx
│   │   │   └── index.ts
│   │   ├── FileUploadZone/
│   │   │   ├── FileUploadZone.tsx
│   │   │   └── index.ts
│   │   ├── Navbar/
│   │   │   ├── Navbar.tsx
>>>>>>> 10b5977898ab6904ca69f942134ec61a80c703cb
│   │   │   └── index.ts
│   │   └── UserMenu/
│   │       ├── UserMenu.tsx
│   │       └── index.ts
│   └── features/                      # Componentes específicos de dominio
│       ├── dashboard/
│       │   └── StatCard.tsx           # ✅ Implementado
│       ├── projections/
│       │   ├── ProjectionCard.tsx
│       │   ├── VariablesCard.tsx
│       │   ├── ParamCard.tsx
│       │   └── ResultsCard.tsx
│       ├── reports/
│       │   └── ReportCard.tsx
│       ├── data/
│       │   ├── DataCard.tsx
│       │   ├── CSVPreviewTable.tsx
│       │   └── ColumnMapper.tsx
│       ├── charts/
│       │   ├── ChartCard.tsx
│       │   └── MapCard.tsx
│       └── auth/
│           └── LoginCard.tsx
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

---

## Resumen de estados de implementación

| Componente | Estado |
|---|---|
| Card | Implementado |
| Modal | Implementado |
| DataTable | Implementado |
| SearchInput | Implementado |
| StatCard | Implementado |
| Button | Planificado |
| InputField | Planificado |
| Dropdown | Planificado |
| Badge | Planificado |
| FilterTag | Planificado |
| TabGroup | Planificado |
| Navbar | Planificado |
| UserMenu | Planificado |
| FileUploadZone | Planificado |
| CSVPreviewTable | Planificado |
| ColumnMapper | Planificado |
| ChartCard | Planificado |
| MapCard | Planificado |
| ProjectionCard | Planificado |
| ReportCard | Planificado |
| DataCard | Planificado |
| VariablesCard | Planificado |
| ParamCard | Planificado |
| ResultsCard | Planificado |
| LoginCard | Planificado |
