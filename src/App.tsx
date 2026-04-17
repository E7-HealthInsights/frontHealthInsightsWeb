import './App.css'
import { useState } from 'react'
import GenerateReportButton from './components/common/GenerateReportButton/GenerateReportButton'

export default function App() {
  const [loading, setLoading] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [generatedReports, setGeneratedReports] = useState(0)

  const handleGenerateReport = () => {
    if (loading || disabled) return

    setLoading(true)
    window.setTimeout(() => {
      setGeneratedReports((current) => current + 1)
      setLoading(false)
    }, 1400)
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '2rem',
        background:
          'radial-gradient(circle at top left, #e8f3ff 0%, #f8fbff 35%, #ffffff 100%)',
      }}
    >
      <section
        style={{
          width: 'min(640px, 100%)',
          padding: '2rem',
          borderRadius: '1rem',
          border: '1px solid #dce8f7',
          backgroundColor: '#ffffff',
          boxShadow: '0 18px 42px rgba(7, 36, 70, 0.08)',
        }}
      >
        <p style={{ margin: 0, color: '#35516f', fontSize: '0.9rem', fontWeight: 700 }}>
          Demo para PR
        </p>
        <h1 style={{ marginTop: '0.5rem', marginBottom: '0.6rem', fontSize: '1.8rem' }}>
          GenerateReportButton
        </h1>
        <p style={{ marginTop: 0, marginBottom: '1.4rem', color: '#4a627f' }}>
          Usa los controles para validar estados del componente y su comportamiento de carga.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <button
            type="button"
            onClick={() => setDisabled((current) => !current)}
            style={{
              padding: '0.6rem 0.9rem',
              borderRadius: '0.65rem',
              border: '1px solid #b5cbe5',
              backgroundColor: '#f1f7ff',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {disabled ? 'Habilitar botón' : 'Deshabilitar botón'}
          </button>

          <button
            type="button"
            onClick={() => setLoading((current) => !current)}
            style={{
              padding: '0.6rem 0.9rem',
              borderRadius: '0.65rem',
              border: '1px solid #b5cbe5',
              backgroundColor: '#f1f7ff',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {loading ? 'Quitar loading' : 'Forzar loading'}
          </button>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <GenerateReportButton
            onClick={handleGenerateReport}
            loading={loading}
            disabled={disabled}
          />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '0.75rem',
          }}
        >
          <div style={{ background: '#f6faff', borderRadius: '0.75rem', padding: '0.75rem 0.9rem' }}>
            <p style={{ margin: 0, color: '#5b7692', fontSize: '0.82rem' }}>Estado actual</p>
            <p style={{ margin: '0.2rem 0 0', fontWeight: 700 }}>
              {disabled ? 'Deshabilitado' : loading ? 'Cargando...' : 'Listo'}
            </p>
          </div>

          <div style={{ background: '#f6faff', borderRadius: '0.75rem', padding: '0.75rem 0.9rem' }}>
            <p style={{ margin: 0, color: '#5b7692', fontSize: '0.82rem' }}>Reportes generados</p>
            <p style={{ margin: '0.2rem 0 0', fontWeight: 700 }}>{generatedReports}</p>
          </div>
        </div>
      </section>
    </main>
  )
}
