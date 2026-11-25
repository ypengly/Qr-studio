import { Plus } from 'lucide-react'
import type { QRDesign } from '../../types/qr.types'
import type { UpdateDesign } from '../../hooks/useQRDesign'
import { PALETTES, PASTEL_BACKGROUNDS } from '../../utils/colorPresets'
import { ColorField, Segmented, Slider, Toggle } from '../ui/Controls'

const MAX_STOPS = 4

function Swatches({
  items,
  onPick,
}: {
  items: { name: string; css: string }[]
  onPick: (i: number) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it, i) => (
        <button
          key={it.name}
          type="button"
          title={it.name}
          aria-label={it.name}
          onClick={() => onPick(i)}
          className="h-8 w-8 rounded-full border border-ink-200 shadow-sm transition hover:scale-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
          style={{ background: it.css }}
        />
      ))}
    </div>
  )
}

export function QRColorEditor({ design, update }: { design: QRDesign; update: UpdateDesign }) {
  const { fill, background, eyeColorMode } = design
  const gradient = fill.mode !== 'solid'

  const setStop = (i: number, color: string) =>
    update((d) => ({ ...d, fill: { ...d.fill, colors: d.fill.colors.map((c, j) => (j === i ? color : c)) } }), `fill-${i}`)

  const setBgStop = (i: number, color: string) =>
    update(
      (d) => ({ ...d, background: { ...d.background, colors: d.background.colors.map((c, j) => (j === i ? color : c)) } }),
      `bg-${i}`,
    )

  return (
    <div className="space-y-6">
      {/* ---------- Foreground ---------- */}
      <div className="space-y-4">
        <span className="label">Code colour</span>
        <Segmented
          value={fill.mode}
          onChange={(mode) =>
            update((d) => {
              const colors = [...d.fill.colors]
              if (mode !== 'solid' && colors.length < 2) colors.push('#7c3aed')
              return { ...d, fill: { ...d.fill, mode, colors: mode === 'solid' ? [colors[0]] : colors } }
            })
          }
          options={[
            { value: 'solid', label: 'Solid' },
            { value: 'linear', label: 'Linear' },
            { value: 'radial', label: 'Radial' },
          ]}
        />

        <div className="space-y-3">
          {fill.colors.map((c, i) => (
            <ColorField
              key={i}
              label={gradient ? `Colour ${i + 1}` : undefined}
              value={c}
              onChange={(v) => setStop(i, v)}
              onRemove={
                gradient && fill.colors.length > 2
                  ? () => update((d) => ({ ...d, fill: { ...d.fill, colors: d.fill.colors.filter((_, j) => j !== i) } }))
                  : undefined
              }
            />
          ))}
          {gradient && fill.colors.length < MAX_STOPS && (
            <button
              type="button"
              className="btn-secondary !py-2 text-xs"
              onClick={() =>
                update((d) => ({ ...d, fill: { ...d.fill, colors: [...d.fill.colors, '#db2777'] } }))
              }
            >
              <Plus className="h-4 w-4" /> Add colour stop
            </button>
          )}
        </div>

        {fill.mode === 'linear' && (
          <Slider
            label="Gradient angle"
            value={fill.rotation}
            min={0}
            max={360}
            step={5}
            format={(v) => `${v}°`}
            onChange={(rotation) => update((d) => ({ ...d, fill: { ...d.fill, rotation } }), 'fill-rot')}
          />
        )}

        <div>
          <span className="label">Professional palettes</span>
          <Swatches
            items={PALETTES.map((p) => ({
              name: p.name,
              css: `linear-gradient(135deg, ${p.colors[0]} 0%, ${p.colors[0]} 50%, ${p.colors[2]} 50%, ${p.colors[2]} 100%)`,
            }))}
            onPick={(i) => {
              const p = PALETTES[i]
              update((d) => {
                if (d.fill.mode === 'solid') return { ...d, fill: { ...d.fill, colors: [p.colors[0]] } }
                const n = Math.max(2, d.fill.colors.length)
                return { ...d, fill: { ...d.fill, colors: p.colors.slice(0, n) } }
              })
            }}
          />
        </div>
      </div>

      {/* ---------- Eyes ---------- */}
      <div className="space-y-3">
        <Toggle
          checked={eyeColorMode === 'custom'}
          onChange={(on) => update({ eyeColorMode: on ? 'custom' : 'match' })}
          label="Custom eye colours"
          hint="Give the three corner eyes their own colours."
        />
        {eyeColorMode === 'custom' && (
          <div className="grid grid-cols-2 gap-3">
            <ColorField label="Eye frame" value={design.eyeOuterColor} onChange={(v) => update({ eyeOuterColor: v }, 'eye-out')} />
            <ColorField label="Eye center" value={design.eyeInnerColor} onChange={(v) => update({ eyeInnerColor: v }, 'eye-in')} />
          </div>
        )}
      </div>

      {/* ---------- Background ---------- */}
      <div className="space-y-4">
        <span className="label">Background</span>
        <Segmented
          value={background.mode}
          onChange={(mode) =>
            update((d) => {
              const colors = [...d.background.colors]
              if (mode === 'linear' && colors.length < 2) colors.push('#e0e7ff')
              return { ...d, background: { ...d.background, mode, colors: mode === 'solid' ? [colors[0]] : colors } }
            })
          }
          options={[
            { value: 'solid', label: 'Solid' },
            { value: 'linear', label: 'Gradient' },
            { value: 'transparent', label: 'Transparent' },
          ]}
        />

        {background.mode !== 'transparent' && (
          <div className="space-y-3">
            {background.colors.map((c, i) => (
              <ColorField
                key={i}
                label={background.mode === 'linear' ? `Colour ${i + 1}` : undefined}
                value={c}
                onChange={(v) => setBgStop(i, v)}
              />
            ))}
            {background.mode === 'linear' && (
              <Slider
                label="Gradient angle"
                value={background.rotation}
                min={0}
                max={360}
                step={5}
                format={(v) => `${v}°`}
                onChange={(rotation) =>
                  update((d) => ({ ...d, background: { ...d.background, rotation } }), 'bg-rot')
                }
              />
            )}
            <div>
              <span className="label">Soft pastels</span>
              <Swatches
                items={PASTEL_BACKGROUNDS.map((p) => ({ name: p.name, css: p.color }))}
                onPick={(i) =>
                  update((d) => {
                    const c = PASTEL_BACKGROUNDS[i].color
                    return {
                      ...d,
                      background:
                        d.background.mode === 'solid'
                          ? { ...d.background, colors: [c] }
                          : { ...d.background, colors: [c, ...d.background.colors.slice(1)] },
                    }
                  })
                }
              />
            </div>
          </div>
        )}
        {background.mode === 'transparent' && (
          <p className="rounded-xl bg-ink-50 px-3.5 py-3 text-xs leading-relaxed text-ink-500">
            Transparent PNG exports let the code sit on any surface. Make sure the surface behind it is light enough —
            scanners need dark code on a light background.
          </p>
        )}
      </div>
    </div>
  )
}
