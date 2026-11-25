import QRCodeStyling, { type Options } from 'qr-code-styling'
import qrcode from 'qrcode-generator'
import type { BackgroundFill, EccLevel, Fill, LogoSettings, QRDesign, QRMeta } from '../types/qr.types'
import { contrastRatio } from '../utils/validation'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function resolveEcc(design: QRDesign): EccLevel {
  if (design.ecc !== 'auto') return design.ecc
  return design.logo.src ? 'H' : 'Q'
}

/** Number of modules per side for this payload — used to size a true 4-module quiet zone. */
export function moduleCount(payload: string, ecc: EccLevel): number {
  const q = qrcode(0, ecc)
  const funcs = (qrcode as unknown as { stringToBytesFuncs?: Record<string, (s: string) => number[]> })
    .stringToBytesFuncs
  if (funcs?.['UTF-8']) (qrcode as unknown as { stringToBytes: (s: string) => number[] }).stringToBytes = funcs['UTF-8']
  q.addData(payload, 'Byte')
  q.make()
  return q.getModuleCount()
}

const toGradient = (f: Fill | BackgroundFill) => {
  if (f.mode === 'solid' || f.mode === 'transparent' || f.colors.length < 2) return undefined
  const n = f.colors.length
  return {
    type: (f.mode === 'radial' ? 'radial' : 'linear') as 'radial' | 'linear',
    rotation: (f.rotation * Math.PI) / 180,
    colorStops: f.colors.map((color, i) => ({ offset: i / (n - 1), color })),
  }
}

// ---------------------------------------------------------------------------
// Logo composition (backing + rounded container baked into one image)
// ---------------------------------------------------------------------------

const logoCache = new Map<string, Promise<string>>()

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Could not load logo image'))
    img.src = src
  })

function roundedRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2))
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}

export function composeLogo(logo: LogoSettings): Promise<string> | undefined {
  if (!logo.src) return undefined
  const key = JSON.stringify([logo.src.length, logo.src.slice(-64), logo.backing, logo.backingColor, logo.rounded])
  let hit = logoCache.get(key)
  if (!hit) {
    const src = logo.src
    hit = (async () => {
      const img = await loadImage(src)
      const S = 512
      const c = document.createElement('canvas')
      c.width = S
      c.height = S
      const ctx = c.getContext('2d')!
      const radius = logo.rounded ? S * 0.24 : 0
      const inset = logo.backing ? S * 0.14 : 0
      if (logo.backing) {
        roundedRectPath(ctx, 0, 0, S, S, radius)
        ctx.fillStyle = logo.backingColor
        ctx.fill()
      }
      const box = S - inset * 2
      const scale = Math.min(box / img.width, box / img.height)
      const w = img.width * scale
      const h = img.height * scale
      ctx.save()
      if (logo.rounded && !logo.backing) {
        roundedRectPath(ctx, 0, 0, S, S, radius)
        ctx.clip()
      } else if (logo.rounded) {
        roundedRectPath(ctx, inset, inset, box, box, radius * 0.6)
        ctx.clip()
      }
      ctx.drawImage(img, (S - w) / 2, (S - h) / 2, w, h)
      ctx.restore()
      return c.toDataURL('image/png')
    })()
    logoCache.set(key, hit)
    if (logoCache.size > 12) logoCache.delete(logoCache.keys().next().value as string)
  }
  return hit
}

// ---------------------------------------------------------------------------
// qr-code-styling options
// ---------------------------------------------------------------------------

export async function buildOptions(
  payload: string,
  design: QRDesign,
  sidePx: number,
  type: 'canvas' | 'svg' = 'canvas',
): Promise<Options> {
  const ecc = resolveEcc(design)
  const count = moduleCount(payload, ecc)
  // Quiet zone of exactly 4 modules on every side, as the QR spec requires.
  const margin = Math.round((sidePx * 4) / (count + 8))

  const fill = design.fill
  const dotGradient = toGradient(fill)
  const matchEyes = design.eyeColorMode === 'match'

  const bg = design.background
  const bgGradient = toGradient(bg)
  const bgTransparent = bg.mode === 'transparent'

  const image = design.logo.src ? await composeLogo(design.logo) : undefined

  return {
    width: sidePx,
    height: sidePx,
    type,
    data: payload,
    margin,
    qrOptions: { errorCorrectionLevel: ecc },
    dotsOptions: { type: design.dotStyle, color: fill.colors[0], gradient: dotGradient },
    cornersSquareOptions: {
      type: design.eyeOuter,
      color: matchEyes ? fill.colors[0] : design.eyeOuterColor,
      gradient: matchEyes ? dotGradient : undefined,
    },
    cornersDotOptions: {
      type: design.eyeInner,
      color: matchEyes ? fill.colors[fill.colors.length - 1] : design.eyeInnerColor,
      gradient: matchEyes ? dotGradient : undefined,
    },
    backgroundOptions: {
      color: bgTransparent ? 'rgba(0,0,0,0)' : bg.colors[0],
      gradient: bgGradient,
      round: design.frame.enabled && !bgTransparent ? 0.1 : 0,
    },
    image,
    imageOptions: {
      hideBackgroundDots: true,
      imageSize: design.logo.size,
      margin: 0,
      crossOrigin: 'anonymous',
    },
  }
}

