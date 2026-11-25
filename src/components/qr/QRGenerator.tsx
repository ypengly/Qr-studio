import { useMemo, useState } from 'react'
import { Copy, Download, ImageDown, Redo2, RotateCcw, Save, Undo2, FileText } from 'lucide-react'
import type { ContentData, ContentType, EditorDoc } from '../../types/qr.types'
import type { DesignController } from '../../hooks/useQRDesign'
import type { SavedController } from '../../hooks/useSavedQR'
import { useQRPreview } from '../../hooks/useQRGenerator'
import { copyImageToClipboard } from '../../services/export.service'
import { SAMPLE_PAYLOAD } from '../../utils/qrContent'
import { scanWarnings, validateContent } from '../../utils/validation'
import { ContentForm } from '../editor/ContentForm'
import { ContentTypeSelector } from '../editor/ContentTypeSelector'
import { DesignPanel } from '../editor/DesignPanel'
import { Field, Section } from '../ui/Controls'
import { useToast } from '../ui/Toast'
import { QRExportDialog } from './QRExportDialog'
import { QRPreview } from './QRPreview'

interface Props {
  doc: EditorDoc
  setDoc: React.Dispatch<React.SetStateAction<EditorDoc>>
  design: DesignController
  library: SavedController
  onSaved: () => void
}

