import { Box } from '@mui/material'
import { colors } from '../../theme'
import { fadeUp } from '../../theme/motion'
import { r, reset } from '../../utils/responsive'
import { rem } from '../../utils/format'

/** Centred message for a list with no results. */
export default function EmptyState({ children }: { children: string }) {
  return <Box sx={{ ...reset, py: rem(26), px: rem(17), textAlign: 'center', fontSize: r(12.8, 12), color: colors.text.mutedWarm, ...fadeUp(0) }}>{children}</Box>
}
