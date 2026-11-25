import type { ContentData, ContentState, ContentType, SocialPlatform } from '../types/qr.types'

export const SOCIAL_PLATFORMS: { id: SocialPlatform; label: string; placeholder: string }[] = [
  { id: 'facebook', label: 'Facebook', placeholder: 'yourpage' },
  { id: 'instagram', label: 'Instagram', placeholder: 'yourhandle' },
  { id: 'tiktok', label: 'TikTok', placeholder: 'yourhandle' },
  { id: 'youtube', label: 'YouTube', placeholder: 'yourchannel' },
  { id: 'telegram', label: 'Telegram', placeholder: 'yourusername' },
]

export const defaultContent = (): ContentState => ({
  url: { url: '' },
  wifi: { ssid: '', password: '', security: 'WPA', hidden: false },
  text: { text: '' },
  email: { to: '', subject: '', body: '' },
  phone: { phone: '' },
  sms: { phone: '', message: '' },
  whatsapp: { phone: '', message: '' },
  location: { lat: '', lng: '' },
  vcard: { fullName: '', phone: '', email: '', company: '', website: '', address: '' },
  social: { platform: 'instagram', handle: '' },
})

/** Escape the special characters of the WIFI: payload (\ ; , : "). */
export const escapeWifi = (v: string) => v.replace(/([\\;,:"])/g, '\\$1')

/** Escape text values inside a vCard. */
export const escapeVCard = (v: string) =>
  v.replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;')

export const normalizeUrl = (raw: string): string => {
  const v = raw.trim()
  if (!v) return ''
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(v)) return v
  if (/^(mailto|tel|sms|geo|wifi):/i.test(v)) return v
  return `https://${v}`
}

/** Keep digits and a leading plus. */
export const cleanPhone = (raw: string): string => {
  const v = raw.trim()
  const plus = v.startsWith('+') ? '+' : ''
  return plus + v.replace(/[^\d]/g, '')
}

const stripAt = (v: string) => v.trim().replace(/^@+/, '')

export function socialUrl(platform: SocialPlatform, handleRaw: string): string {
  const h = handleRaw.trim()
  if (!h) return ''
  if (/^https?:\/\//i.test(h)) return h
  if (/^(www\.)?[a-z0-9-]+\.[a-z]{2,}\//i.test(h)) return `https://${h}`
  const name = stripAt(h)
  switch (platform) {
    case 'facebook':
      return `https://facebook.com/${name}`
    case 'instagram':
      return `https://instagram.com/${name}`
    case 'tiktok':
      return `https://tiktok.com/@${name}`
    case 'youtube':
      return `https://youtube.com/@${name}`
    case 'telegram':
      return `https://t.me/${name}`
  }
}

type Builder<K extends ContentType> = (d: ContentData[K]) => string

const builders: { [K in ContentType]: Builder<K> } = {
  url: (d) => normalizeUrl(d.url),

  wifi: (d) => {
    if (!d.ssid.trim()) return ''
    const parts = [`T:${d.security}`, `S:${escapeWifi(d.ssid)}`]
    if (d.security !== 'nopass') parts.push(`P:${escapeWifi(d.password)}`)
    if (d.hidden) parts.push('H:true')
    return `WIFI:${parts.join(';')};;`
  },

  text: (d) => d.text,

  email: (d) => {
    const to = d.to.trim()
    if (!to) return ''
    const q: string[] = []
    if (d.subject.trim()) q.push(`subject=${encodeURIComponent(d.subject)}`)
    if (d.body.trim()) q.push(`body=${encodeURIComponent(d.body)}`)
    return `mailto:${to}${q.length ? `?${q.join('&')}` : ''}`
  },

  phone: (d) => {
    const p = cleanPhone(d.phone)
    return p.replace('+', '') ? `tel:${p}` : ''
  },

  sms: (d) => {
    const p = cleanPhone(d.phone)
    if (!p.replace('+', '')) return ''
    return d.message.trim() ? `sms:${p}?body=${encodeURIComponent(d.message)}` : `sms:${p}`
  },

  whatsapp: (d) => {
    const digits = d.phone.replace(/[^\d]/g, '')
    if (!digits) return ''
    return d.message.trim()
      ? `https://wa.me/${digits}?text=${encodeURIComponent(d.message)}`
      : `https://wa.me/${digits}`
  },

  location: (d) => {
    const lat = d.lat.trim()
    const lng = d.lng.trim()
    if (!lat || !lng) return ''
    return `https://www.google.com/maps?q=${lat},${lng}`
  },

  vcard: (d) => {
    if (!d.fullName.trim()) return ''
    const name = d.fullName.trim()
    const pieces = name.split(/\s+/)
    const last = pieces.length > 1 ? pieces[pieces.length - 1] : ''
    const first = pieces.length > 1 ? pieces.slice(0, -1).join(' ') : pieces[0]
    const lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `N:${escapeVCard(last)};${escapeVCard(first)};;;`,
      `FN:${escapeVCard(name)}`,
    ]
    if (d.company.trim()) lines.push(`ORG:${escapeVCard(d.company.trim())}`)
    if (d.phone.trim()) lines.push(`TEL;TYPE=CELL:${cleanPhone(d.phone)}`)
    if (d.email.trim()) lines.push(`EMAIL:${d.email.trim()}`)
    if (d.website.trim()) lines.push(`URL:${normalizeUrl(d.website)}`)
    if (d.address.trim()) lines.push(`ADR;TYPE=WORK:;;${escapeVCard(d.address.trim())};;;;`)
    lines.push('END:VCARD')
    return lines.join('\r\n')
  },

  social: (d) => socialUrl(d.platform, d.handle),
}

export function buildPayload<K extends ContentType>(type: K, content: ContentState): string {
  const b = builders[type] as Builder<K>
  return b(content[type] as ContentData[K])
}

/** Sample payloads shown in the preview until the user enters valid content. */
export const SAMPLE_PAYLOAD = 'https://qrstudio.app/hello'

export const TYPE_LABELS: Record<ContentType, string> = {
  url: 'Website',
  wifi: 'Wi-Fi',
  text: 'Text',
  email: 'Email',
  phone: 'Phone',
  sms: 'SMS',
  whatsapp: 'WhatsApp',
  location: 'Location',
  vcard: 'Contact',
  social: 'Social',
}
