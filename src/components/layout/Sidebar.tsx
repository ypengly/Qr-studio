import { FolderOpen, Layers } from 'lucide-react'

/** Category filter: a vertical list on desktop, horizontal chips on small screens. */
export function Sidebar({
  categories,
  counts,
  total,
  active,
  onSelect,
}: {
  categories: string[]
  counts: Record<string, number>
  total: number
  active: string | null
  onSelect: (c: string | null) => void
}) {
  const row = (key: string | null, label: string, n: number, icon: React.ReactNode) => {
    const on = active === key
    return (
      <button
        key={label}
        onClick={() => onSelect(key)}
        aria-pressed={on}
        className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition lg:w-full ${
          on ? 'bg-brand-50 text-brand-700' : 'text-ink-500 hover:bg-ink-100 hover:text-ink-800'
        }`}
      >
        {icon}
        <span className="flex-1 whitespace-nowrap text-left">{label}</span>
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${on ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-500'}`}>
          {n}
        </span>
      </button>
    )
  }

  return (
    <nav aria-label="Categories" className="scroll-thin -mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
      {row(null, 'All designs', total, <Layers className="h-4 w-4" />)}
      {categories.map((c) => row(c, c, counts[c] ?? 0, <FolderOpen className="h-4 w-4" />))}
    </nav>
  )
}
