import { colors } from './colors'

export const fonts = {
  /** Loaded from Google Fonts in index.html */
  base: "'Mulish', system-ui, sans-serif",
  mono: 'ui-monospace, SFMono-Regular, Menlo, monospace',
} as const

export const gradients = {
  /** Filled maroon buttons (Invest More, Redeem, Make Payment) */
  primaryButton: `linear-gradient(135deg,${colors.brand.wine},${colors.brand.wineDeep})`,
  /** Thin accent strip on top of dialogs */
  accentBar: 'linear-gradient(90deg,#8b2a2a,#c98f5a 65%,#d9bf8a)',
  /** AIF expanded sidebar */
  sidebar: 'linear-gradient(180deg,#fcf9f5,#fbf8f3)',
  /** Moving highlight on skeleton blocks */
  shimmer: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,.65) 50%, transparent 100%)',
} as const

export const shadows = {
  /** Active toggle pill */
  toggle: '0 1px 2px rgba(0,0,0,.06)',
  /** Small round arrow buttons */
  arrow: '0 2px 6px rgba(0,0,0,.08)',
  /** Dialog paper */
  dialog: '0 1.5rem 4rem rgba(0,0,0,.25)',
} as const

export const overlays = {
  /** Dialog backdrop */
  backdrop: 'rgba(60,45,35,0.55)',
  /** Disabled carousel arrow background */
  arrowDisabled: 'rgba(233,226,221,.92)',
} as const
