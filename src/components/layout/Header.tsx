import { Library, Plus, QrCode } from 'lucide-react'

export type View = 'create' | 'library'

export function Header({
  view,
  onView,
  count,
  onNew,
}: {
  view: View
  onView: (v: View) => void
  count: number
  onNew: () => void
}) {
  const tab = (v: View, label: string) => (
    <button
      onClick={() => onView(v)}
      aria-current={view === v ? 'page' : undefined}
      className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition ${
        view === v ? 'bg-brand-50 text-brand-700' : 'text-ink-500 hover:bg-ink-100 hover:text-ink-800'
      }`}
    >
      {label}
    </button>
  )

  return (
    <header className="sticky top-0 z-50 border-b border-ink-100/80 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <button onClick={() => onView('create')} className="flex items-center gap-2.5" aria-label="QR Studio home">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 text-white shadow-md shadow-brand-600/30">
            <QrCode className="h-5 w-5" />
          </span>
          <span className="font-display text-xl font-bold tracking-tight text-ink-900">
            QR <span className="text-brand-600">Studio</span>
          </span>
        </button>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {tab('create', 'Create')}
          <button
            onClick={() => onView('library')}
            aria-current={view === 'library' ? 'page' : undefined}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition ${
              view === 'library' ? 'bg-brand-50 text-brand-700' : 'text-ink-500 hover:bg-ink-100 hover:text-ink-800'
            }`}
          >
            <Library className="h-4 w-4" /> Library
            {count > 0 && (
              <span className="rounded-full bg-brand-600 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                {count}
              </span>
            )}
          </button>
        </nav>

        <button onClick={onNew} className="btn-primary !px-3.5 !py-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New QR</span>
        </button>
      </div>
    </header>
  )
}
