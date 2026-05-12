import { useState, useRef, useCallback } from 'react'
import Modal from '../../common/Modal'
import Button from '../..//common/Button'
import InputField from '../..//common/InputField'
import Dropdown from '../..//common/Dropdown'
import type { UploadDatasetPayload } from '../../../services/datasetService'

// ─── Types ──────────────────────────────────────────────────────────────────

interface ParsedCSV {
  headers: string[]
  rows: string[][]
}

interface ColumnMapping {
  originalName: string
  displayName: string
  sqlType: string
  unidad: string
  aiSuggested: boolean
}

interface DatasetMetadata {
  title: string
  description: string
  source: string
}

interface UploadDatasetModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (payload: UploadDatasetPayload) => Promise<void>
  uploadError?: string
}

// ─── Constants ───────────────────────────────────────────────────────────────

const SQL_TYPE_OPTIONS = [
  { value: 'VARCHAR(255)', label: 'VARCHAR(255) — Texto corto' },
  { value: 'TEXT',         label: 'TEXT — Texto largo' },
  { value: 'INT',          label: 'INT — Número entero' },
  { value: 'BIGINT',       label: 'BIGINT — Número entero grande' },
  { value: 'DECIMAL(10,2)',label: 'DECIMAL(10,2) — Número decimal' },
  { value: 'FLOAT',        label: 'FLOAT — Número flotante' },
  { value: 'DOUBLE',       label: 'DOUBLE — Doble precisión' },
  { value: 'BOOLEAN',      label: 'BOOLEAN — Verdadero/Falso' },
  { value: 'DATE',         label: 'DATE — Fecha' },
  { value: 'DATETIME',     label: 'DATETIME — Fecha y hora' },
  { value: 'TIMESTAMP',    label: 'TIMESTAMP — Marca de tiempo' },
  { value: 'JSON',         label: 'JSON — Objeto JSON' },
]

const EMPTY_METADATA: DatasetMetadata = { title: '', description: '', source: '' }

// ─── CSV Parser ───────────────────────────────────────────────────────────────

function parseCSV(text: string, maxRows = 5): ParsedCSV {
  const lines = text.trim().split('\n').filter(Boolean)
  if (lines.length === 0) return { headers: [], rows: [] }

  const parseRow = (line: string): string[] => {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        inQuotes = !inQuotes
      } else if (ch === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += ch
      }
    }
    result.push(current.trim())
    return result
  }

  const headers = parseRow(lines[0])
  const rows = lines.slice(1, maxRows + 1).map(parseRow)
  return { headers, rows }
}

// ─── AI suggestion loader ─────────────────────────────────────────────────────

async function fetchAISuggestions(
  headers: string[],
  sampleRows: string[][]
): Promise<Record<string, { sqlType: string; unidad: string | null }>> {
  const sampleText = [headers.join(','), ...sampleRows.map(r => r.join(','))].join('\n')

  const prompt = `Eres un experto en bases de datos SQL. Analiza este fragmento de CSV y para cada columna sugiere:
1. El tipo de dato SQL mas adecuado
2. La unidad de medida si aplica (solo para columnas numericas con unidad clara)

CSV:
${sampleText}

Responde UNICAMENTE con un objeto JSON valido donde la clave es el nombre exacto de la columna y el valor es un objeto con:
- "sqlType": uno de estos exactamente: VARCHAR(255), TEXT, INT, BIGINT, DECIMAL(10,2), FLOAT, DOUBLE, BOOLEAN, DATE, DATETIME, TIMESTAMP, JSON
- "unidad": string con la unidad (ej: "%", "años", "MXN", "millones de personas") o null si no aplica

No incluyas ningun texto extra, solo el JSON.`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  const data = await response.json()
  const text = data.content?.find((b: { type: string }) => b.type === 'text')?.text ?? ''
  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}

// ─── Step 1: Upload ──────────────────────────────────────────────────────────

