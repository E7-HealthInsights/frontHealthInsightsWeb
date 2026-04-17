import { useState, useRef, useCallback } from 'react'
import Modal from '../../common/Modal'
import Button from '../..//common/Button'
import InputField from '../..//common/InputField'
import Dropdown from '../..//common/Dropdown'

// ─── Types ──────────────────────────────────────────────────────────────────

interface ParsedCSV {
  headers: string[]
  rows: string[][]
}

interface ColumnMapping {
  originalName: string
  displayName: string
  sqlType: string
  aiSuggested: boolean
}

interface UploadDatasetModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (payload: {
    file: File
    columnMappings: ColumnMapping[]
  }) => void
}

// ─── Constants ───────────────────────────────────────────────────────────────

const SQL_TYPE_OPTIONS = [
  { value: 'VARCHAR(255)', label: 'VARCHAR(255) — Texto corto' },
  { value: 'TEXT',         label: 'TEXT — Texto largo' },
  { value: 'INT',          label: 'INT — Número entero' },
  { value: 'BIGINT',       label: 'BIGINT — Número entero grande' },
  { value: 'DECIMAL(10,2)',label: 'DECIMAL(10,2) — Número decimal' },
  { value: 'FLOAT',        label: 'FLOAT — Número flotante' },
  { value: 'BOOLEAN',      label: 'BOOLEAN — Verdadero/Falso' },
  { value: 'DATE',         label: 'DATE — Fecha' },
  { value: 'DATETIME',     label: 'DATETIME — Fecha y hora' },
  { value: 'TIMESTAMP',    label: 'TIMESTAMP — Marca de tiempo' },
  { value: 'JSON',         label: 'JSON — Objeto JSON' },
]

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

// ─── Sub-components ──────────────────────────────────────────────────────────

function UploadStep({
  onFileSelected,
}: {
  onFileSelected: (file: File) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => inputRef.current?.click()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onFileSelected(file)
  }

  return (
    <div className="flex flex-col items-center justify-center py-10 gap-5">
      <p className="text-sm text-[var(--color-hi-text-sub)] text-center max-w-xs">
        Sube un archivo <span className="font-semibold text-[var(--color-hi-text-main)]">.csv</span> para
        importarlo como dataset en el sistema.
      </p>

      <button
        type="button"
        onClick={handleClick}
        className="
          flex flex-col items-center justify-center gap-3
          w-full max-w-sm
          border-2 border-dashed border-[var(--color-hi-border)]
          rounded-[var(--radius-lg)]
          px-8 py-10
          text-[var(--color-hi-text-sub)]
          hover:border-[var(--color-hi-primary)]
          hover:bg-[var(--color-hi-primary-soft)]
          hover:text-[var(--color-hi-primary-dark)]
          transition-colors cursor-pointer
          group
        "
      >
        {/* Upload icon */}
        <svg
          width="40" height="40" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true"
          className="group-hover:scale-110 transition-transform"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <span className="text-sm font-medium">Seleccionar archivo CSV</span>
        <span className="text-xs opacity-70">Haz clic para abrir el explorador</span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={handleChange}
        className="hidden"
        aria-hidden="true"
      />
    </div>
  )
}

// ─── AI suggestion loader ─────────────────────────────────────────────────────

