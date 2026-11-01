import { Box } from '@mui/material'
import { Check } from 'lucide-react'
import { rem } from '../../utils/format'
import { colors } from '../../theme'

/** Round tick indicator: maroon when on, grey when off. Sizes in px. */
export default function CheckDot({ on, size, icon }: { on: boolean; size: number; icon: number }) {
  return (
    <Box
      sx={{
        width: rem(size), height: rem(size), borderRadius: '50%', flexShrink: 0, display: 'grid', placeItems: 'center',
        bgcolor: on ? colors.brand.primaryDark : colors.cream[910], color: colors.base.white, transition: 'background-color .2s',
      }}
    >
      <Check size={rem(icon)} strokeWidth={3} />
    </Box>
  )
}
