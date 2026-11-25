import type { EyeInnerStyle, EyeOuterStyle } from '../../types/qr.types'

const OUTER: { id: EyeOuterStyle; label: string; radius: string }[] = [
  { id: 'square', label: 'Square', radius: '2px' },
  { id: 'extra-rounded', label: 'Rounded', radius: '10px' },
  { id: 'dot', label: 'Circular', radius: '50%' },
]

const INNER: { id: EyeInnerStyle; label: string; radius: string }[] = [
  { id: 'square', label: 'Square', radius: '2px' },
  { id: 'dot', label: 'Circular', radius: '50%' },
]

function EyePreview({ outer, inner }: { outer: string; inner: string }) {
  return (
    <span
      className="relative grid h-9 w-9 place-items-center border-[5px] border-current"
      style={{ borderRadius: outer }}
      aria-hidden
    >
      <span className="block h-3 w-3 bg-current" style={{ borderRadius: inner }} />
    </span>
  )
}

function Group<T extends string>({
  title,
  value,
  options,
  onChange,
  render,
}: {
  title: string
  value: T
  options: { id: T; label: string }[]
  onChange: (v: T) => void
  render: (id: T) => React.ReactNode
}) {
  return (
    <div>
      <span className="label">{title}</span>
      <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label={title}>
        {options.map((o) => {
          const active = o.id === value
          return (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(o.id)}
              className={`flex min-w-[84px] flex-1 flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-semibold transition ${
                active
                  ? 'border-brand-500 bg-brand-50 text-brand-700 ring-4 ring-brand-100'
                  : 'border-ink-100 bg-white text-ink-500 hover:border-brand-200 hover:text-brand-700'
              }`}
            >
              {render(o.id)}
              {o.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function QREyeSelector({
  outer,
  inner,
  onOuter,
  onInner,
}: {
  outer: EyeOuterStyle
  inner: EyeInnerStyle
  onOuter: (v: EyeOuterStyle) => void
  onInner: (v: EyeInnerStyle) => void
}) {
  const rOuter = (id: EyeOuterStyle) => OUTER.find((o) => o.id === id)!.radius
  const rInner = (id: EyeInnerStyle) => INNER.find((o) => o.id === id)!.radius
  return (
    <div className="space-y-4">
      <Group
        title="Eye frame"
        value={outer}
        options={OUTER}
        onChange={onOuter}
        render={(id) => <EyePreview outer={rOuter(id)} inner={rInner(inner)} />}
      />
      <Group
        title="Eye center"
        value={inner}
        options={INNER}
        onChange={onInner}
        render={(id) => <EyePreview outer={rOuter(outer)} inner={rInner(id)} />}
      />
    </div>
  )
}
