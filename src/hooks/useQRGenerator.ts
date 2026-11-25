import { useEffect, useState } from 'react'
import type { QRDesign, QRMeta } from '../types/qr.types'
import { PREVIEW_COMPOSITE, renderComposite } from '../services/qr.service'

/**
 * Renders the live preview with the exact same compositor the exports use,
 * so what you see is what you download. Debounced to keep dragging smooth.
 */
export function useQRPreview(payload: string, design: QRDesign, meta: QRMeta, size = 900) {
  const [url, setUrl] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const key = JSON.stringify([payload, design, meta.title, meta.description, size])

  useEffect(() => {
    let cancelled = false
    setBusy(true)
    const t = window.setTimeout(async () => {
      try {
        const canvas = await renderComposite(payload, design, meta, { size, ...PREVIEW_COMPOSITE })
        if (cancelled) return
        setUrl(canvas.toDataURL('image/png'))
        setError(null)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Could not render QR code')
      } finally {
        if (!cancelled) setBusy(false)
      }
    }, 90)
    return () => {
      cancelled = true
      window.clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return { url, busy, error }
}