async function qrBlob(
  payload: string,
  design: QRDesign,
  sidePx: number,
  format: 'png' | 'svg',
): Promise<Blob> {
  const options = await buildOptions(payload, design, sidePx, format === 'svg' ? 'svg' : 'canvas')
  const qr = new QRCodeStyling(options)
  const raw = await qr.getRawData(format)
  if (!raw) throw new Error('QR rendering failed')
  return raw as Blob
}

/** Pure vector QR (no frame/labels). */
export const renderQRSvg = (payload: string, design: QRDesign) => qrBlob(payload, design, 1024, 'svg')

// ---------------------------------------------------------------------------
// Fonts
// ---------------------------------------------------------------------------

const fontLoads = new Map<string, Promise<void>>()

export function ensureFont(family: string): Promise<void> {
  let p = fontLoads.get(family)
  if (!p) {
    p = (async () => {
      if (!('fonts' in document)) return
      const loads = [400, 500, 600, 700].map((w) => document.fonts.load(`${w} 40px "${family}"`).catch(() => []))
      await Promise.race([Promise.all(loads), new Promise((r) => setTimeout(r, 2000))])
    })()
    fontLoads.set(family, p)
  }
  return p
}

// ---------------------------------------------------------------------------
// Composite renderer: QR + frame + label + title + description
// Used for BOTH the live preview and every export, so downloads match the preview.
// ---------------------------------------------------------------------------

export interface CompositeOptions {
  /** width in px of the final image */
  size: number
  includeTitle: boolean
  includeDescription: boolean
  includeFrame: boolean
  /** 'transparent' or a CSS colour for the outer page */
  pageBackground: 'transparent' | string
}

export const PREVIEW_COMPOSITE: Omit<CompositeOptions, 'size'> = {
  includeTitle: true,
  includeDescription: true,
  includeFrame: true,
  pageBackground: 'transparent',
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number, maxLines: number): string[] {
  const paragraphs = text.split(/\r?\n/)
  const lines: string[] = []
  for (const para of paragraphs) {
    const words = para.split(/\s+/).filter(Boolean)
    let line = ''
    const push = (l: string) => lines.push(l)
    for (const w of words) {
      const test = line ? `${line} ${w}` : w
      if (ctx.measureText(test).width <= maxW) {
        line = test
      } else {
        if (line) push(line)
        // very long single word: break by characters
        if (ctx.measureText(w).width > maxW) {
          let chunk = ''
          for (const ch of w) {
            if (ctx.measureText(chunk + ch).width > maxW) {
              push(chunk)
              chunk = ch
            } else chunk += ch
          }
          line = chunk
        } else line = w
      }
    }
    if (line) push(line)
  }
  if (lines.length <= maxLines) return lines
  const kept = lines.slice(0, maxLines)
  let last = kept[maxLines - 1]
  while (last.length > 1 && ctx.measureText(`${last}…`).width > maxW) last = last.slice(0, -1)
  kept[maxLines - 1] = `${last}…`
  return kept
}

/** Pick a readable text colour for a given backdrop. */
function legible(color: string, backdrop: string): string {
  return contrastRatio(color, backdrop) >= 3 ? color : '#111827'
}

