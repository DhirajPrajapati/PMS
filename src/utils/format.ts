/** px -> rem (16px root). Keeps measured design values readable while emitting rem. */
export const rem = (px: number) => `${px / 16}rem`

const LAKH = 100000
const CRORE = 10000000

const trim = (n: number) => String(Number(n.toFixed(2)))

/** 12400000 -> "₹1.24 Cr", 8260000 -> "₹82.6 L" */
export function formatAum(rupees: number): string {
  if (rupees >= CRORE) return `₹${trim(rupees / CRORE)} Cr`
  if (rupees >= LAKH) return `₹${trim(rupees / LAKH)} L`
  return `₹${rupees.toLocaleString('en-IN')}`
}

/** 500000 -> "₹5L", 10000000 -> "₹1Cr" */
export function formatShort(rupees: number): string {
  if (rupees >= CRORE) return `₹${trim(rupees / CRORE)}Cr`
  if (rupees >= LAKH) return `₹${trim(rupees / LAKH)}L`
  return `₹${rupees.toLocaleString('en-IN')}`
}

export const formatInr = (rupees: number) => rupees.toLocaleString('en-IN')

/** 15.2 -> "+15.2%", -3.4 -> "-3.4%" */
export const formatPct = (x: number) => `${x >= 0 ? '+' : '-'}${Math.abs(x).toFixed(1)}%`

/** 450000000 -> "₹45 Cr", 12400000000 -> "₹1,240 Cr" (Indian grouping on the crore figure) */
export function formatCrore(rupees: number): string {
  if (rupees >= CRORE) {
    return `₹${(rupees / CRORE).toLocaleString('en-IN', { maximumFractionDigits: 2 })} Cr`
  }
  return formatAum(rupees)
}

/** 10.38 -> "+10.38%", -2.5 -> "-2.50%" */
export const formatReturn = (x: number) => `${x > 0 ? '+' : ''}${x.toFixed(2)}%`

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** "2021-10-30" -> "30 Oct 2021" */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return `${d} ${MONTHS[m - 1]} ${y}`
}
