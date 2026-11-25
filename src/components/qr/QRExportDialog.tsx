import { useEffect, useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import type { ExportFormat, ExportOptions, QRDesign, QRMeta } from '../../types/qr.types'
import { DEFAULT_EXPORT, downloadQR } from '../../services/export.service'
import { ColorField, Modal, Segmented, Slider, Toggle } from '../ui/Controls'
import { useToast } from '../ui/Toast'

interface Props {
  open: boolean
  onClose: () => void
  payload: string
  design: QRDesign
  meta: QRMeta
}

export function QRExportDialog({ open, onClose, payload, design, meta }: Props) {
  const toast = useToast()
  const [o, setO] = useState<ExportOptions>(DEFAULT_EXPORT)
  const [busy, setBusy] = useState(false)

  // Remember choices while the dialog is closed, but make description toggle follow availability.
  useEffect(() => {
    if (!open) return
    setO((cur) => ({ ...cur, includeDescription: cur.includeDescription && Boolean(meta.description.trim()) }))
  }, [open, meta.description])

  const set = (patch: Partial<ExportOptions>) => setO((cur) => ({ ...cur, ...patch }))
  const isSvg = o.format === 'svg'
  const isJpg = o.format === 'jpg'

  const changeFormat = (format: ExportFormat) =>
    setO((cur) => ({
      ...cur,
      format,
      background: format === 'jpg' && cur.background === 'transparent' ? 'white' : cur.background,
    }))

  const go = async () => {
    setBusy(true)
    try {
      const name = await downloadQR(payload, design, meta, o)
      toast.success(`Downloaded ${name}`)
      onClose()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Export failed. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Download QR code">
      <div className="space-y-6 p-6">
        <div>
          <span className="label">Format</span>
          <Segmented<ExportFormat>
            value={o.format}
            onChange={changeFormat}
            options={[
              { value: 'png', label: 'PNG' },
              { value: 'jpg', label: 'JPG' },
              { value: 'svg', label: 'SVG' },
            ]}
          />
        </div>

        {!isSvg && (
          <div>
            <span className="label">Image size</span>
            <Segmented
              value={String(o.size) as '1024' | '2048' | '4096'}
              onChange={(v) => set({ size: Number(v) as ExportOptions['size'] })}
              options={[
                { value: '1024', label: '1024 px' },
                { value: '2048', label: '2048 px' },
                { value: '4096', label: '4096 px' },
              ]}
            />
            <p className="mt-1.5 text-xs text-ink-400">Width of the image. Height follows the layout so nothing is stretched.</p>
          </div>
        )}

        {!isSvg && (
          <div className="space-y-3">
            <span className="label">Background</span>
            <Segmented
              value={o.background}
              onChange={(background) => set({ background })}
              options={[
                ...(isJpg ? [] : [{ value: 'transparent' as const, label: 'Transparent' }]),
                { value: 'white' as const, label: 'White' },
                { value: 'custom' as const, label: 'Custom' },
              ]}
            />
            {o.background === 'custom' && (
              <ColorField value={o.customBackground} onChange={(customBackground) => set({ customBackground })} />
            )}
          </div>
        )}

        {isJpg && (
          <Slider
            label="JPG quality"
            value={Math.round(o.quality * 100)}
            min={50}
            max={100}
            format={(v) => `${v}%`}
            onChange={(v) => set({ quality: v / 100 })}
          />
        )}

        {isSvg ? (
          <p className="rounded-xl bg-brand-50 px-4 py-3 text-xs leading-relaxed text-brand-800">
            SVG exports the QR code itself as pure vector shapes — perfect for print at any size. Frame, label and
            title are available in PNG and JPG.
          </p>
        ) : (
          <div className="space-y-3.5 rounded-2xl bg-ink-50 p-4">
            <Toggle checked={o.includeTitle} onChange={(includeTitle) => set({ includeTitle })} label="Include title" />
            <Toggle
              checked={o.includeDescription}
              onChange={(includeDescription) => set({ includeDescription })}
              label="Include description"
              hint={meta.description.trim() ? undefined : 'Add a description in the editor first.'}
            />
            <Toggle
              checked={o.includeFrame}
              onChange={(includeFrame) => set({ includeFrame })}
              label="Include frame"
              hint="Frame, border and label."
            />
          </div>
        )}

        <button className="btn-primary w-full !py-3" onClick={go} disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {busy ? 'Rendering…' : `Download ${o.format.toUpperCase()}`}
        </button>
      </div>
    </Modal>
  )
}
