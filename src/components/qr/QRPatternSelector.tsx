import type { DotStyle } from '../../types/qr.types'

const STYLES: { id: DotStyle; label: string }[] = [
  { id: 'square', label: 'Square' },
  { id: 'rounded', label: 'Rounded' },
  { id: 'dots', label: 'Dots' },
  { id: 'extra-rounded', label: 'Extra-rounded' },
  { id: 'classy', label: 'Classy' },
  { id: 'classy-rounded', label: 'Elegant' },
]

/** Tiny SVG swatch that shows what a module looks like in each style. */
function Swatch({ id }: { id: DotStyle }) {
  // 3 x 3 sample grid, some modules joined to hint at the rounding rules
  const cells = [
    [0, 0],
    [1, 0],
    [0, 1],
    [2, 1],
    [1, 2],
    [2, 2],
  ]
  const s = 10
  const gap = id === 'dots' ? 1.5 : 0.4
  return (
    <svg viewBox="0 0 34 34" className="h-9 w-9" aria-hidden>
      {cells.map(([cx, cy]) => {
        const x = 2 + cx * (s + 1) + 0
        const y = 2 + cy * (s + 1) + 0
        const w = s - gap
        switch (id) {
          case 'dots':
            return <circle key={`${cx}${cy}`} cx={x + s / 2} cy={y + s / 2} r={w / 2} fill="currentColor" />
          case 'rounded':
            return <rect key={`${cx}${cy}`} x={x} y={y} width={s} height={s} rx={2.6} fill="currentColor" />
          case 'extra-rounded':
            return <rect key={`${cx}${cy}`} x={x} y={y} width={s} height={s} rx={4.4} fill="currentColor" />
          case 'classy':
            return (
              <path
                key={`${cx}${cy}`}
                d={`M${x} ${y} h${s - 4} a4 4 0 0 1 4 4 v${s - 4} h-${s - 4} a4 4 0 0 1 -4 -4 z`}
                fill="currentColor"
              />
            )
          case 'classy-rounded':
            return (
              <path
                key={`${cx}${cy}`}
                d={`M${x + 2} ${y} h${s - 5} a5 5 0 0 1 5 5 v${s - 7} a2 2 0 0 1 -2 2 h-${s - 5} a5 5 0 0 1 -5 -5 v-${s - 7} a2 2 0 0 1 2 -2 z`}
                fill="currentColor"
              />
            )
          default:
            return <rect key={`${cx}${cy}`} x={x} y={y} width={s - 0.6} height={s - 0.6} fill="currentColor" />
        }
      })}
    </svg>
  )
}

export function QRPatternSelector({ value, onChange }: { value: DotStyle; onChange: (v: DotStyle) => void }) {
  return (
    <div className="grid grid-cols-3 gap-2.5" role="radiogroup" aria-label="Pattern style">
      {STYLES.map((s) => {
        const active = s.id === value
        return (
          <button
            key={s.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(s.id)}
            className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-semibold transition ${
              active
                ? 'border-brand-500 bg-brand-50 text-brand-700 ring-4 ring-brand-100'
                : 'border-ink-100 bg-white text-ink-500 hover:border-brand-200 hover:text-brand-700'
            }`}
          >
            <Swatch id={s.id} />
            {s.label}
          </button>
        )
      })}
    </div>
  )
}
