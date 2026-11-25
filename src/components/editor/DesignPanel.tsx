import { Frame, Image as ImageIcon, Palette, Shapes, ShieldCheck, Sparkles } from 'lucide-react'
import type { DesignController } from '../../hooks/useQRDesign'
import { applyPreset } from '../../utils/colorPresets'
import { QRColorEditor } from '../qr/QRColorEditor'
import { QREyeSelector } from '../qr/QREyeSelector'
import { QRFrameEditor } from '../qr/QRFrameEditor'
import { QRLogoEditor } from '../qr/QRLogoEditor'
import { QRPatternSelector } from '../qr/QRPatternSelector'
import { Section, Segmented } from '../ui/Controls'
import { PresetGallery } from './PresetGallery'
import type { EccLevel } from '../../types/qr.types'

export function DesignPanel({ ctrl }: { ctrl: DesignController }) {
  const { design, update } = ctrl

  return (
    <div className="space-y-4">
      <Section title="Design presets" icon={<Sparkles className="h-4 w-4" />}>
        <PresetGallery onPick={(p) => update((d) => applyPreset(d, p))} />
      </Section>

      <Section title="Pattern & eyes" icon={<Shapes className="h-4 w-4" />} defaultOpen={false}>
        <div>
          <span className="label">Module pattern</span>
          <QRPatternSelector value={design.dotStyle} onChange={(dotStyle) => update({ dotStyle })} />
        </div>
        <QREyeSelector
          outer={design.eyeOuter}
          inner={design.eyeInner}
          onOuter={(eyeOuter) => update({ eyeOuter })}
          onInner={(eyeInner) => update({ eyeInner })}
        />
      </Section>

      <Section title="Colours & background" icon={<Palette className="h-4 w-4" />} defaultOpen={false}>
        <QRColorEditor design={design} update={update} />
      </Section>

      <Section title="Center logo" icon={<ImageIcon className="h-4 w-4" />} defaultOpen={false}>
        <QRLogoEditor design={design} update={update} />
      </Section>

      <Section title="Frame, label & text" icon={<Frame className="h-4 w-4" />} defaultOpen={false}>
        <QRFrameEditor design={design} update={update} />
      </Section>

      <Section title="Advanced" icon={<ShieldCheck className="h-4 w-4" />} defaultOpen={false}>
        <div>
          <span className="label">Error correction</span>
          <Segmented<'auto' | EccLevel>
            value={design.ecc}
            onChange={(ecc) => update({ ecc })}
            options={[
              { value: 'auto', label: 'Auto' },
              { value: 'L', label: 'L 7%' },
              { value: 'M', label: 'M 15%' },
              { value: 'Q', label: 'Q 25%' },
              { value: 'H', label: 'H 30%' },
            ]}
            size="sm"
          />
          <p className="mt-2 text-xs leading-relaxed text-ink-400">
            Auto uses level Q, and H when a logo is present. Higher levels survive more damage or logo coverage but
            make the pattern denser.
          </p>
        </div>
      </Section>
    </div>
  )
}