function UploadStep({
  metadata,
  onMetadataChange,
  onFileSelected,
}: {
  metadata: DatasetMetadata
  onMetadataChange: (field: keyof DatasetMetadata, value: string) => void
  onFileSelected: (file: File) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => inputRef.current?.click()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onFileSelected(file)
  }

  const handleDragOver = (e: React.DragEvent) => e.preventDefault()

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) onFileSelected(file)
  }

  // La zona de upload se habilita solo cuando hay título
  const canUpload = metadata.title.trim() !== ''

  return (
    <div className="flex flex-col gap-4">

      {/* ── Título ── */}
      <InputField
        label="Título"
        placeholder="Ej: ENSANUT 2024"
        value={metadata.title}
        onChange={v => onMetadataChange('title', v)}
      />

      {/* ── Descripción (textarea manual; InputField solo soporta <input>) ── */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-[var(--color-hi-text-sub)]">
          Descripción
        </label>
        <textarea
          value={metadata.description}
          onChange={e => onMetadataChange('description', e.target.value)}
          placeholder="Describe el contenido y alcance del dataset..."
          rows={3}
          className="
            w-full rounded-[var(--radius-md)]
            border border-[var(--color-hi-border)]
            bg-[var(--color-hi-surface)]
            px-3 py-2 text-sm resize-none
            text-[var(--color-hi-text-main)]
            placeholder:text-[var(--color-hi-text-hint)]
            focus:outline-none
            focus:border-[var(--color-hi-border-focus)]
            focus:ring-2 focus:ring-[var(--color-hi-primary)]/20
            transition-colors
          "
        />
      </div>

      {/* ── Fuente ── */}
      <InputField
        label="Fuente"
        placeholder="Ej: INEGI, SSA, INSP"
        value={metadata.source}
        onChange={v => onMetadataChange('source', v)}
      />

      {/* ── Archivo CSV ── */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-[var(--color-hi-text-sub)]">
          Archivo CSV
        </label>

        <div
          onDragOver={canUpload ? handleDragOver : undefined}
          onDrop={canUpload ? handleDrop : undefined}
          onClick={canUpload ? handleClick : undefined}
          onKeyDown={canUpload ? e => e.key === 'Enter' && handleClick() : undefined}
          role={canUpload ? 'button' : undefined}
          tabIndex={canUpload ? 0 : undefined}
          aria-disabled={!canUpload}
          aria-label="Zona de carga de archivo CSV"
          className={`
            flex flex-col items-center justify-center gap-2
            w-full border-2 border-dashed rounded-[var(--radius-lg)]
            px-8 py-8 transition-colors
            ${canUpload
              ? 'border-[var(--color-hi-border)] text-[var(--color-hi-text-sub)] hover:border-[var(--color-hi-primary)] hover:bg-[var(--color-hi-primary-soft)] hover:text-[var(--color-hi-primary-dark)] cursor-pointer group'
              : 'border-[var(--color-hi-border)] text-[var(--color-hi-text-hint)] opacity-50 cursor-not-allowed select-none'
            }
          `}
        >
          <svg
            width="32" height="32" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true"
            className={canUpload ? 'group-hover:scale-110 transition-transform' : ''}
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <div className="text-center">
            <p className="text-sm font-medium">
              {canUpload ? 'Arrastra tu archivo aquí' : 'Completa el título primero'}
            </p>
            {canUpload && (
              <p className="text-xs opacity-70 mt-0.5">o haz click para seleccionar</p>
            )}
          </div>
          {canUpload && (
            <span className="text-xs text-[var(--color-hi-text-hint)]">
              Formatos aceptados: CSV (Máx. 50MB)
            </span>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileChange}
          className="hidden"
          aria-hidden="true"
        />
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function UploadDatasetModal({
  isOpen,
  onClose,
  onConfirm,
  uploadError = '',
}: UploadDatasetModalProps) {
  const [step, setStep] = useState<'upload' | 'configure'>('upload')
  const [metadata, setMetadata] = useState<DatasetMetadata>(EMPTY_METADATA)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [parsedCSV, setParsedCSV] = useState<ParsedCSV | null>(null)
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([])
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const [confirming, setConfirming] = useState(false)

  const handleMetadataChange = (field: keyof DatasetMetadata, value: string) => {
    setMetadata(prev => ({ ...prev, [field]: value }))
  }

  const handleFileSelected = useCallback(async (file: File) => {
    setUploadedFile(file)
    const text = await file.text()
    const parsed = parseCSV(text, 5)
    setParsedCSV(parsed)

    const initialMappings: ColumnMapping[] = parsed.headers.map(h => ({
      originalName: h,
      displayName: h,
      sqlType: 'VARCHAR(255)',
      unidad: '',
      aiSuggested: false,
    }))
    setColumnMappings(initialMappings)
    setStep('configure')

    if (parsed.headers.length > 0) {
      setAiLoading(true)
      setAiError('')
      try {
        const suggestions = await fetchAISuggestions(parsed.headers, parsed.rows)
        setColumnMappings(prev =>
          prev.map(m => {
            const s = suggestions[m.originalName]
            if (!s) return m
            return {
            ...m,
              sqlType:     s.sqlType ?? m.sqlType,
              unidad:      s.unidad  ?? '',
              aiSuggested: true,
            }
          })
        )
      } catch {
        setAiError('No se pudieron obtener sugerencias automaticas de tipos SQL.')
      } finally {
        setAiLoading(false)
      }
    }
  }, [])

  const updateMapping = (
    index: number,
    field: 'displayName' | 'sqlType' | 'unidad',
    value: string
  ) => {
    setColumnMappings(prev =>
      prev.map((m, i) =>
        i === index
          ? { ...m, [field]: value, ...(field === 'sqlType' ? { aiSuggested: false } : {}) }
          : m
      )
    )
  }

  const handleConfirm = async () => {
    if (!uploadedFile) return
    setConfirming(true)
    try {
      await onConfirm({
        file:        uploadedFile,
        nombre:      metadata.title,
        descripcion: metadata.description,
        fuente:      metadata.source,
        columnMappings: columnMappings.map(m => ({
          originalName: m.originalName,
          displayName:  m.displayName,
          sqlType:      m.sqlType,
          unidad:       m.unidad.trim() || undefined,
        })),
      })
      handleClose()
    } finally {
      setConfirming(false)
    }
  }

  const handleClose = () => {
    setStep('upload')
    setMetadata(EMPTY_METADATA)
    setUploadedFile(null)
    setParsedCSV(null)
    setColumnMappings([])
    setAiLoading(false)
    setAiError('')
    onClose()
  }

  const handleBack = () => {
    setStep('upload')
    setUploadedFile(null)
    setParsedCSV(null)
    setColumnMappings([])
    setAiLoading(false)
    setAiError('')
    // metadata se conserva al volver atrás para no perder lo que escribió
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Nuevo Dataset"
      subtitle="Sube un nuevo conjunto de datos a la plataforma"
      size="lg"
    >
      {step === 'upload' ? (
        <UploadStep
          metadata={metadata}
          onMetadataChange={handleMetadataChange}
          onFileSelected={handleFileSelected}
        />
      ) : (
        <ConfigureStep
          parsedCSV={parsedCSV!}
          columnMappings={columnMappings}
          aiLoading={aiLoading}
          aiError={aiError}
          uploadError={uploadError}
          confirming={confirming}
          onUpdateMapping={updateMapping}
          onBack={handleBack}
          onConfirm={handleConfirm}
        />
      )}
    </Modal>
  )
}

// ─── Step 2: Configure ───────────────────────────────────────────────────────

function ConfigureStep({
  parsedCSV,
  columnMappings,
  aiLoading,
  aiError,
  uploadError,
  confirming,
  onUpdateMapping,
  onBack,
  onConfirm,
}: {
  parsedCSV: ParsedCSV
  columnMappings: ColumnMapping[]
  aiLoading: boolean
  aiError: string
  uploadError: string
  confirming: boolean
  onUpdateMapping: (index: number, field: 'displayName' | 'sqlType' | 'unidad', value: string) => void
  onBack: () => void
  onConfirm: () => void
}) {
  return (
    <div className="flex flex-col gap-5">

      {/* ── Archivo confirmado ── */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-sm)] bg-[var(--color-hi-primary-soft)]">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="var(--color-hi-primary)" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
          className="shrink-0"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <span className="text-sm font-medium text-[var(--color-hi-primary-dark)]">
          Archivo subido correctamente
        </span>
      </div>

      {/* ── Vista previa CSV ── */}
      <div>
        <p className="text-xs font-semibold text-[var(--color-hi-text-sub)] uppercase tracking-wide mb-2">
          Vista previa del archivo
        </p>
        <div className="overflow-x-auto rounded-[var(--radius-md)] border border-[var(--color-hi-border)]">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[var(--color-hi-bg)] border-b border-[var(--color-hi-border)]">
                {parsedCSV.headers.map((h, i) => (
                  <th
                    key={i}
                    className="px-3 py-2 text-left font-semibold text-[var(--color-hi-text-sub)] whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {parsedCSV.rows.map((row, ri) => (
                <tr
                  key={ri}
                  className="border-b border-[var(--color-hi-border)] last:border-0 hover:bg-[var(--color-hi-bg)] transition-colors"
                >
                  {parsedCSV.headers.map((_, ci) => (
                    <td
                      key={ci}
                      className="px-3 py-2 text-[var(--color-hi-text-main)] whitespace-nowrap max-w-[160px] truncate"
                      title={row[ci] ?? ''}
                    >
                      {row[ci] ?? <span className="text-[var(--color-hi-text-hint)] italic">—</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Estado IA ── */}
      {aiLoading && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-sm)] border border-[var(--color-hi-border)] bg-[var(--color-hi-bg)]">
          <svg
            aria-hidden="true"
            className="animate-spin w-4 h-4 shrink-0 text-[var(--color-hi-primary)]"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          >
            <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
            <path d="M12 2a10 10 0 0 1 10 10" />
          </svg>
          <span className="text-xs text-[var(--color-hi-text-sub)]">
            Analizando columnas con IA para sugerir tipos SQL y unidades...
          </span>
        </div>
      )}

      {aiError && (
        <p className="text-xs text-[var(--color-hi-warning)]">{aiError}</p>
      )}

      {!aiLoading && !aiError && columnMappings.some(m => m.aiSuggested) && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-sm)] border border-[var(--color-hi-border)] bg-[var(--color-hi-bg)]">
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="var(--color-hi-primary)" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span className="text-xs text-[var(--color-hi-text-sub)]">
            Los tipos SQL y unidades fueron sugeridos automáticamente por IA. Puedes ajustarlos antes de confirmar.
          </span>
        </div>
      )}

      {/* ── Mapeo de columnas ── */}
      <div>
        <p className="text-sm text-[var(--color-hi-text-sub)] mb-3">
          Define el nombre, tipo y unidad de cada columna:
        </p>

        <div className="flex flex-col gap-3">
          {/* Headers — anchos fijos para que nunca se muevan */}
          <div className="grid gap-3" style={{ gridTemplateColumns: '1fr 1fr 140px 100px' }}>
            <span className="text-xs font-semibold text-[var(--color-hi-text-hint)] uppercase tracking-wide">
              Columna original
            </span>
            <span className="text-xs font-semibold text-[var(--color-hi-text-hint)] uppercase tracking-wide">
              Nombre para el sistema
            </span>
            <span className="text-xs font-semibold text-[var(--color-hi-text-hint)] uppercase tracking-wide flex items-center gap-1">
              Tipo SQL
              {aiLoading && (
                <svg
                  aria-label="Cargando sugerencias"
                  className="animate-spin w-3 h-3 text-[var(--color-hi-primary)]"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" />
                </svg>
              )}
            </span>
            <span className="text-xs font-semibold text-[var(--color-hi-text-hint)] uppercase tracking-wide">
              Unidad
            </span>
          </div>

          {columnMappings.map((mapping, index) => (
            <div
              key={mapping.originalName}
              className="grid gap-3 items-start"
              style={{ gridTemplateColumns: '1fr 1fr 140px 100px' }}
            >
              {/* Columna original — ancho fijo */}
              <div className="flex items-center h-[38px] px-3 rounded-[var(--radius-md)] border border-[var(--color-hi-border)] bg-[var(--color-hi-bg)] overflow-hidden">
                <span className="text-sm text-[var(--color-hi-text-sub)] truncate font-mono">
                  {mapping.originalName}
                </span>
              </div>

              {/* Nombre amigable */}
              <input
                type="text"
                value={mapping.displayName}
                onChange={e => onUpdateMapping(index, 'displayName', e.target.value)}
                placeholder={mapping.originalName}
                aria-label={`Nombre amigable para columna ${mapping.originalName}`}
                className="
                  h-[38px] w-full rounded-[var(--radius-md)]
                  border border-[var(--color-hi-border)]
                  bg-[var(--color-hi-surface)]
                  px-3 text-sm
                  text-[var(--color-hi-text-main)]
                  placeholder:text-[var(--color-hi-text-hint)]
                  focus:outline-none
                  focus:border-[var(--color-hi-border-focus)]
                  focus:ring-2 focus:ring-[var(--color-hi-primary)]/20
                  transition-colors
                "
              />

              {/* Tipo SQL — ancho fijo 140px, no empuja otras columnas */}
              <div className="relative w-[140px]">
                <Dropdown
                  options={SQL_TYPE_OPTIONS}
                  value={mapping.sqlType}
                  onChange={v => onUpdateMapping(index, 'sqlType', v)}
                  disabled={aiLoading}
                  className="w-full"
                />
                {mapping.aiSuggested && (
                  <span
                    title="Sugerido por IA"
                    className="
                      absolute -top-1.5 -right-1.5
                      w-4 h-4 rounded-full
                      bg-[var(--color-hi-primary)]
                      flex items-center justify-center
                      text-white text-[8px] font-bold
                      select-none pointer-events-none
                    "
                  >
                    IA
                  </span>
                )}
              </div>

              {/* Unidad — ancho fijo 100px, opcional */}
              <input
                type="text"
                value={mapping.unidad}
                onChange={e => onUpdateMapping(index, 'unidad', e.target.value)}
                placeholder="ej. %"
                maxLength={50}
                aria-label={`Unidad para columna ${mapping.originalName}`}
                className="
                  h-[38px] w-[100px] rounded-[var(--radius-md)]
                  border border-[var(--color-hi-border)]
                  bg-[var(--color-hi-surface)]
                  px-3 text-sm
                  text-[var(--color-hi-text-main)]
                  placeholder:text-[var(--color-hi-text-hint)]
                  focus:outline-none focus:border-[var(--color-hi-border-focus)]
                  focus:ring-2 focus:ring-[var(--color-hi-primary)]/20
                  transition-colors
                "
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Error de upload ── */}
      {uploadError && (
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-[var(--radius-sm)]
                        bg-red-50 border border-red-200">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="var(--color-hi-danger)" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true" className="shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="text-xs text-red-700 leading-relaxed">{uploadError}</p>
        </div>
      )}

      {/* ── Acciones ── */}
      <div className="flex justify-between items-center pt-2 border-t border-[var(--color-hi-border)]">
        <Button variant="secondary" onClick={onBack}>
          ← Volver
        </Button>
        <Button
          variant="primary"
          onClick={onConfirm}
          loading={confirming}
          disabled={aiLoading || columnMappings.some(m => !m.displayName.trim())}
        >
          Confirmar dataset
        </Button>
      </div>
    </div>
  )
}