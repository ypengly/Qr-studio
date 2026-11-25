import { useEffect, useState } from 'react'
import type { QRDesign } from '../../types/qr.types'
import { defaultDesign, PRESETS, type DesignPreset } from '../../utils/colorPresets'
import { presetThumbnail } from '../../services/qr.service'

const SAMPLE = 'https://qrstudio.app'

function PresetCard({ preset, onPick }: { preset: DesignPreset; onPick: (p: DesignPreset) => void }) {
  const [src, setSrc] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    const design: QRDesign = { ...defaultDesign(), ...preset.design, ecc: 'auto' }
    // Use a short sample payload so thumbnails render quickly and look clean.
    presetThumbnail(preset.id, design, SAMPLE)
      .then((u) => alive && setSrc(u))
      .catch(() => undefined)
    return () => {
      alive = false
    }
  }, [preset])

  return (
    <button
      type="button"
      onClick={() => onPick(preset)}
      className="group flex flex-col items-center gap-2 rounded-2xl border border-ink-100 bg-white p-2 text-center transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lift focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
    >
      <span className="grid aspect-square w-full place-items-center overflow-hidden rounded-xl bg-ink-50">
        {src ? (
          <img src={src} alt="" className="h-full w-full object-contain p-1 transition group-hover:scale-[1.03]" />
        ) : (
          <span className="h-3/4 w-3/4 animate-pulse rounded-xl bg-ink-100" />
        )}
      </span>
      <span className="text-[11px] font-bold leading-tight text-ink-700">{preset.name}</span>
    </button>
  )
}

export function PresetGallery({ onPick }: { onPick: (p: DesignPreset) => void }) {
  return (
    <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5 lg:grid-cols-3 xl:grid-cols-5">
      {PRESETS.map((p) => (
        <PresetCard key={p.id} preset={p} onPick={onPick} />
      ))}
    </div>
  )
}
