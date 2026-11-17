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

/** Strategy Performance Summary page (measured from the reference screens). */
export const perfPalette = {
  disclaimerBg: 'linear-gradient(90deg,#fdf7ea,#fdf1d9)',
  disclaimerBorder: '#f3e4bf',
  disclaimerIconBg: '#fbecc6',
  disclaimerIcon: '#c98f1a',
  disclaimerText: '#8a6a1c',
  disclaimerStrong: '#6b4f12',
  track: '#efe9e4',
  // sector allocation: [dot/bar colour, bar end colour]
  sectors: [
    ['#8a2223', '#b87371'], ['#1f3a6e', '#6b7fa8'], ['#c4aa7e', '#e5d6b8'], ['#4fb037', '#a5dc96'],
    ['#dd4b39', '#f0a79e'], ['#7b5ea7', '#b6a2d3'], ['#8a97ad', '#c3cad7'], ['#b0bacb', '#d8dde6'],
  ],
  // XIRR chart + table
  chartPortfolio: '#8a2223',
  chartBenchmark: '#ab854a',
  chartPortfolioPill: '#f6e4e2',
  chartBenchmarkPill: '#f5f0e8',
  chartAxis: '#8a97ad',
  chartCategory: '#5b6475',
  chartGrid: '#ece6e0',
  tooltipBg: '#1c1411',
  tooltipText: '#ffffff',
  tableHead: '#f7f4f1',
  tableFoot: '#faf9f8',
  slate: '#8a8fa0',
  // stat card accents: [icon bg, icon colour, top strip gradient]
  statValue: ['#f6e4e2', '#8a2223', 'linear-gradient(90deg,#8a2223,#d9a9a7)'],
  statCapital: ['#e6e9f2', '#1f3a6e', 'linear-gradient(90deg,#1f3a6e,#a9b4cf)'],
  statReturn: ['#e5f3e3', '#4a9a3a', 'linear-gradient(90deg,#5ab03f,#c5e8b7)'],
  statXirr: ['#f6efe3', '#b8996a', 'linear-gradient(90deg,#c4a574,#eadfca)'],
  positive: '#4a9a3a',
  negative: '#d9483b',
  // performance tab: [value/dot colour, bar track, pill bg, pill border]
  tone: {
    maroon: ['#8a2223', '#f3e6e5', '#f6e4e2', '#ecd0cd'],
    green: ['#4a9a3a', '#e4f1e0', '#eef7ea', '#d4ebcc'],
    red: ['#d9483b', '#fbe5e2', '#fdeeec', '#f6d3ce'],
    navy: ['#1f3a6e', '#dfe4ef', '#e8ecf5', '#cdd5e6'],
    slate: ['#8a97ad', '#e9ecf1', '#eef0f4', '#dde1e8'],
  },
  chartBenchmarkLine: '#c4aa7e',
  toggleTrack: '#f3efec',
  barPortfolio: '#722530',
  barBenchmark: '#444746',
  zeroLine: '#8a97ad',
  chip: '#f3f1ef',
  // allocation: [dot/bar colour, bar end colour, pill bg, pill text]
  equity: ['#8a2223', '#b87371', '#f6e4e2', '#8a2223'],
  cash: ['#c4aa7e', '#e5d6b8', '#f7f1e6', '#c4a574'],
  debt: ['#1f3a6e', '#6b7fa8', '#e8ecf5', '#1f3a6e'],
  derivatives: ['#7b5ea7', '#b6a2d3', '#efe8f5', '#7b5ea7'],
  other: ['#8a97ad', '#c3cad7', '#eef0f4', '#8a97ad'],
} as const

/** App shell (sidebar + header), measured from the reference screen (CSS px = image px * 0.691). */
export const shellPalette = {
  /** Selected sidebar item */
  activeBg: `linear-gradient(135deg,${colors.red[300]},${colors.brand.wineDeep})`,
  activeShadow: '0 6px 14px rgba(122,31,32,.28)',
  activeText: colors.base.white,
  itemText: colors.text.strong,
  subText: colors.text.secondary,
  hoverBg: colors.surface.tint,
  hoverBgStrong: colors.cream[963],
  rule: colors.border.default,
  logout: colors.brand.primary,
  pillIdleBg: colors.cream[914],
  pillIdleText: colors.text.mutedWarm,
  pillActiveBg: colors.brand.primary,
  pillActiveText: colors.base.white,
} as const