async function fetchAISuggestions(
  headers: string[],
  sampleRows: string[][]
): Promise<Record<string, string>> {
  const sampleText = [headers.join(','), ...sampleRows.map(r => r.join(','))].join('\n')

  const prompt = `Eres un experto en bases de datos SQL. Analiza este fragmento de CSV y sugiere el tipo de dato SQL más adecuado para cada columna.

CSV:
${sampleText}

Responde ÚNICAMENTE con un objeto JSON válido donde la clave es el nombre exacto de la columna y el valor es uno de estos tipos SQL exactamente como aparecen: VARCHAR(255), TEXT, INT, BIGINT, DECIMAL(10,2), FLOAT, BOOLEAN, DATE, DATETIME, TIMESTAMP, JSON

No incluyas ningún texto extra, solo el JSON.`

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

  // Strip markdown code fences if present
  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function UploadDatasetModal({
  isOpen,
  onClose,
  onConfirm,
}: UploadDatasetModalProps) {
  const [step, setStep] = useState<'upload' | 'configure'>('upload')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [parsedCSV, setParsedCSV] = useState<ParsedCSV | null>(null)
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([])
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const [confirming, setConfirming] = useState(false)

  const handleFileSelected = useCallback(async (file: File) => {
    setUploadedFile(file)

    const text = await file.text()
    const parsed = parseCSV(text, 5)
    setParsedCSV(parsed)

    // Initialize mappings with original names, default type VARCHAR
    const initialMappings: ColumnMapping[] = parsed.headers.map(h => ({
      originalName: h,
      displayName: h,
      sqlType: 'VARCHAR(255)',
      aiSuggested: false,
    }))
    setColumnMappings(initialMappings)
    setStep('configure')

    // Fire AI suggestion in background
    if (parsed.headers.length > 0) {
      setAiLoading(true)
      setAiError('')
      try {
        const suggestions = await fetchAISuggestions(parsed.headers, parsed.rows)
        setColumnMappings(prev =>
          prev.map(m => ({
            ...m,
            sqlType: suggestions[m.originalName] ?? m.sqlType,
            aiSuggested: !!suggestions[m.originalName],
          }))
        )
      } catch {
        setAiError('No se pudieron obtener sugerencias automáticas de tipos SQL.')
      } finally {
        setAiLoading(false)
      }
    }
  }, [])

  const updateMapping = (index: number, field: 'displayName' | 'sqlType', value: string) => {
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
      await onConfirm({ file: uploadedFile, columnMappings })
      handleClose()
    } finally {
      setConfirming(false)
    }
  }

  const handleClose = () => {
    setStep('upload')
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
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Cargar Dataset"
      subtitle={
        step === 'upload'
          ? 'Importa un archivo CSV al sistema'
          : uploadedFile?.name ?? ''
      }
      size="lg"
    >
      {step === 'upload' ? (
        <UploadStep onFileSelected={handleFileSelected} />
      ) : (
        <ConfigureStep
          parsedCSV={parsedCSV!}
          columnMappings={columnMappings}
          aiLoading={aiLoading}
          aiError={aiError}
          confirming={confirming}
          onUpdateMapping={updateMapping}
          onBack={handleBack}
          onConfirm={handleConfirm}
        />
      )}
    </Modal>
  )
}

// ─── Configure Step ──────────────────────────────────────────────────────────

function ConfigureStep({
  parsedCSV,
  columnMappings,
  aiLoading,
  aiError,
  confirming,
  onUpdateMapping,
  onBack,
  onConfirm,
}: {
  parsedCSV: ParsedCSV
  columnMappings: ColumnMapping[]
  aiLoading: boolean
  aiError: string
  confirming: boolean
  onUpdateMapping: (index: number, field: 'displayName' | 'sqlType', value: string) => void
  onBack: () => void
  onConfirm: () => void
}) {
  return (
    <div className="flex flex-col gap-5">

      {/* ── File uploaded confirmation banner ── */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-sm)] bg-[var(--color-hi-primary-soft)]">
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none"
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

      {/* ── CSV Preview Table ── */}
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

      {/* ── AI status ── */}
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
            Analizando columnas con IA para sugerir tipos SQL…
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
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span className="text-xs text-[var(--color-hi-text-sub)]">
            Los tipos SQL fueron sugeridos automáticamente por IA. Puedes ajustarlos antes de confirmar.
          </span>
        </div>
      )}

      {/* ── Column Mapping ── */}
      <div>
        <p className="text-sm text-[var(--color-hi-text-sub)] mb-3">
          Define el nombre de las columnas para el sistema:
        </p>

        <div className="flex flex-col gap-3">
          {/* Header row */}
          <div className="grid grid-cols-[1fr_1fr_1fr] gap-3">
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
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                >
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" />
                </svg>
              )}
            </span>
          </div>

          {columnMappings.map((mapping, index) => (
            <div
              key={mapping.originalName}
              className="grid grid-cols-[1fr_1fr_1fr] gap-3 items-start"
            >
              {/* Original column name (read-only) */}
              <div className="flex items-center h-[38px] px-3 rounded-[var(--radius-md)] border border-[var(--color-hi-border)] bg-[var(--color-hi-bg)] overflow-hidden">
                <span className="text-sm text-[var(--color-hi-text-sub)] truncate font-mono">
                  {mapping.originalName}
                </span>
              </div>

              {/* Display name input */}
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

              {/* SQL type dropdown with AI badge */}
              <div className="relative">
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
                      select-none
                    "
                  >
                    IA
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Actions ── */}
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