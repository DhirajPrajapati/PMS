import { Box } from '@mui/material'
import type { ReactNode } from 'react'
import { perfPalette as P } from '../../theme/pms'
import { rem } from '../../utils/format'
import { r } from '../../utils/responsive'

export type PillTone = keyof typeof P.tone
/** tag: fully rounded label (transaction type); badge: small square-cornered chip (asset class, % change) */
type Variant = 'tag' | 'badge'

const LOOK = {
  tag: { height: r(21, 22), px: rem(10), borderRadius: rem(11), fontSize: r(12.8, 11), fontWeight: 700 },
  badge: { height: r(18, 18), px: rem(8), borderRadius: rem(6), fontSize: r(12, 10.5), fontWeight: 600 },
} as const

/** Coloured label from the theme tone table. `sx` overrides the variant's look. */
export default function Pill({ tone, variant = 'tag', children, sx }: { tone: PillTone; variant?: Variant; children: ReactNode; sx?: object }) {
  const [fg, , bg] = P.tone[tone]
  return <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap', bgcolor: bg, color: fg, ...LOOK[variant], ...sx }}>{children}</Box>
}
