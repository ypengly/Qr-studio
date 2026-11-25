import { useRef, useState } from 'react'
import { ImagePlus, Trash2, UploadCloud } from 'lucide-react'
import type { QRDesign } from '../../types/qr.types'
import type { UpdateDesign } from '../../hooks/useQRDesign'
import { ColorField, Slider, Toggle } from '../ui/Controls'
import { useToast } from '../ui/Toast'

const MAX_BYTES = 4 * 1024 * 1024
const ACCEPT = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'image/gif']

/** Downscale big uploads so saved designs stay light, keeping SVGs as-is. */
async function readLogo(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result))
    r.onerror = () => reject(new Error('Could not read the file'))
    r.readAsDataURL(file)
  })
  if (file.type === 'image/svg+xml') return dataUrl
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image()
    i.onload = () => resolve(i)
    i.onerror = () => reject(new Error('That file isn’t a valid image'))
    i.src = dataUrl
  })
  const MAX = 768
  const scale = Math.min(1, MAX / Math.max(img.width, img.height))
  if (scale === 1 && file.size < 400 * 1024) return dataUrl
  const c = document.createElement('canvas')
  c.width = Math.round(img.width * scale)
  c.height = Math.round(img.height * scale)
  c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height)
  return c.toDataURL('image/png')
}

export function QRLogoEditor({ design, update }: { design: QRDesign; update: UpdateDesign }) {
  const toast = useToast()
  const input = useRef<HTMLInputElement>(null)
  const [drag, setDrag] = useState(false)
  const logo = design.logo

  const setLogo = (patch: Partial<QRDesign['logo']>, key?: string) =>
    update((d) => ({ ...d, logo: { ...d.logo, ...patch } }), key)

  const handleFile = async (file?: File) => {
    if (!file) return
    if (!ACCEPT.includes(file.type)) return toast.error('Please upload a PNG, JPG, WebP, GIF or SVG image.')
    if (file.size > MAX_BYTES) return toast.error('That image is larger than 4 MB. Try a smaller file.')
    try {
      const src = await readLogo(file)
      setLogo({ src })
      toast.success('Logo added — error correction raised for reliable scanning.')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not load the image.')
    }
  }

  return (
    <div className="space-y-5">
      {!logo.src ? (
        <button
          type="button"
          onClick={() => input.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setDrag(true)
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDrag(false)
            void handleFile(e.dataTransfer.files[0])
          }}
          className={`flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed px-4 py-8 text-center transition ${
            drag ? 'border-brand-500 bg-brand-50' : 'border-ink-200 bg-ink-50/60 hover:border-brand-300 hover:bg-brand-50/50'
          }`}
        >
          <span className="grid h-11 w-11 place-items-center rounded-full bg-white text-brand-600 shadow-soft">
            <UploadCloud className="h-5 w-5" />
          </span>
          <span className="text-sm font-semibold text-ink-800">Drop a logo here, or click to browse</span>
          <span className="text-xs text-ink-400">PNG, JPG, WebP or SVG · up to 4 MB</span>
        </button>
      ) : (
        <div className="flex items-center gap-4 rounded-2xl border border-ink-100 bg-ink-50/60 p-3">
          <span className="checker grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl border border-ink-100">
            <img src={logo.src} alt="Uploaded logo" className="max-h-full max-w-full object-contain" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-ink-800">Logo in the center</p>
            <div className="mt-2 flex gap-2">
              <button className="btn-secondary !px-3 !py-1.5 text-xs" onClick={() => input.current?.click()}>
                <ImagePlus className="h-3.5 w-3.5" /> Replace
              </button>
              <button
                className="btn-ghost !px-3 !py-1.5 text-xs text-rose-600 hover:bg-rose-50"
                onClick={() => setLogo({ src: null })}
              >
                <Trash2 className="h-3.5 w-3.5" /> Remove
              </button>
            </div>
          </div>
        </div>
      )}
      <input
        ref={input}
        type="file"
        accept={ACCEPT.join(',')}
        className="sr-only"
        onChange={(e) => {
          void handleFile(e.target.files?.[0])
          e.target.value = ''
        }}
      />

      {logo.src && (
        <div className="animate-fade-up space-y-5">
          <Slider
            label="Logo size"
            value={Math.round(logo.size * 100)}
            min={10}
            max={35}
            format={(v) => `${v}%`}
            onChange={(v) => setLogo({ size: v / 100 }, 'logo-size')}
          />
          <Toggle
            checked={logo.backing}
            onChange={(backing) => setLogo({ backing })}
            label="Logo backing"
            hint="A solid plate behind the logo keeps the code readable."
          />
          {logo.backing && (
            <ColorField label="Backing colour" value={logo.backingColor} onChange={(v) => setLogo({ backingColor: v }, 'logo-bg')} />
          )}
          <Toggle checked={logo.rounded} onChange={(rounded) => setLogo({ rounded })} label="Rounded container" />
        </div>
      )}
    </div>
  )
}
