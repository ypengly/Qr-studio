import type { LabelMode, QRDesign } from '../../types/qr.types'
import type { UpdateDesign } from '../../hooks/useQRDesign'
import { FONT_OPTIONS } from '../../utils/colorPresets'
import { ColorField, Field, Segmented, Slider, Toggle } from '../ui/Controls'

export function QRFrameEditor({ design, update }: { design: QRDesign; update: UpdateDesign }) {
  const { frame, label, text } = design

  const setFrame = (patch: Partial<QRDesign['frame']>, key?: string) =>
    update((d) => ({ ...d, frame: { ...d.frame, ...patch } }), key)
  const setLabel = (patch: Partial<QRDesign['label']>, key?: string) =>
    update((d) => ({ ...d, label: { ...d.label, ...patch } }), key)
  const setText = (patch: Partial<QRDesign['text']>, key?: string) =>
    update((d) => ({ ...d, text: { ...d.text, ...patch } }), key)

  return (
    <div className="space-y-6">
      {/* ---------- Frame ---------- */}
      <div className="space-y-4">
        <Toggle checked={frame.enabled} onChange={(enabled) => setFrame({ enabled })} label="Border & frame" hint="A rounded card around the QR code." />
        {frame.enabled && (
          <div className="animate-fade-up space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <ColorField label="Border" value={frame.color} onChange={(v) => setFrame({ color: v }, 'frame-c')} />
              <ColorField label="Card fill" value={frame.fill} onChange={(v) => setFrame({ fill: v }, 'frame-f')} />
            </div>
            <Slider label="Border width" value={frame.width} min={0} max={14} onChange={(v) => setFrame({ width: v }, 'frame-w')} />
            <Slider label="Corner radius" value={frame.radius} min={0} max={120} onChange={(v) => setFrame({ radius: v }, 'frame-r')} />
            <Slider label="Padding" value={frame.padding} min={20} max={120} onChange={(v) => setFrame({ padding: v }, 'frame-p')} />
          </div>
        )}
      </div>

      {/* ---------- Label ---------- */}
      <div className="space-y-4">
        <span className="label">Label</span>
        <Segmented<LabelMode>
          value={label.mode}
          onChange={(mode) =>
            setLabel({
              mode,
              text: mode === 'scan-me' ? 'SCAN ME' : mode === 'custom' && label.text === 'SCAN ME' ? '' : label.text,
            })
          }
          options={[
            { value: 'none', label: 'None' },
            { value: 'scan-me', label: 'Scan me' },
            { value: 'custom', label: 'Custom' },
          ]}
        />
        {label.mode !== 'none' && (
          <div className="animate-fade-up space-y-4">
            {label.mode === 'custom' && (
              <Field label="Label text">
                <input
                  className="input"
                  maxLength={32}
                  placeholder="Scan to view the menu"
                  value={label.text}
                  onChange={(e) => setLabel({ text: e.target.value }, 'label-text')}
                />
              </Field>
            )}
            <Field label="Position">
              <Segmented
                value={label.position}
                onChange={(position) => setLabel({ position })}
                options={[
                  { value: 'top', label: 'Above' },
                  { value: 'bottom', label: 'Below' },
                ]}
              />
            </Field>
            <Field label="Typography">
              <select
                className="input"
                value={label.fontFamily}
                onChange={(e) => setLabel({ fontFamily: e.target.value })}
                style={{ fontFamily: label.fontFamily }}
              >
                {FONT_OPTIONS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </Field>
            <Slider label="Label size" value={label.size} min={20} max={60} onChange={(v) => setLabel({ size: v }, 'label-size')} />
            <Toggle checked={label.pill} onChange={(pill) => setLabel({ pill })} label="Pill background" />
            <div className="grid grid-cols-2 gap-3">
              <ColorField label="Text colour" value={label.color} onChange={(v) => setLabel({ color: v }, 'label-c')} />
              {label.pill && (
                <ColorField label="Pill colour" value={label.pillColor} onChange={(v) => setLabel({ pillColor: v }, 'label-p')} />
              )}
            </div>
          </div>
        )}
      </div>

      {/* ---------- Title typography ---------- */}
      <div className="space-y-4">
        <span className="label">Title & description</span>
        <Field label="Typography">
          <select
            className="input"
            value={text.fontFamily}
            onChange={(e) => setText({ fontFamily: e.target.value })}
            style={{ fontFamily: text.fontFamily }}
          >
            {FONT_OPTIONS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </Field>
        <Slider label="Title size" value={text.titleSize} min={32} max={90} onChange={(v) => setText({ titleSize: v }, 'title-size')} />
        <div className="grid grid-cols-2 gap-3">
          <ColorField label="Title colour" value={text.titleColor} onChange={(v) => setText({ titleColor: v }, 'title-c')} />
          <ColorField label="Description" value={text.descriptionColor} onChange={(v) => setText({ descriptionColor: v }, 'desc-c')} />
        </div>
      </div>
    </div>
  )
}
