import { Library, Sparkles } from 'lucide-react'
import type { View } from './Header'

export function MobileNavigation({
  view,
  onView,
  count,
}: {
  view: View
  onView: (v: View) => void
  count: number
}) {
  const item = (v: View, label: string, icon: React.ReactNode) => (
    <button
      onClick={() => onView(v)}
      aria-current={view === v ? 'page' : undefined}
      className={`relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-semibold ${
        view === v ? 'text-brand-700' : 'text-ink-400'
      }`}
    >
      {icon}
      {label}
      {v === 'library' && count > 0 && (
        <span className="absolute right-[calc(50%-22px)] top-1 rounded-full bg-brand-600 px-1.5 text-[9px] font-bold leading-4 text-white">
          {count}
        </span>
      )}
    </button>
  )

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 flex h-[60px] border-t border-ink-100 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      aria-label="Main"
    >
      {item('create', 'Create', <Sparkles className="h-5 w-5" />)}
      {item('library', 'Library', <Library className="h-5 w-5" />)}
    </nav>
  )
}
