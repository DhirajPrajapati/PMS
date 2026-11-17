import { Box } from '@mui/material'
import { colors } from '../../theme'
import { rem } from '../../utils/format'
import { reset } from '../../utils/responsive'

/** ICICI Prudential Alternate Investments wordmark (text version; swap the body for the real artwork when it is supplied). */
export default function BrandLogo({ scale = 1 }: { scale?: number }) {
  return (
    <Box role="img" aria-label="ICICI Prudential Alternate Investments" sx={{ lineHeight: 1, width: rem(99 * scale), flexShrink: 0, ...reset }}>
      <Box sx={{ fontSize: rem(18.2 * scale), fontWeight: 800, fontStyle: 'italic', color: colors.brown[543], letterSpacing: '-0.02em' }}>ICICI</Box>
      <Box sx={{ mt: rem(-1), fontSize: rem(18.2 * scale), fontWeight: 800, color: colors.red[365], letterSpacing: '-0.05em' }}>PRUDENTIAL</Box>
      <Box sx={{ mt: rem(2.4), fontSize: rem(5.4 * scale), fontWeight: 700, color: colors.brown[569], letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>ALTERNATE INVESTMENTS</Box>
    </Box>
  )
}
