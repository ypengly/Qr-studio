import { useMemo, useState } from 'react'
import { Library, Loader2, Plus, Search } from 'lucide-react'
import type { SavedQR } from '../../types/qr.types'
import type { SavedController } from '../../hooks/useSavedQR'
import { QRExportDialog } from '../qr/QRExportDialog'
import { Modal } from '../ui/Controls'
import { useToast } from '../ui/Toast'
import { Sidebar } from '../layout/Sidebar'
import { SavedQRCard } from './SavedQRCard'

interface Props {
  library: SavedController
  onEdit: (item: SavedQR) => void
  onCreate: () => void
}

export function SavedQRLibrary({ library, onEdit, onCreate }: Props) {
  const toast = useToast()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string | null>(null)
  const [downloading, setDownloading] = useState<SavedQR | null>(null)
  const [deleting, setDeleting] = useState<SavedQR | null>(null)

  const counts = useMemo(() => {
    const m: Record<string, number> = {}
    library.items.forEach((i) => (m[i.category] = (m[i.category] ?? 0) + 1))
    return m
  }, [library.items])

  // Only list categories that are in use, plus the active one.
  const usedCategories = useMemo(
    () => library.categories.filter((c) => (counts[c] ?? 0) > 0 || c === category),
    [library.categories, counts, category],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return library.items.filter(
      (i) =>
        (!category || i.category === category) &&
        (!q || [i.name, i.description, i.category, i.type].some((s) => s.toLowerCase().includes(q))),
    )
  }, [library.items, query, category])

  if (library.loading) {
    return (
      <div className="grid place-items-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
      </div>
    )
  }

  if (library.items.length === 0) {
    return (
      <div className="card mx-auto mt-6 flex max-w-lg flex-col items-center px-8 py-16 text-center">
        <span className="mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-brand-50 text-brand-600">
          <Library className="h-8 w-8" />
        </span>
        <h2 className="font-display text-xl font-bold text-ink-900">Your library is empty</h2>
        <p className="mt-2 max-w-sm text-sm text-ink-500">
          Design a QR code and press <strong>Save design</strong>. Saved codes live privately in this browser — no
          account needed.
        </p>
        <button className="btn-primary mt-6" onClick={onCreate}>
          <Plus className="h-4 w-4" /> Create your first QR
        </button>
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8">
      <div className="lg:sticky lg:top-24 lg:self-start">
        <Sidebar
          categories={usedCategories}
          counts={counts}
          total={library.items.length}
          active={category}
          onSelect={setCategory}
        />
      </div>

      <div className="min-w-0">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink-900">Saved QR codes</h1>
            <p className="text-sm text-ink-500">
              {filtered.length} of {library.items.length} design{library.items.length === 1 ? '' : 's'}
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
            <input
              className="input pl-10"
              type="search"
              placeholder="Search by name or type…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search saved QR codes"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="card px-6 py-14 text-center text-sm text-ink-500">No saved QR codes match your search.</div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((item) => (
              <SavedQRCard
                key={item.id}
                item={item}
                categories={library.categories}
                onEdit={onEdit}
                onDownload={setDownloading}
                onDuplicate={async (i) => {
                  await library.duplicate(i.id)
                  toast.success('Design duplicated.')
                }}
                onDelete={setDeleting}
                onRename={async (i, name) => {
                  await library.patch(i.id, { name })
                  toast.success('Renamed.')
                }}
                onCategory={(i, c) => library.patch(i.id, { category: c })}
              />
            ))}
          </div>
        )}
      </div>

      {downloading && (
        <QRExportDialog
          open
          onClose={() => setDownloading(null)}
          payload={downloading.payload}
          design={downloading.design}
          meta={{ title: downloading.name, description: downloading.description }}
        />
      )}

      <Modal open={Boolean(deleting)} onClose={() => setDeleting(null)} title="Delete this design?">
        <div className="space-y-5 p-6">
          <p className="text-sm text-ink-600">
            <strong>{deleting?.name}</strong> will be removed from this browser. This can’t be undone.
          </p>
          <div className="flex justify-end gap-2">
            <button className="btn-secondary" onClick={() => setDeleting(null)}>
              Cancel
            </button>
            <button
              className="btn bg-rose-600 text-white hover:bg-rose-700"
              onClick={async () => {
                if (!deleting) return
                await library.remove(deleting.id)
                setDeleting(null)
                toast.success('Design deleted.')
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
