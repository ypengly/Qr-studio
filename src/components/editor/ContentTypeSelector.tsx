import { Contact, Link2, type LucideIcon, MapPin, Mail, MessageCircle, MessageSquare, Phone, Share2, Type, Wifi } from 'lucide-react'
import type { ContentType } from '../../types/qr.types'
import { TYPE_LABELS } from '../../utils/qrContent'

export const TYPE_ICONS: Record<ContentType, LucideIcon> = {
  url: Link2,
  wifi: Wifi,
  text: Type,
  email: Mail,
  phone: Phone,
  sms: MessageSquare,
  whatsapp: MessageCircle,
  location: MapPin,
  vcard: Contact,
  social: Share2,
}

const ORDER: ContentType[] = ['url', 'wifi', 'text', 'email', 'phone', 'sms', 'whatsapp', 'location', 'vcard', 'social']

export function ContentTypeSelector({
  value,
  onChange,
}: {
  value: ContentType
  onChange: (t: ContentType) => void
}) {
  return (
    <div className="grid grid-cols-5 gap-2 sm:gap-2.5" role="radiogroup" aria-label="Content type">
      {ORDER.map((t) => {
        const Icon = TYPE_ICONS[t]
        const active = t === value
        return (
          <button
            key={t}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(t)}
            className={`group flex flex-col items-center gap-1.5 rounded-2xl border px-1 py-3 text-[11px] font-semibold transition sm:text-xs ${
              active
                ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm ring-4 ring-brand-100'
                : 'border-ink-100 bg-white text-ink-500 hover:-translate-y-0.5 hover:border-brand-200 hover:text-brand-700 hover:shadow-soft'
            }`}
          >
            <span
              className={`grid h-9 w-9 place-items-center rounded-xl transition ${
                active ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-500 group-hover:bg-brand-100 group-hover:text-brand-600'
              }`}
            >
              <Icon className="h-[18px] w-[18px]" />
            </span>
            {TYPE_LABELS[t]}
          </button>
        )
      })}
    </div>
  )
}
