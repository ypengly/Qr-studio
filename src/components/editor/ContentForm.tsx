import { useState } from 'react'
import { Eye, EyeOff, LocateFixed } from 'lucide-react'
import type { ContentData, ContentState, ContentType, SocialPlatform, WifiSecurity } from '../../types/qr.types'
import { SOCIAL_PLATFORMS } from '../../utils/qrContent'
import { Field, Segmented, Toggle } from '../ui/Controls'
import { useToast } from '../ui/Toast'

interface Props {
  type: ContentType
  content: ContentState
  errors: Record<string, string>
  onChange: <K extends ContentType>(type: K, patch: Partial<ContentData[K]>) => void
}

export function ContentForm({ type, content, errors, onChange }: Props) {
  const toast = useToast()
  const [showPw, setShowPw] = useState(false)
  const err = (k: string) => errors[k]

  switch (type) {
    case 'url':
      return (
        <div className="space-y-4">
          <Field label="Website address" error={err('url')} hint="Websites, portfolios, social profiles, online stores — anything with a link.">
            <input
              className="input"
              inputMode="url"
              autoComplete="off"
              placeholder="https://yourwebsite.com"
              value={content.url.url}
              onChange={(e) => onChange('url', { url: e.target.value })}
            />
          </Field>
        </div>
      )

    case 'wifi': {
      const w = content.wifi
      return (
        <div className="space-y-4">
          <Field label="Network name (SSID)">
            <input
              className="input"
              autoComplete="off"
              placeholder="My Home Wi-Fi"
              value={w.ssid}
              onChange={(e) => onChange('wifi', { ssid: e.target.value })}
            />
          </Field>
          <Field label="Security">
            <Segmented<WifiSecurity>
              value={w.security}
              onChange={(security) => onChange('wifi', { security })}
              options={[
                { value: 'WPA', label: 'WPA/WPA2' },
                { value: 'WEP', label: 'WEP' },
                { value: 'nopass', label: 'None' },
              ]}
            />
          </Field>
          {w.security !== 'nopass' && (
            <Field label="Password" error={err('password')}>
              <div className="relative">
                <input
                  className="input pr-11"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="off"
                  placeholder="Network password"
                  value={w.password}
                  onChange={(e) => onChange('wifi', { password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-ink-400 hover:text-ink-700"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>
          )}
          <Toggle
            checked={w.hidden}
            onChange={(hidden) => onChange('wifi', { hidden })}
            label="Hidden network"
            hint="Turn on if the network doesn’t broadcast its name."
          />
        </div>
      )
    }

    case 'text':
      return (
        <Field label="Text or message" error={err('length')} hint="Multiline text is supported.">
          <textarea
            className="input min-h-[140px] resize-y"
            placeholder="Type anything…"
            value={content.text.text}
            onChange={(e) => onChange('text', { text: e.target.value })}
          />
        </Field>
      )

    case 'email':
      return (
        <div className="space-y-4">
          <Field label="Email address" error={err('to')}>
            <input
              className="input"
              type="email"
              inputMode="email"
              placeholder="hello@example.com"
              value={content.email.to}
              onChange={(e) => onChange('email', { to: e.target.value })}
            />
          </Field>
          <Field label="Subject">
            <input
              className="input"
              placeholder="Optional subject"
              value={content.email.subject}
              onChange={(e) => onChange('email', { subject: e.target.value })}
            />
          </Field>
          <Field label="Message" error={err('length')}>
            <textarea
              className="input min-h-[100px] resize-y"
              placeholder="Optional pre-filled message"
              value={content.email.body}
              onChange={(e) => onChange('email', { body: e.target.value })}
            />
          </Field>
        </div>
      )

    case 'phone':
      return (
        <Field label="Phone number" error={err('phone')} hint="Scanning opens the dialer with this number.">
          <input
            className="input"
            type="tel"
            inputMode="tel"
            placeholder="+1 555 123 4567"
            value={content.phone.phone}
            onChange={(e) => onChange('phone', { phone: e.target.value })}
          />
        </Field>
      )

    case 'sms':
      return (
        <div className="space-y-4">
          <Field label="Phone number" error={err('phone')}>
            <input
              className="input"
              type="tel"
              inputMode="tel"
              placeholder="+1 555 123 4567"
              value={content.sms.phone}
              onChange={(e) => onChange('sms', { phone: e.target.value })}
            />
          </Field>
          <Field label="Pre-filled message" error={err('length')}>
            <textarea
              className="input min-h-[100px] resize-y"
              placeholder="Optional message"
              value={content.sms.message}
              onChange={(e) => onChange('sms', { message: e.target.value })}
            />
          </Field>
        </div>
      )

    case 'whatsapp':
      return (
        <div className="space-y-4">
          <Field
            label="WhatsApp number"
            error={err('phone')}
            hint="Include the country code, e.g. +855 12 345 678."
          >
            <input
              className="input"
              type="tel"
              inputMode="tel"
              placeholder="+855 12 345 678"
              value={content.whatsapp.phone}
              onChange={(e) => onChange('whatsapp', { phone: e.target.value })}
            />
          </Field>
          <Field label="Pre-filled message (optional)" error={err('length')}>
            <textarea
              className="input min-h-[90px] resize-y"
              placeholder="Hi! I’d like to know more…"
              value={content.whatsapp.message}
              onChange={(e) => onChange('whatsapp', { message: e.target.value })}
            />
          </Field>
        </div>
      )

    case 'location':
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Latitude" error={err('lat')}>
              <input
                className="input"
                inputMode="decimal"
                placeholder="13.7563"
                value={content.location.lat}
                onChange={(e) => onChange('location', { lat: e.target.value })}
              />
            </Field>
            <Field label="Longitude" error={err('lng')}>
              <input
                className="input"
                inputMode="decimal"
                placeholder="100.5018"
                value={content.location.lng}
                onChange={(e) => onChange('location', { lng: e.target.value })}
              />
            </Field>
          </div>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              if (!navigator.geolocation) return toast.error('Geolocation isn’t available in this browser.')
              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  onChange('location', {
                    lat: pos.coords.latitude.toFixed(6),
                    lng: pos.coords.longitude.toFixed(6),
                  })
                  toast.success('Location filled in.')
                },
                () => toast.error('Couldn’t get your location. Check browser permissions.'),
                { timeout: 8000 },
              )
            }}
          >
            <LocateFixed className="h-4 w-4" /> Use my current location
          </button>
        </div>
      )

    case 'vcard': {
      const v = content.vcard
      const set = (patch: Partial<ContentData['vcard']>) => onChange('vcard', patch)
      return (
        <div className="space-y-4">
          <Field label="Full name">
            <input className="input" placeholder="Jane Doe" value={v.fullName} onChange={(e) => set({ fullName: e.target.value })} />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Phone" error={err('phone')}>
              <input className="input" type="tel" placeholder="+1 555 123 4567" value={v.phone} onChange={(e) => set({ phone: e.target.value })} />
            </Field>
            <Field label="Email" error={err('email')}>
              <input className="input" type="email" placeholder="jane@company.com" value={v.email} onChange={(e) => set({ email: e.target.value })} />
            </Field>
            <Field label="Company">
              <input className="input" placeholder="Acme Inc." value={v.company} onChange={(e) => set({ company: e.target.value })} />
            </Field>
            <Field label="Website">
              <input className="input" inputMode="url" placeholder="company.com" value={v.website} onChange={(e) => set({ website: e.target.value })} />
            </Field>
          </div>
          <Field label="Address" error={err('length')}>
            <input className="input" placeholder="123 Main St, City, Country" value={v.address} onChange={(e) => set({ address: e.target.value })} />
          </Field>
        </div>
      )
    }

    case 'social': {
      const s = content.social
      const current = SOCIAL_PLATFORMS.find((p) => p.id === s.platform)!
      return (
        <div className="space-y-4">
          <Field label="Platform">
            <Segmented<SocialPlatform>
              size="sm"
              value={s.platform}
              onChange={(platform) => onChange('social', { platform })}
              options={SOCIAL_PLATFORMS.map((p) => ({ value: p.id, label: p.label }))}
            />
          </Field>
          <Field label="Username or profile link" hint="Enter @handle, a username, or paste the full profile URL.">
            <input
              className="input"
              autoComplete="off"
              placeholder={`@${current.placeholder}`}
              value={s.handle}
              onChange={(e) => onChange('social', { handle: e.target.value })}
            />
          </Field>
        </div>
      )
    }
  }
}
