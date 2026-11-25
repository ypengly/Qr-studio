export type ContentType =
  | 'url'
  | 'wifi'
  | 'text'
  | 'email'
  | 'phone'
  | 'sms'
  | 'whatsapp'
  | 'location'
  | 'vcard'
  | 'social'

export type WifiSecurity = 'WPA' | 'WEP' | 'nopass'
export type SocialPlatform = 'facebook' | 'instagram' | 'tiktok' | 'youtube' | 'telegram'

export interface ContentData {
  url: { url: string }
  wifi: { ssid: string; password: string; security: WifiSecurity; hidden: boolean }
  text: { text: string }
  email: { to: string; subject: string; body: string }
  phone: { phone: string }
  sms: { phone: string; message: string }
  whatsapp: { phone: string; message: string }
  location: { lat: string; lng: string }
  vcard: {
    fullName: string
    phone: string
    email: string
    company: string
    website: string
    address: string
  }
  social: { platform: SocialPlatform; handle: string }
}

/** Form values for every content type, kept together so switching tabs never loses input. */
export type ContentState = { [K in ContentType]: ContentData[K] }

// ---------- Design ----------

export type DotStyle = 'square' | 'rounded' | 'dots' | 'extra-rounded' | 'classy' | 'classy-rounded'
export type EyeOuterStyle = 'square' | 'extra-rounded' | 'dot'
export type EyeInnerStyle = 'square' | 'dot'
export type EccLevel = 'L' | 'M' | 'Q' | 'H'

export interface Fill {
  /** solid uses colors[0]; gradients use all colors evenly spaced */
  mode: 'solid' | 'linear' | 'radial'
  colors: string[]
  /** degrees, linear only */
  rotation: number
}

export interface BackgroundFill {
  mode: 'transparent' | 'solid' | 'linear'
  colors: string[]
  rotation: number
}

export interface LogoSettings {
  src: string | null
  /** fraction of the QR width (0.1–0.35) */
  size: number
  backing: boolean
  backingColor: string
  /** rounded container for the logo */
  rounded: boolean
}

export interface FrameSettings {
  enabled: boolean
  color: string
  fill: string
  /** border width, in 1000-unit space */
  width: number
  radius: number
  padding: number
}

export type LabelMode = 'none' | 'scan-me' | 'custom'

export interface LabelSettings {
  mode: LabelMode
  text: string
  position: 'top' | 'bottom'
  fontFamily: string
  color: string
  size: number
  pill: boolean
  pillColor: string
}

export interface TextSettings {
  fontFamily: string
  titleColor: string
  descriptionColor: string
  titleSize: number
}

export interface QRDesign {
  dotStyle: DotStyle
  eyeOuter: EyeOuterStyle
  eyeInner: EyeInnerStyle
  eyeColorMode: 'match' | 'custom'
  eyeOuterColor: string
  eyeInnerColor: string
  fill: Fill
  background: BackgroundFill
  /** 'auto' picks Q normally and H when a logo is present */
  ecc: 'auto' | EccLevel
  logo: LogoSettings
  frame: FrameSettings
  label: LabelSettings
  text: TextSettings
}

// ---------- Documents & storage ----------

export interface EditorDoc {
  id: string | null
  name: string
  description: string
  category: string
  type: ContentType
  content: ContentState
}

export interface SavedQR {
  id: string
  name: string
  description: string
  category: string
  type: ContentType
  content: ContentState
  design: QRDesign
  payload: string
  thumbnail: string
  createdAt: number
  updatedAt: number
}

export type ExportFormat = 'png' | 'jpg' | 'svg'

export interface ExportOptions {
  format: ExportFormat
  size: 1024 | 2048 | 4096
  /** transparent only valid for PNG */
  background: 'transparent' | 'white' | 'custom'
  customBackground: string
  quality: number
  includeTitle: boolean
  includeFrame: boolean
  includeDescription: boolean
}

export interface QRMeta {
  title: string
  description: string
}

export interface Warning {
  level: 'warn' | 'error'
  message: string
}
