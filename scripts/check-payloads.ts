/* Sanity checks for the QR payload builders. Run with: npm test */
import { buildPayload, defaultContent, escapeWifi } from '../src/utils/qrContent'
import { validateContent } from '../src/utils/validation'

let failed = 0
const eq = (name: string, got: unknown, want: unknown) => {
  const ok = got === want
  if (!ok) failed++
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : `\n      got:  ${JSON.stringify(got)}\n      want: ${JSON.stringify(want)}`}`)
}

const c = defaultContent()

c.wifi = { ssid: 'Home', password: 'secret', security: 'WPA', hidden: false }
eq('wifi WPA', buildPayload('wifi', c), 'WIFI:T:WPA;S:Home;P:secret;;')
c.wifi = { ssid: 'My;Net', password: 'p:a"ss,\\', security: 'WPA', hidden: true }
eq('wifi escaping + hidden', buildPayload('wifi', c), String.raw`WIFI:T:WPA;S:My\;Net;P:p\:a\"ss\,\\;H:true;;`)
c.wifi = { ssid: 'Cafe', password: 'ignored', security: 'nopass', hidden: false }
eq('wifi open network omits password', buildPayload('wifi', c), 'WIFI:T:nopass;S:Cafe;;')
eq('escapeWifi', escapeWifi('a;b'), String.raw`a\;b`)

c.url = { url: 'example.com/path' }
eq('url adds https', buildPayload('url', c), 'https://example.com/path')
c.url = { url: 'http://example.com' }
eq('url keeps scheme', buildPayload('url', c), 'http://example.com')

c.email = { to: 'a@b.co', subject: 'Hi there', body: 'Line1\nLine2' }
eq('email', buildPayload('email', c), 'mailto:a@b.co?subject=Hi%20there&body=Line1%0ALine2')
c.phone = { phone: '+1 (555) 123-4567' }
eq('phone', buildPayload('phone', c), 'tel:+15551234567')
c.sms = { phone: '+15551234567', message: 'Hello world' }
eq('sms', buildPayload('sms', c), 'sms:+15551234567?body=Hello%20world')
c.whatsapp = { phone: '+855 12 345 678', message: 'Hi!' }
eq('whatsapp', buildPayload('whatsapp', c), 'https://wa.me/85512345678?text=Hi!')
c.whatsapp = { phone: '+855 12 345 678', message: '' }
eq('whatsapp no message', buildPayload('whatsapp', c), 'https://wa.me/85512345678')
c.location = { lat: '13.7563', lng: '100.5018' }
eq('location', buildPayload('location', c), 'https://www.google.com/maps?q=13.7563,100.5018')

c.social = { platform: 'instagram', handle: '@studio' }
eq('instagram', buildPayload('social', c), 'https://instagram.com/studio')
c.social = { platform: 'tiktok', handle: 'studio' }
eq('tiktok', buildPayload('social', c), 'https://tiktok.com/@studio')
c.social = { platform: 'telegram', handle: 'studio' }
eq('telegram', buildPayload('social', c), 'https://t.me/studio')
c.social = { platform: 'youtube', handle: 'https://youtube.com/@x' }
eq('social full url passthrough', buildPayload('social', c), 'https://youtube.com/@x')

c.vcard = { fullName: 'Jane Q Doe', phone: '+1 555 1', email: 'j@d.com', company: 'Acme, Inc', website: 'acme.com', address: '1 Main St' }
const v = buildPayload('vcard', c)
eq('vcard envelope', v.startsWith('BEGIN:VCARD\r\nVERSION:3.0') && v.endsWith('END:VCARD'), true)
eq('vcard name split', v.includes('N:Doe;Jane Q;;;') && v.includes('FN:Jane Q Doe'), true)
eq('vcard escapes comma', v.includes('ORG:Acme\\, Inc'), true)

// validation
c.url = { url: 'not a url' }
eq('invalid url rejected', validateContent('url', c).valid, false)
c.url = { url: 'example.com' }
eq('valid url accepted', validateContent('url', c).valid, true)
c.location = { lat: '120', lng: '10' }
eq('bad latitude rejected', validateContent('location', c).valid, false)
c.whatsapp = { phone: '012345678', message: '' }
eq('whatsapp needs country code', validateContent('whatsapp', c).valid, false)
eq('empty content is not valid', validateContent('text', defaultContent()).valid, false)

console.log(failed ? `\n${failed} FAILED` : '\nAll payload checks passed')
process.exit(failed ? 1 : 0)
