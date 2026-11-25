import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'

type Kind = 'success' | 'error' | 'info'
interface ToastItem {
  id: number
  kind: Kind
  message: string
}

interface ToastApi {
  success: (m: string) => void
  error: (m: string) => void
  info: (m: string) => void
}

const Ctx = createContext<ToastApi | null>(null)

export function useToast(): ToastApi {
  const c = useContext(Ctx)
  if (!c) throw new Error('useToast must be used inside <ToastProvider>')
  return c
}

const STYLE: Record<Kind, string> = {
  success: 'border-emerald-200 bg-white text-emerald-900',
  error: 'border-rose-200 bg-white text-rose-900',
  info: 'border-brand-200 bg-white text-ink-800',
}

const ICON: Record<Kind, ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />,
  error: <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />,
  info: <Info className="h-5 w-5 shrink-0 text-brand-500" />,
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: number) => setItems((s) => s.filter((t) => t.id !== id)), [])

  const push = useCallback(
    (kind: Kind, message: string) => {
      const id = Date.now() + Math.random()
      setItems((s) => [...s.slice(-3), { id, kind, message }])
      window.setTimeout(() => dismiss(id), kind === 'error' ? 6000 : 3200)
    },
    [dismiss],
  )

  const api = useMemo<ToastApi>(
    () => ({
      success: (m) => push('success', m),
      error: (m) => push('error', m),
      info: (m) => push('info', m),
    }),
    [push],
  )

  return (
    <Ctx.Provider value={api}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-24 z-[100] flex flex-col items-center gap-2 px-4 lg:bottom-6"
        aria-live="polite"
      >
        {items.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex max-w-md animate-pop-in items-start gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-lift ${STYLE[t.kind]}`}
          >
            {ICON[t.kind]}
            <span className="pt-px">{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              className="-mr-1 ml-1 rounded p-0.5 text-ink-400 hover:text-ink-700"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}