export async function renderComposite(
  payload: string,
  design: QRDesign,
  meta: QRMeta,
  opts: CompositeOptions,
): Promise<HTMLCanvasElement> {
  await Promise.all([ensureFont(design.text.fontFamily), ensureFont(design.label.fontFamily)])

  const W = Math.round(opts.size)
  const u = W / 1000
  const pad = 36 * u
  const gap = 30 * u
  const showFrame = design.frame.enabled && opts.includeFrame
  const inner = showFrame ? design.frame.padding * u : 0
  const contentW = W - 2 * pad - 2 * inner
  const qrSide = Math.max(64, Math.round(contentW))

  const measure = document.createElement('canvas').getContext('2d')!

  // Colours that must stay legible when the frame card is not painted.
  const backdrop =
    showFrame ? design.frame.fill : opts.pageBackground === 'transparent' ? '#ffffff' : opts.pageBackground

  // ----- label -----
  const lb = design.label
  const labelText = lb.mode === 'none' ? '' : lb.text.trim()
  const labelFs = lb.size * u
  const labelFont = `700 ${labelFs}px "${lb.fontFamily}", system-ui, sans-serif`
  let labelW = 0
  let labelH = 0
  if (labelText) {
    measure.font = labelFont
    const tw = measure.measureText(labelText).width + labelFs * 0.08 * labelText.length
    labelW = lb.pill ? tw + labelFs * 2.6 : tw
    labelH = lb.pill ? labelFs * 2.2 : labelFs * 1.4
    labelW = Math.min(labelW, contentW)
  }

  // ----- title / description -----
  const tx = design.text
  const titleFs = tx.titleSize * u
  const titleFont = `700 ${titleFs}px "${tx.fontFamily}", system-ui, sans-serif`
  const descFs = Math.max(26, tx.titleSize * 0.58) * u
  const descFont = `400 ${descFs}px "${tx.fontFamily}", system-ui, sans-serif`

  let titleLines: string[] = []
  if (opts.includeTitle && meta.title.trim()) {
    measure.font = titleFont
    titleLines = wrapText(measure, meta.title.trim(), contentW, 2)
  }
  let descLines: string[] = []
  if (opts.includeDescription && meta.description.trim()) {
    measure.font = descFont
    descLines = wrapText(measure, meta.description.trim(), contentW, 3)
  }
  const titleLH = titleFs * 1.25
  const descLH = descFs * 1.45

  // ----- vertical layout -----
  type Item = { kind: 'label' | 'qr' | 'title' | 'desc'; y: number; h: number }
  const items: Item[] = []
  let y = pad + inner
  const place = (kind: Item['kind'], h: number) => {
    if (items.length) y += gap
    items.push({ kind, y, h })
    y += h
  }
  if (labelText && lb.position === 'top') place('label', labelH)
  place('qr', qrSide)
  if (labelText && lb.position === 'bottom') place('label', labelH)
  if (titleLines.length) place('title', titleLines.length * titleLH)
  if (descLines.length) place('desc', descLines.length * descLH)
  const H = Math.ceil(y + inner + pad)

  // ----- render the QR itself at final pixel size -----
  const qrImg = await createImageBitmap(await qrBlob(payload, design, qrSide, 'png'))

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingQuality = 'high'

  if (opts.pageBackground !== 'transparent') {
    ctx.fillStyle = opts.pageBackground
    ctx.fillRect(0, 0, W, H)
  }

  if (showFrame) {
    const fw = design.frame.width * u
    roundedRectPath(ctx, pad, pad, W - 2 * pad, H - 2 * pad, design.frame.radius * u)
    ctx.fillStyle = design.frame.fill
    ctx.fill()
    if (fw > 0) {
      ctx.save()
      roundedRectPath(ctx, pad + fw / 2, pad + fw / 2, W - 2 * pad - fw, H - 2 * pad - fw, Math.max(0, design.frame.radius * u - fw / 2))
      ctx.lineWidth = fw
      ctx.strokeStyle = design.frame.color
      ctx.stroke()
      ctx.restore()
    }
  }

  const cx = W / 2
  for (const it of items) {
    if (it.kind === 'qr') {
      ctx.drawImage(qrImg, Math.round(cx - qrSide / 2), Math.round(it.y), qrSide, qrSide)
    } else if (it.kind === 'label') {
      ctx.font = labelFont
      ctx.textBaseline = 'middle'
      ctx.textAlign = 'center'
      if (lb.pill) {
        roundedRectPath(ctx, cx - labelW / 2, it.y, labelW, labelH, labelH / 2)
        ctx.fillStyle = lb.pillColor
        ctx.fill()
        ctx.fillStyle = lb.color
      } else {
        ctx.fillStyle = legible(lb.color, backdrop)
      }
      // letter-spaced text
      const spacing = labelFs * 0.08
      const chars = [...labelText]
      const widths = chars.map((c) => ctx.measureText(c).width + spacing)
      let x = cx - widths.reduce((a, b) => a + b, 0) / 2 + spacing / 2
      ctx.textAlign = 'left'
      chars.forEach((c, i) => {
        ctx.fillText(c, x, it.y + labelH / 2 + labelFs * 0.04)
        x += widths[i]
      })
    } else if (it.kind === 'title') {
      ctx.font = titleFont
      ctx.fillStyle = showFrame ? tx.titleColor : legible(tx.titleColor, backdrop)
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      titleLines.forEach((l, i) => ctx.fillText(l, cx, it.y + titleLH * (i + 0.5)))
    } else {
      ctx.font = descFont
      ctx.fillStyle = showFrame ? tx.descriptionColor : legible(tx.descriptionColor, backdrop)
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      descLines.forEach((l, i) => ctx.fillText(l, cx, it.y + descLH * (i + 0.5)))
    }
  }

  qrImg.close()
  return canvas
}

// ---------------------------------------------------------------------------
// Thumbnails
// ---------------------------------------------------------------------------

export async function makeThumbnail(payload: string, design: QRDesign, meta: QRMeta, size = 420): Promise<string> {
  const c = await renderComposite(payload, design, meta, {
    size,
    includeTitle: true,
    includeDescription: false,
    includeFrame: true,
    pageBackground: '#ffffff',
  })
  return c.toDataURL('image/jpeg', 0.88)
}

const presetThumbs = new Map<string, Promise<string>>()

export function presetThumbnail(id: string, design: QRDesign, payload: string): Promise<string> {
  let p = presetThumbs.get(id)
  if (!p) {
    p = renderComposite(payload, design, { title: '', description: '' }, {
      size: 320,
      includeTitle: false,
      includeDescription: false,
      includeFrame: true,
      pageBackground: 'transparent',
    }).then((c) => c.toDataURL('image/png'))
    presetThumbs.set(id, p)
  }
  return p
}
