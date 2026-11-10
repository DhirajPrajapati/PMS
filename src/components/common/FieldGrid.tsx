import { Box } from '@mui/material'
import { colors } from '../../theme'
import { perfPalette as P } from '../../theme/pms'
import { rem } from '../../utils/format'
import { reset } from '../../utils/responsive'

/** Two-column grid of small uppercase labels over values. */
export default function FieldGrid({ items, columns = 2 }: { items: { label: string; value: string }[]; columns?: number }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, rowGap: rem(12), columnGap: rem(10) }}>
      {items.map((d) => (
        <Box key={d.label} sx={{ minWidth: 0 }}>
          <Box sx={{ ...reset, fontSize: rem(9.4), fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: P.slate }}>{d.label}</Box>
          <Box sx={{ ...reset, mt: rem(3), fontSize: rem(11.4), lineHeight: rem(15), color: colors.text.ink, wordBreak: 'break-word' }}>{d.value}</Box>
        </Box>
      ))}
    </Box>
  )
}