export function QRGenerator({ doc, setDoc, design, library, onSaved }: Props) {
  const toast = useToast()
  const [exporting, setExporting] = useState(false)
  const [saving, setSaving] = useState(false)

  const check = useMemo(() => validateContent(doc.type, doc.content), [doc.type, doc.content])
  const ready = check.valid
  const payload = ready ? check.payload : SAMPLE_PAYLOAD
  const meta = useMemo(
    () => ({ title: doc.name.trim(), description: doc.description.trim() }),
    [doc.name, doc.description],
  )

  const preview = useQRPreview(payload, design.design, ready ? meta : { title: '', description: '' })
  const warnings = useMemo(() => scanWarnings(design.design), [design.design])

  const onContent = <K extends ContentType>(type: K, patch: Partial<ContentData[K]>) =>
    setDoc((d) => ({ ...d, content: { ...d.content, [type]: { ...d.content[type], ...patch } } }))

  const requireReady = () => {
    if (ready) return true
    toast.error(Object.values(check.errors)[0] ?? 'Enter your content first to generate a QR code.')
    return false
  }

  const save = async () => {
    if (!requireReady()) return
    setSaving(true)
    try {
      const rec = await library.save(doc, design.design, check.payload)
      setDoc((d) => ({ ...d, id: rec.id, name: d.name }))
      toast.success(doc.id ? 'Design updated in your library.' : 'Saved to your library.')
      onSaved()
    } catch {
      toast.error('Could not save. Your browser may be blocking local storage.')
    } finally {
      setSaving(false)
    }
  }

  const copyContent = async () => {
    if (!requireReady()) return
    try {
      await navigator.clipboard.writeText(check.payload)
      toast.success('QR content copied.')
    } catch {
      toast.error('Copy failed — your browser blocked clipboard access.')
    }
  }

  const copyImage = async () => {
    if (!requireReady()) return
    try {
      await copyImageToClipboard(check.payload, design.design, meta)
      toast.success('QR image copied to clipboard.')
    } catch {
      toast.error('Image copy isn’t supported here — use Download instead.')
    }
  }

  const openExport = () => requireReady() && setExporting(true)

  const toolbarBtn = 'btn-ghost !px-2.5 !py-2 disabled:opacity-30'

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] xl:gap-8">
      {/* ================= Left: configuration ================= */}
      <div className="order-1 min-w-0 space-y-4 lg:col-start-1 lg:row-start-1">
        <section className="card p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-display text-lg font-bold text-ink-900">What should it open?</h2>
          </div>
          <ContentTypeSelector
            value={doc.type}
            onChange={(type) => setDoc((d) => ({ ...d, type }))}
          />
          <div className="mt-5 border-t border-ink-100 pt-5">
            <ContentForm type={doc.type} content={doc.content} errors={check.errors} onChange={onContent} />
          </div>
        </section>

        <Section title="Name & details" icon={<FileText className="h-4 w-4" />}>
          <Field label="QR name" hint="Shown under the code. Examples: My Portfolio, Office Wi-Fi, Restaurant Menu.">
            <input
              className="input"
              maxLength={60}
              placeholder="My Portfolio"
              value={doc.name}
              onChange={(e) => setDoc((d) => ({ ...d, name: e.target.value }))}
            />
          </Field>
          <Field label="Description (optional)">
            <textarea
              className="input min-h-[72px] resize-y"
              maxLength={140}
              placeholder="A short note shown beneath the title"
              value={doc.description}
              onChange={(e) => setDoc((d) => ({ ...d, description: e.target.value }))}
            />
          </Field>
          <Field label="Category">
            <input
              className="input"
              list="qr-categories"
              maxLength={30}
              placeholder="General"
              value={doc.category}
              onChange={(e) => setDoc((d) => ({ ...d, category: e.target.value }))}
            />
            <datalist id="qr-categories">
              {library.categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>
        </Section>
      </div>

      {/* Design studio sits below on desktop, after the preview on phones */}
      <div className="order-3 min-w-0 space-y-4 pb-24 lg:col-start-1 lg:row-start-2 lg:pb-0">
        <div className="flex items-center justify-between px-1 pt-2">
          <h2 className="font-display text-lg font-bold text-ink-900">Design studio</h2>
          <div className="flex items-center gap-0.5">
            <button className={toolbarBtn} onClick={design.undo} disabled={!design.canUndo} title="Undo" aria-label="Undo">
              <Undo2 className="h-4 w-4" />
            </button>
            <button className={toolbarBtn} onClick={design.redo} disabled={!design.canRedo} title="Redo" aria-label="Redo">
              <Redo2 className="h-4 w-4" />
            </button>
            <button
              className="btn-ghost !px-3 !py-2 text-xs"
              onClick={() => {
                design.reset()
                toast.info('Design reset. You can undo this.')
              }}
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </button>
          </div>
        </div>
        <DesignPanel ctrl={design} />
      </div>

      {/* ================= Right: live preview ================= */}
      <aside className="order-2 min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1">
        <div className="space-y-4 lg:sticky lg:top-24">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-display text-lg font-bold text-ink-900">Live preview</h2>
            {doc.id && (
              <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-bold text-brand-700">
                Editing saved design
              </span>
            )}
          </div>

          <QRPreview
            url={preview.url}
            busy={preview.busy}
            error={preview.error}
            isSample={!ready}
            warnings={ready ? warnings : []}
            transparent={design.design.background.mode === 'transparent' && !design.design.frame.enabled}
          />

          <div className="hidden gap-2.5 lg:grid lg:grid-cols-2">
            <button className="btn-primary col-span-2 !py-3" onClick={openExport}>
              <Download className="h-4 w-4" /> Download
            </button>
            <button className="btn-secondary" onClick={save} disabled={saving}>
              <Save className="h-4 w-4" /> {doc.id ? 'Update design' : 'Save design'}
            </button>
            <button className="btn-secondary" onClick={copyContent}>
              <Copy className="h-4 w-4" /> Copy content
            </button>
            <button className="btn-ghost col-span-2 text-xs" onClick={copyImage}>
              <ImageDown className="h-4 w-4" /> Copy image to clipboard
            </button>
          </div>
        </div>
      </aside>

      {/* ================= Mobile action bar ================= */}
      <div className="fixed inset-x-0 bottom-[60px] z-40 border-t border-ink-100 bg-white/90 px-4 py-2.5 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-xl gap-2">
          <button className="btn-secondary flex-1" onClick={save} disabled={saving} aria-label="Save design">
            <Save className="h-4 w-4" /> Save
          </button>
          <button className="btn-secondary !px-3" onClick={copyContent} aria-label="Copy content">
            <Copy className="h-4 w-4" />
          </button>
          <button className="btn-primary flex-[1.4]" onClick={openExport}>
            <Download className="h-4 w-4" /> Download
          </button>
        </div>
      </div>

      <QRExportDialog
        open={exporting}
        onClose={() => setExporting(false)}
        payload={check.payload}
        design={design.design}
        meta={meta}
      />
    </div>
  )
}
