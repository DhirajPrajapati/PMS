import { rem } from './format'

export const MOBILE_Q = '(max-width:40rem)'
/** Reset for text blocks that inherit the page font */
export const reset = { fontFamily: 'inherit', m: 0 } as const
/** [desktop, mobile] -> responsive rem value */
export const r = (d: number, m: number = d) => ({ xs: rem(m), sm: rem(d) })
