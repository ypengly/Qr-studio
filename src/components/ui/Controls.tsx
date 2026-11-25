import { useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'

export function Section({
  title,
  icon,
  children,
  defaultOpen = true,
  aside,
}: {
  title: string
  icon?: ReactNode
  children: ReactNode
  defaultOpen?: boolean
  aside?: ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <section className="card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-2.5 px-5 py-4 text-left"
      >
        {icon && <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-600">{icon}</span>}
        <span className="flex-1 text-[15px] font-bold text-ink-900">{title}</span>
        {aside}
        <ChevronDown className={`h-4 w-4 text-ink-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="animate-fade-up space-y-5 border-t border-ink-100 px-5 pb-5 pt-4">{children}</div>}
    </section>
  )
}

export function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string
  error?: string
  hint?: string
  children: ReactNode
}) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-ink-400">{hint}</p>
      ) : null}
    </div>
  )
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  size = 'md',
}: {
  value: T
  options: { value: T; label: string; icon?: ReactNode }[]
  onChange: (v: T) => void
  size?: 'sm' | 'md'
}) {
  return (
    <div className="flex flex-wrap gap-1 rounded-xl bg-ink-100 p-1" role="radiogroup">
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg font-semibold transition ${
              size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-[13px]'
            } ${active ? 'bg-white text-brand-700 shadow-sm' : 'text-ink-500 hover:text-ink-800'}`}
          >
            {o.icon}
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

export function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  hint?: string
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4">
      <span>
        <span className="block text-sm font-semibold text-ink-800">{label}</span>
        {hint && <span className="block text-xs text-ink-400">{hint}</span>}
      </span>
      <span className="relative inline-flex shrink-0">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="h-6 w-11 rounded-full bg-ink-200 transition peer-checked:bg-brand-600 peer-focus-visible:ring-4 peer-focus-visible:ring-brand-200" />
        <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
      </span>
    </label>
  )
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
  format?: (v: number) => string
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="label !mb-0">{label}</span>
        <span className="rounded-md bg-ink-100 px-2 py-0.5 text-xs font-bold tabular-nums text-ink-700">
          {format ? format(value) : value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
      />
    </div>
  )
}

const HEX_RE = /^#[0-9a-f]{6}$/i

export function ColorField({
  label,
  value,
  onChange,
  onRemove,
}: {
  label?: string
  value: string
  onChange: (v: string) => void
  onRemove?: () => void
}) {
  const [draft, setDraft] = useState<string | null>(null)
  const shown = draft ?? value
  return (
    <div>
      {label && <span className="label">{label}</span>}
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={HEX_RE.test(value) ? value : '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-12 shrink-0"
          aria-label={label ?? 'Colour'}
        />
        <input
          className="input !py-2 font-mono text-xs uppercase"
          value={shown}
          maxLength={7}
          spellCheck={false}
          onChange={(e) => {
            let v = e.target.value.trim()
            if (v && !v.startsWith('#')) v = `#${v}`
            setDraft(v)
            if (HEX_RE.test(v)) onChange(v.toLowerCase())
          }}
          onBlur={() => setDraft(null)}
          aria-label={`${label ?? 'Colour'} hex value`}
        />
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-ink-400 hover:bg-rose-50 hover:text-rose-600"
            aria-label="Remove colour"
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  wide?: boolean
}) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-ink-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`flex max-h-[92vh] w-full animate-pop-in flex-col overflow-hidden rounded-t-3xl bg-white shadow-lift sm:rounded-3xl ${
          wide ? 'sm:max-w-3xl' : 'sm:max-w-md'
        }`}
      >
        <div className="flex items-center justify-between border-b border-ink-100 px-6 py-4">
          <h2 className="font-display text-lg font-bold text-ink-900">{title}</h2>
          <button onClick={onClose} className="btn-ghost !px-2.5 !py-1.5" aria-label="Close">
            ✕
          </button>
        </div>
        <div className="scroll-thin overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
