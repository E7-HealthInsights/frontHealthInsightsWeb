import { useState } from 'react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

// html2canvas no soporta oklch (Tailwind v4). Solución: antes de capturar
// reemplazamos oklch → rgb en todos los <style> del DOM usando el motor de
// colores del propio browser (vía canvas 1x1), y los restauramos al terminar.

let _cvs: HTMLCanvasElement | null = null
let _ctx: CanvasRenderingContext2D | null = null

function oklchToRgb(oklch: string): string {
  if (!_cvs) {
    _cvs         = document.createElement('canvas')
    _cvs.width   = _cvs.height = 1
    _ctx         = _cvs.getContext('2d')
  }
  if (!_ctx) return oklch
  _ctx.clearRect(0, 0, 1, 1)
  _ctx.fillStyle = oklch
  _ctx.fillRect(0, 0, 1, 1)
  const [r, g, b, a] = _ctx.getImageData(0, 0, 1, 1).data
  return a === 0 ? 'transparent' : `rgb(${r}, ${g}, ${b})`
}

async function capturar(elemento: HTMLElement, opts: Parameters<typeof html2canvas>[1]): Promise<HTMLCanvasElement> {
  const styleEls  = Array.from(document.querySelectorAll('style'))
  const origTexts = styleEls.map(el => el.textContent ?? '')

  styleEls.forEach(el => {
    el.textContent = (el.textContent ?? '').replace(/oklch\([^)]*\)/g, oklchToRgb)
  })

  try {
    return await html2canvas(elemento, opts)
  } finally {
    styleEls.forEach((el, i) => { el.textContent = origTexts[i] })
  }
}

export function useGenerarPDF() {
  const [generando, setGenerando] = useState(false)

  const generar = async (elemento: HTMLElement, titulo: string) => {
    setGenerando(true)
    try {
      const canvas = await capturar(elemento, {
        scale:           2,
        useCORS:         true,
        backgroundColor: '#ffffff',
        logging:         false,
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf     = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = pdf.internal.pageSize.getHeight()
      const ratio = canvas.width / canvas.height
      const imgH  = pageW / ratio

      pdf.addImage(imgData, 'PNG', 0, 0, pageW, imgH > pageH ? pageH : imgH)
      pdf.save(`${titulo}_${new Date().toLocaleDateString('es-MX').replace(/\//g, '-')}.pdf`)
    } catch (err) {
      console.error('[useGenerarPDF] Error al generar PDF:', err)
    } finally {
      setGenerando(false)
    }
  }

  return { generar, generando }
}
