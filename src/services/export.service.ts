import { saveAs } from 'file-saver'
import type { ExportOptions, QRDesign, QRMeta } from '../types/qr.types'
import { renderComposite, renderQRSvg } from './qr.service'

export const DEFAULT_EXPORT: ExportOptions = {
  format: 'png',
  size: 2048,
  background: 'transparent',
  customBackground: '#ffffff',
  quality: 0.95,
  includeTitle: true,
  includeFrame: true,
  includeDescription: false,
}

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'qr-code'

const canvasToBlob = (c: HTMLCanvasElement, type: string, quality?: number) =>
  new Promise<Blob>((resolve, reject) =>
    c.toBlob((b) => (b ? resolve(b) : reject(new Error('Image encoding failed'))), type, quality),
  )

/** Resolve the page background colour for a given export. */
function pageBackground(o: ExportOptions): 'transparent' | string {
  if (o.format === 'jpg') {
    // JPG has no alpha channel, so transparency falls back to white.
    return o.background === 'custom' ? o.customBackground : '#ffffff'
  }
  if (o.background === 'transparent') return 'transparent'
  return o.background === 'custom' ? o.customBackground : '#ffffff'
}

export async function buildExportBlob(
  payload: string,
  design: QRDesign,
  meta: QRMeta,
  o: ExportOptions,
): Promise<{ blob: Blob; filename: string }> {
  const base = slug(meta.title)

  if (o.format === 'svg') {
    // Pure vector QR code (frame/labels are raster-only features).
    const blob = await renderQRSvg(payload, design)
    return { blob, filename: `${base}.svg` }
  }

  const canvas = await renderComposite(payload, design, meta, {
    size: o.size,
    includeTitle: o.includeTitle,
    includeDescription: o.includeDescription,
    includeFrame: o.includeFrame,
    pageBackground: pageBackground(o),
  })

  if (o.format === 'jpg') {
    return { blob: await canvasToBlob(canvas, 'image/jpeg', o.quality), filename: `${base}-${o.size}.jpg` }
  }
  return { blob: await canvasToBlob(canvas, 'image/png'), filename: `${base}-${o.size}.png` }
}

export async function downloadQR(payload: string, design: QRDesign, meta: QRMeta, o: ExportOptions) {
  const { blob, filename } = await buildExportBlob(payload, design, meta, o)
  saveAs(blob, filename)
  return filename
}

export async function copyImageToClipboard(payload: string, design: QRDesign, meta: QRMeta) {
  const canvas = await renderComposite(payload, design, meta, {
    size: 1024,
    includeTitle: true,
    includeDescription: false,
    includeFrame: true,
    pageBackground: '#ffffff',
  })
  const blob = await canvasToBlob(canvas, 'image/png')
  await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
}
