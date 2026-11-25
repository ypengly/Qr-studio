import type { ContentState, ContentType, QRDesign, Warning } from '../types/qr.types'
import { buildPayload, cleanPhone } from './qrContent'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export interface ContentCheck {
  /** field-level errors keyed by field name */
  errors: Record<string, string>
  /** true when the payload is complete enough to encode */
  valid: boolean
  payload: string
}

const digitsOf = (v: string) => v.replace(/[^\d]/g, '')

export function validateContent(type: ContentType, content: ContentState): ContentCheck {
  const errors: Record<string, string> = {}
  const payload = buildPayload(type, content)

  switch (type) {
    case 'url': {
      const raw = content.url.url.trim()
      if (raw) {
        try {
          const u = new URL(payload)
          if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(u.hostname) && u.hostname !== 'localhost') {
            errors.url = 'That doesn’t look like a valid web address.'
          }
        } catch {
          errors.url = 'That doesn’t look like a valid web address.'
        }
      }
      break
    }
    case 'wifi':
      if (content.wifi.security !== 'nopass' && content.wifi.ssid && !content.wifi.password) {
        errors.password = 'Add the password, or choose “None” for an open network.'
      }
      break
    case 'email':
      if (content.email.to.trim() && !EMAIL_RE.test(content.email.to.trim())) {
        errors.to = 'Enter a valid email address.'
      }
      break
    case 'phone':
    case 'sms':
    case 'whatsapp': {
      const v = content[type].phone
      if (v.trim() && digitsOf(v).length < 6) errors.phone = 'Enter a full phone number.'
      if (type === 'whatsapp' && v.trim() && !errors.phone && !v.trim().startsWith('+')) {
        errors.phone = 'Use international format with country code, e.g. +855 12 345 678.'
      }
      break
    }
    case 'location': {
      const { lat, lng } = content.location
      if (lat.trim()) {
        const n = Number(lat)
        if (Number.isNaN(n) || n < -90 || n > 90) errors.lat = 'Latitude must be between -90 and 90.'
      }
      if (lng.trim()) {
        const n = Number(lng)
        if (Number.isNaN(n) || n < -180 || n > 180) errors.lng = 'Longitude must be between -180 and 180.'
      }
      break
    }
    case 'vcard':
      if (content.vcard.email.trim() && !EMAIL_RE.test(content.vcard.email.trim())) {
        errors.email = 'Enter a valid email address.'
      }
      if (content.vcard.phone.trim() && cleanPhone(content.vcard.phone).replace('+', '').length < 6) {
        errors.phone = 'Enter a full phone number.'
      }
      break
    default:
      break
  }

  // A QR code can hold roughly 2,953 bytes at the lowest error-correction level.
  if (new TextEncoder().encode(payload).length > 1800) {
    errors.length = 'This content is very long — the QR code would be dense and hard to scan.'
  }

  return { errors, valid: Boolean(payload) && Object.keys(errors).length === 0, payload }
}

// ---------- Colour maths ----------

export function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace('#', '').trim()
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  const n = parseInt(h.slice(0, 6), 16)
  if (Number.isNaN(n)) return [0, 0, 0]
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

export function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrastRatio(a: string, b: string): number {
  const la = luminance(a)
  const lb = luminance(b)
  const [hi, lo] = la > lb ? [la, lb] : [lb, la]
  return (hi + 0.05) / (lo + 0.05)
}

/** Resolve the colours that effectively sit behind the modules. */
function backgroundColors(design: QRDesign): string[] {
  const bg = design.background
  if (bg.mode === 'transparent') return [design.frame.enabled ? design.frame.fill : '#ffffff']
  return bg.mode === 'solid' ? [bg.colors[0]] : bg.colors
}

export function scanWarnings(design: QRDesign): Warning[] {
  const out: Warning[] = []
  const fg = design.fill.mode === 'solid' ? [design.fill.colors[0]] : design.fill.colors
  const bg = backgroundColors(design)

  let worst = Infinity
  for (const f of fg) for (const b of bg) worst = Math.min(worst, contrastRatio(f, b))

  const darkestFg = Math.min(...fg.map(luminance))
  const lightestBg = Math.max(...bg.map(luminance))
  const darkestBg = Math.min(...bg.map(luminance))

  if (worst < 2) {
    out.push({
      level: 'error',
      message: `Contrast is very low (${worst.toFixed(1)}:1). Most cameras won’t read this — darken the code or lighten the background.`,
    })
  } else if (worst < 3.5) {
    out.push({
      level: 'warn',
      message: `Contrast is low (${worst.toFixed(1)}:1). Aim for 4:1 or higher so every phone can scan it.`,
    })
  }

  if (darkestFg > darkestBg && worst >= 2 && luminance(fg[0]) > lightestBg - 0.001) {
    out.push({
      level: 'warn',
      message: 'The code is lighter than its background (inverted). Some older scanners can’t read inverted codes.',
    })
  } else if (fg.every((c) => luminance(c) > Math.min(...bg.map(luminance))) && worst >= 2) {
    out.push({
      level: 'warn',
      message: 'The code is lighter than its background (inverted). Some older scanners can’t read inverted codes.',
    })
  }

  if (design.logo.src) {
    if (design.logo.size > 0.3) {
      out.push({
        level: 'error',
        message: 'The center logo is too large and will likely block scanning. Keep it at 25% or less.',
      })
    } else if (design.logo.size > 0.25) {
      out.push({
        level: 'warn',
        message: 'A large center logo reduces scan reliability. Test with a few phones, or shrink it.',
      })
    }
  }

  if (design.eyeColorMode === 'custom') {
    const eyes = [design.eyeOuterColor, design.eyeInnerColor]
    const eyeWorst = Math.min(...eyes.flatMap((e) => bg.map((b) => contrastRatio(e, b))))
    if (eyeWorst < 3) {
      out.push({ level: 'warn', message: 'The corner eyes have low contrast and may be hard for cameras to lock onto.' })
    }
  }

  // de-duplicate identical inverted messages
  return out.filter((w, i) => out.findIndex((x) => x.message === w.message) === i)
}
