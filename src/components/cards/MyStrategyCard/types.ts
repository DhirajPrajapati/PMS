export interface MyStrategy {
  id: string
  provider: string
  /** Corner tag, e.g. "PMS" */
  tag: string
  name: string
  /** Rupees */
  invested: number
  /** Rupees */
  aum: number
  /** Signed percentage */
  xirr: number
  /** Performance range buttons, in display order */
  ranges: string[]
  defaultRange: string
  /** Returns per range label (benchmark vs portfolio), straight from the API */
  performance: Record<string, Performance>
  /** Present for AIF rows: switches the card to the AIF layout */
  aif?: AifDetails
}

export interface AifDetails {
  folio: string
  /** e.g. "CAT II" */
  category: string
  /** Rupees, signed */
  absReturn: number
  /** Percent, signed */
  absReturnPct: number
  trend: number[]
  /** ISO date */
  navDate: string
  nav: number
}

export interface Performance {
  benchmark: number
  portfolio: number
}
