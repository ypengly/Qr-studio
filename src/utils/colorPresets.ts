import type { QRDesign } from '../types/qr.types'

export const FONT_OPTIONS = [
  { label: 'Inter', value: 'Inter' },
  { label: 'Playfair Display', value: 'Playfair Display' },
  { label: 'Space Grotesk', value: 'Space Grotesk' },
  { label: 'Poppins', value: 'Poppins' },
  { label: 'JetBrains Mono', value: 'JetBrains Mono' },
]

/** Professional colour palettes for quick foreground choices. */
export const PALETTES: { name: string; colors: string[] }[] = [
  { name: 'Ink', colors: ['#111827', '#1f2937', '#374151', '#0f172a'] },
  { name: 'Ocean', colors: ['#0c4a6e', '#0369a1', '#0ea5e9', '#38bdf8'] },
  { name: 'Violet', colors: ['#312e81', '#4f46e5', '#7c3aed', '#a855f7'] },
  { name: 'Forest', colors: ['#14532d', '#166534', '#15803d', '#22c55e'] },
  { name: 'Sunset', colors: ['#7c2d12', '#c2410c', '#f97316', '#fb7185'] },
  { name: 'Rose', colors: ['#881337', '#be123c', '#e11d48', '#f472b6'] },
  { name: 'Gold', colors: ['#78350f', '#a16207', '#ca8a04', '#eab308'] },
  { name: 'Slate', colors: ['#0f172a', '#334155', '#64748b', '#94a3b8'] },
]

/** Soft pastel backgrounds for the QR surface. */
export const PASTEL_BACKGROUNDS: { name: string; color: string }[] = [
  { name: 'Cloud', color: '#ffffff' },
  { name: 'Lavender', color: '#f1ecff' },
  { name: 'Mint', color: '#e8f8ef' },
  { name: 'Peach', color: '#fff0e6' },
  { name: 'Sky', color: '#e6f3ff' },
  { name: 'Blush', color: '#ffeaf1' },
  { name: 'Butter', color: '#fff8dc' },
  { name: 'Sand', color: '#f7f1e8' },
]

export const defaultDesign = (): QRDesign => ({
  dotStyle: 'rounded',
  eyeOuter: 'extra-rounded',
  eyeInner: 'dot',
  eyeColorMode: 'match',
  eyeOuterColor: '#111827',
  eyeInnerColor: '#111827',
  fill: { mode: 'solid', colors: ['#111827'], rotation: 45 },
  background: { mode: 'solid', colors: ['#ffffff'], rotation: 45 },
  ecc: 'auto',
  logo: { src: null, size: 0.2, backing: true, backingColor: '#ffffff', rounded: true },
  frame: { enabled: true, color: '#e4e4ef', fill: '#ffffff', width: 4, radius: 56, padding: 56 },
  label: {
    mode: 'scan-me',
    text: 'SCAN ME',
    position: 'bottom',
    fontFamily: 'Inter',
    color: '#ffffff',
    size: 34,
    pill: true,
    pillColor: '#111827',
  },
  text: {
    fontFamily: 'Inter',
    titleColor: '#111827',
    descriptionColor: '#6b7280',
    titleSize: 56,
  },
})

export interface DesignPreset {
  id: string
  name: string
  design: Partial<QRDesign>
}

const base = defaultDesign()

/** Merge helper used by presets so each one only states what differs. */
const preset = (id: string, name: string, over: Partial<QRDesign>): DesignPreset => ({
  id,
  name,
  design: { ...over },
})

