import { useState } from 'react'
import { Check, Copy, Download, Pencil, Trash2, X } from 'lucide-react'
import type { SavedQR } from '../../types/qr.types'
import { TYPE_LABELS } from '../../utils/qrContent'
import { TYPE_ICONS } from '../editor/ContentTypeSelector'

interface Props {
  item: SavedQR
  categories: string[]
  onEdit: (i: SavedQR) => void
  onDownload: (i: SavedQR) => void
  onDuplicate: (i: SavedQR) => void
  onDelete: (i: SavedQR) => void
  onRename: (i: SavedQR, name: string) => void
  onCategory: (i: SavedQR, category: string) => void
}

const fmt = (t: number) =>
  new Date(t).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })

export function SavedQRCard({ item, categories, onEdit, onDownload, onDuplicate, onDelete, onRename, onCategory }: Props) {
  const [renaming, setRenaming] = useState(false)
  const [name, setName] = useState(item.name)
  const Icon = TYPE_ICONS[item.type]

  const commit = () => {
    const v = name.trim()
    if (v && v !== item.name) onRename(item, v)
    else setName(item.name)
    setRenaming(false)
  }

  const act = 'grid h-9 w-9 place-items-center rounded-lg text-ink-500 transition hover:bg-ink-100 hover:text-ink-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200'

  return (
    <article className="card group flex animate-fade-up flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lift">
      <button
        onClick={() => onEdit(item)}
        className="relative grid aspect-square place-items-center bg-gradient-to-br from-ink-50 to-brand-50/50 p-5 pt-12"
        aria-label={`Edit ${item.name}`}
      >
        <img src={item.thumbnail} alt={`QR code: ${item.name}`} className="max-h-full rounded-xl object-contain shadow-soft" />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-ink-600 shadow-sm backdrop-blur">
          <Icon className="h-3 w-3 text-brand-600" /> {TYPE_LABELS[item.type]}
        </span>
      </button>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          {renaming ? (
            <div className="flex items-center gap-1.5">
              <input
                autoFocus
                className="input !py-1.5 text-sm font-bold"
                value={name}
                maxLength={60}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commit()
                  if (e.key === 'Escape') {
                    setName(item.name)
                    setRenaming(false)
                  }
                }}
                aria-label="QR name"
              />
              <button className={act} onClick={commit} aria-label="Save name">
                <Check className="h-4 w-4" />
              </button>
              <button
                className={act}
                onClick={() => {
                  setName(item.name)
                  setRenaming(false)
                }}
                aria-label="Cancel rename"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-start justify-between gap-2">
              <h3 className="truncate font-display text-[15px] font-bold text-ink-900" title={item.name}>
                {item.name}
              </h3>
              <button
                onClick={() => setRenaming(true)}
                className="shrink-0 rounded p-1 text-ink-300 hover:text-brand-600"
                aria-label="Rename"
                title="Rename"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          <p className="mt-0.5 text-xs text-ink-400">Created {fmt(item.createdAt)}</p>
        </div>

        <select
          value={item.category}
          onChange={(e) => onCategory(item, e.target.value)}
          className="w-full rounded-lg border border-ink-100 bg-ink-50 px-2.5 py-1.5 text-xs font-semibold text-ink-600 outline-none focus:border-brand-300"
          aria-label="Category"
        >
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <div className="mt-auto flex items-center justify-between border-t border-ink-100 pt-3">
          <button className="btn-primary !px-3 !py-2 text-xs" onClick={() => onDownload(item)}>
            <Download className="h-3.5 w-3.5" /> Download
          </button>
          <div className="flex gap-0.5">
            <button className={act} onClick={() => onEdit(item)} aria-label="Edit" title="Edit">
              <Pencil className="h-4 w-4" />
            </button>
            <button className={act} onClick={() => onDuplicate(item)} aria-label="Duplicate" title="Duplicate">
              <Copy className="h-4 w-4" />
            </button>
            <button
              className={`${act} hover:!bg-rose-50 hover:!text-rose-600`}
              onClick={() => onDelete(item)}
              aria-label="Delete"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
