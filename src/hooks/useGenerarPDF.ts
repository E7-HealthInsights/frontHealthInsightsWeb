import { useState } from 'react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

// html2canvas no soporta oklch/oklab (Tailwind v4). El problema tiene dos focos:
// 1. Los <style> tags contienen variables definidas con oklch/oklab.
// 2. getComputedStyle() devuelve valores en oklab (espacio interno de Chromium),
//    que html2canvas intenta parsear y falla.
// Solución: reemplazar en <style> tags Y pre-resolver colores computados a inline rgb.

let _cvs: HTMLCanvasElement | null = null
let _ctx: CanvasRenderingContext2D | null = null

function oklchToRgb(color: string): string {
  if (!_cvs) {
    _cvs       = document.createElement('canvas')
    _cvs.width = _cvs.height = 1
    _ctx       = _cvs.getContext('2d', { willReadFrequently: true })
  }
  if (!_ctx) return color
  _ctx.clearRect(0, 0, 1, 1)
  _ctx.fillStyle = color
  _ctx.fillRect(0, 0, 1, 1)
  const [r, g, b, a] = _ctx.getImageData(0, 0, 1, 1).data
  return a === 0 ? 'transparent' : `rgb(${r}, ${g}, ${b})`
}

const COLOR_PROPS = [
  'color', 'background-color',
  'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
  'outline-color', 'text-decoration-color', 'caret-color', 'fill', 'stroke',
] as const

function resolveComputedColors(root: HTMLElement): () => void {
  const snapshots: Array<{ el: HTMLElement; prop: string; prev: string }> = []
  const elements = [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))]

  for (const el of elements) {
    const cs = getComputedStyle(el)
    for (const prop of COLOR_PROPS) {
      const value = cs.getPropertyValue(prop)
      if (/ok(?:lch|lab)\(/i.test(value)) {
        snapshots.push({ el, prop, prev: el.style.getPropertyValue(prop) })
        el.style.setProperty(prop, oklchToRgb(value))
      }
    }
  }

  return () => {
    for (const { el, prop, prev } of snapshots) {
      if (prev) el.style.setProperty(prop, prev)
      else el.style.removeProperty(prop)
    }
  }
}

async function capturar(elemento: HTMLElement, opts: Parameters<typeof html2canvas>[1]): Promise<HTMLCanvasElement> {
  const styleEls  = Array.from(document.querySelectorAll('style'))
  const origTexts = styleEls.map(el => el.textContent ?? '')
  styleEls.forEach(el => {
    el.textContent = (el.textContent ?? '').replace(/ok(?:lch|lab)\([^)]*\)/g, oklchToRgb)
  })

  const restoreColors = resolveComputedColors(elemento)

  try {
    return await html2canvas(elemento, opts)
  } finally {
    styleEls.forEach((el, i) => { el.textContent = origTexts[i] })
    restoreColors()
  }
}

// Devuelve los Y en píxeles de canvas donde empieza cada bloque hijo (2 niveles).
// Estos son los únicos puntos seguros para cortar sin partir un componente.
function getBreakCandidates(root: HTMLElement, canvasScale: number): number[] {
  const rootTop = root.getBoundingClientRect().top
  const set     = new Set<number>()

  root.querySelectorAll<HTMLElement>(':scope > *, :scope > * > *').forEach(el => {
    const top = (el.getBoundingClientRect().top - rootTop) * canvasScale
    if (top > 0) set.add(Math.round(top))
  })

  return [...set].sort((a, b) => a - b)
}

// Divide el canvas en slices cortando siempre al inicio de un bloque hijo,
// nunca en medio de un componente. Si un componente es más alto que una página
// completa no hay forma de evitar el corte y se cae al límite duro.
function buildPageSlices(
  canvasHeight: number,
  pageHeightPx: number,
  candidates: number[],
): Array<{ start: number; end: number }> {
  const slices: Array<{ start: number; end: number }> = []
  let cursor = 0

  while (cursor < canvasHeight) {
    const idealEnd = cursor + pageHeightPx

    if (idealEnd >= canvasHeight) {
      slices.push({ start: cursor, end: canvasHeight })
      break
    }

    // Último inicio de componente que cabe en esta página (excluye el borde exacto
    // para no generar una página vacía si el componente empieza justo ahí).
    const smartBreak = [...candidates]
      .filter(c => c > cursor && c < idealEnd)
      .at(-1) ?? idealEnd

    slices.push({ start: cursor, end: smartBreak })
    cursor = smartBreak
  }

  return slices
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

      const pdf   = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = pdf.internal.pageSize.getHeight()

      const pxPerMm      = canvas.width / pageW
      const pageHeightPx = pageH * pxPerMm
      const canvasScale  = canvas.width / elemento.offsetWidth

      const candidates = getBreakCandidates(elemento, canvasScale)
      const slices     = buildPageSlices(canvas.height, pageHeightPx, candidates)

      for (let i = 0; i < slices.length; i++) {
        if (i > 0) pdf.addPage()

        const { start, end } = slices[i]
        const sliceH = end - start

        const sliceCanvas   = document.createElement('canvas')
        sliceCanvas.width   = canvas.width
        sliceCanvas.height  = sliceH
        const ctx           = sliceCanvas.getContext('2d')!
        ctx.drawImage(canvas, 0, start, canvas.width, sliceH, 0, 0, canvas.width, sliceH)

        pdf.addImage(sliceCanvas.toDataURL('image/png'), 'PNG', 0, 0, pageW, sliceH / pxPerMm)
      }

      pdf.save(`${titulo}_${new Date().toLocaleDateString('es-MX').replace(/\//g, '-')}.pdf`)
    } catch (err) {
      console.error('[useGenerarPDF] Error al generar PDF:', err)
    } finally {
      setGenerando(false)
    }
  }

  return { generar, generando }
}