export const PRESETS: DesignPreset[] = [
  preset('minimal-black', 'Minimal Black', {
    dotStyle: 'square',
    eyeOuter: 'square',
    eyeInner: 'square',
    eyeColorMode: 'match',
    fill: { mode: 'solid', colors: ['#0a0a0a'], rotation: 0 },
    background: { mode: 'solid', colors: ['#ffffff'], rotation: 0 },
    frame: { ...base.frame, color: '#0a0a0a', fill: '#ffffff', width: 5, radius: 12, padding: 52 },
    label: { ...base.label, pillColor: '#0a0a0a', color: '#0a0a0a', pill: false, text: 'SCAN ME', size: 36 },
    text: { ...base.text, titleColor: '#0a0a0a', descriptionColor: '#6b7280', fontFamily: 'Space Grotesk' },
  }),
  preset('midnight-blue', 'Midnight Blue', {
    dotStyle: 'rounded',
    eyeOuter: 'extra-rounded',
    eyeInner: 'dot',
    eyeColorMode: 'custom',
    eyeOuterColor: '#1e3a8a',
    eyeInnerColor: '#2563eb',
    fill: { mode: 'linear', colors: ['#0b1b4d', '#1d4ed8'], rotation: 45 },
    background: { mode: 'solid', colors: ['#eef3ff'], rotation: 0 },
    frame: { ...base.frame, color: '#0b1b4d', fill: '#eef3ff', width: 5, radius: 64, padding: 56 },
    label: { ...base.label, pillColor: '#0b1b4d', color: '#ffffff' },
    text: { ...base.text, titleColor: '#0b1b4d', descriptionColor: '#51628f' },
  }),
  preset('luxury-gold', 'Luxury Gold', {
    dotStyle: 'classy-rounded',
    eyeOuter: 'extra-rounded',
    eyeInner: 'dot',
    eyeColorMode: 'custom',
    eyeOuterColor: '#7a5a12',
    eyeInnerColor: '#b8860b',
    fill: { mode: 'linear', colors: ['#6b4e0f', '#b8860b', '#8a6a14'], rotation: 45 },
    background: { mode: 'solid', colors: ['#fffaf0'], rotation: 0 },
    frame: { ...base.frame, color: '#b8860b', fill: '#fffaf0', width: 6, radius: 40, padding: 60 },
    label: { ...base.label, pillColor: '#1a1405', color: '#e8c76a', fontFamily: 'Playfair Display', text: 'SCAN TO VISIT', size: 34 },
    text: { ...base.text, titleColor: '#3b2a06', descriptionColor: '#8a7a55', fontFamily: 'Playfair Display' },
  }),
  preset('soft-pastel', 'Soft Pastel', {
    dotStyle: 'dots',
    eyeOuter: 'dot',
    eyeInner: 'dot',
    eyeColorMode: 'custom',
    eyeOuterColor: '#8b7bd8',
    eyeInnerColor: '#f08bb3',
    fill: { mode: 'linear', colors: ['#8b7bd8', '#f08bb3'], rotation: 45 },
    background: { mode: 'solid', colors: ['#fdf6ff'], rotation: 0 },
    frame: { ...base.frame, color: '#e7d9f7', fill: '#fdf6ff', width: 5, radius: 80, padding: 56 },
    label: { ...base.label, pillColor: '#b9a7ee', color: '#ffffff', fontFamily: 'Poppins', text: 'SCAN ME' },
    text: { ...base.text, titleColor: '#5b4a91', descriptionColor: '#9a8fbd', fontFamily: 'Poppins' },
  }),
  preset('ocean-blue', 'Ocean Blue', {
    dotStyle: 'extra-rounded',
    eyeOuter: 'extra-rounded',
    eyeInner: 'dot',
    eyeColorMode: 'custom',
    eyeOuterColor: '#075985',
    eyeInnerColor: '#0ea5e9',
    fill: { mode: 'linear', colors: ['#075985', '#06b6d4'], rotation: 135 },
    background: { mode: 'solid', colors: ['#f0faff'], rotation: 0 },
    frame: { ...base.frame, color: '#bae6fd', fill: '#f0faff', width: 5, radius: 64, padding: 56 },
    label: { ...base.label, pillColor: '#0369a1', color: '#ffffff' },
    text: { ...base.text, titleColor: '#0c4a6e', descriptionColor: '#5c8aa3' },
  }),
  preset('neon-purple', 'Neon Purple', {
    dotStyle: 'dots',
    eyeOuter: 'extra-rounded',
    eyeInner: 'dot',
    eyeColorMode: 'custom',
    eyeOuterColor: '#5b21b6',
    eyeInnerColor: '#c026d3',
    fill: { mode: 'linear', colors: ['#4c1d95', '#c026d3'], rotation: 45 },
    background: { mode: 'solid', colors: ['#faf5ff'], rotation: 0 },
    frame: { ...base.frame, color: '#a855f7', fill: '#160b2e', width: 6, radius: 64, padding: 56 },
    label: { ...base.label, pillColor: '#d946ef', color: '#160b2e', fontFamily: 'Space Grotesk', text: 'SCAN ME', size: 36 },
    text: { ...base.text, titleColor: '#f5d0fe', descriptionColor: '#a78bca', fontFamily: 'Space Grotesk' },
  }),
  preset('forest-green', 'Forest Green', {
    dotStyle: 'rounded',
    eyeOuter: 'extra-rounded',
    eyeInner: 'square',
    eyeColorMode: 'custom',
    eyeOuterColor: '#14532d',
    eyeInnerColor: '#16a34a',
    fill: { mode: 'linear', colors: ['#14532d', '#22863a'], rotation: 45 },
    background: { mode: 'solid', colors: ['#f2faf3'], rotation: 0 },
    frame: { ...base.frame, color: '#14532d', fill: '#f2faf3', width: 5, radius: 48, padding: 56 },
    label: { ...base.label, pillColor: '#166534', color: '#ffffff', text: 'SCAN ME' },
    text: { ...base.text, titleColor: '#14532d', descriptionColor: '#5f8a6a' },
  }),
  preset('modern-gradient', 'Modern Gradient', {
    dotStyle: 'extra-rounded',
    eyeOuter: 'extra-rounded',
    eyeInner: 'dot',
    eyeColorMode: 'match',
    fill: { mode: 'linear', colors: ['#2563eb', '#7c3aed', '#db2777'], rotation: 45 },
    background: { mode: 'solid', colors: ['#ffffff'], rotation: 0 },
    frame: { ...base.frame, color: '#ede9fe', fill: '#ffffff', width: 5, radius: 72, padding: 56 },
    label: { ...base.label, pillColor: '#7c3aed', color: '#ffffff', fontFamily: 'Poppins' },
    text: { ...base.text, titleColor: '#1e1b4b', descriptionColor: '#6b7280', fontFamily: 'Poppins' },
  }),
  preset('rose-pink', 'Rose Pink', {
    dotStyle: 'classy-rounded',
    eyeOuter: 'extra-rounded',
    eyeInner: 'dot',
    eyeColorMode: 'custom',
    eyeOuterColor: '#9f1239',
    eyeInnerColor: '#e11d48',
    fill: { mode: 'linear', colors: ['#9f1239', '#f43f5e'], rotation: 45 },
    background: { mode: 'solid', colors: ['#fff1f4'], rotation: 0 },
    frame: { ...base.frame, color: '#fecdd3', fill: '#fff1f4', width: 5, radius: 72, padding: 56 },
    label: { ...base.label, pillColor: '#e11d48', color: '#ffffff', fontFamily: 'Playfair Display', text: 'SCAN ME' },
    text: { ...base.text, titleColor: '#881337', descriptionColor: '#b4747f', fontFamily: 'Playfair Display' },
  }),
  preset('elegant-white', 'Elegant White', {
    dotStyle: 'classy',
    eyeOuter: 'square',
    eyeInner: 'square',
    eyeColorMode: 'custom',
    eyeOuterColor: '#27272a',
    eyeInnerColor: '#52525b',
    fill: { mode: 'solid', colors: ['#27272a'], rotation: 0 },
    background: { mode: 'solid', colors: ['#fafaf9'], rotation: 0 },
    frame: { ...base.frame, color: '#d6d3d1', fill: '#fafaf9', width: 3, radius: 28, padding: 64 },
    label: { ...base.label, pillColor: '#27272a', color: '#27272a', pill: false, fontFamily: 'Playfair Display', text: 'SCAN ME', size: 36 },
    text: { ...base.text, titleColor: '#27272a', descriptionColor: '#78716c', fontFamily: 'Playfair Display' },
  }),
]

/** Apply a preset on top of the current design, keeping logo/ecc choices. */
export function applyPreset(current: QRDesign, p: DesignPreset): QRDesign {
  return {
    ...current,
    ...p.design,
    logo: { ...current.logo },
    ecc: current.ecc,
  }
}
