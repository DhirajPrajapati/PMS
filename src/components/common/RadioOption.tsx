import { Box, ButtonBase } from '@mui/material'
import { rem } from '../../utils/format'
import { EASE } from './Collapse'
import { colors } from '../../theme'

export default function RadioOption({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) {
  return (
    <ButtonBase
      onClick={onClick}
      role="radio"
      aria-checked={on}
      sx={{ gap: rem(5), fontFamily: 'inherit', fontSize: rem(12), color: colors.text.secondary, fontWeight: 500 }}
    >
      <Box
        sx={{
          width: rem(14), height: rem(14), borderRadius: '50%', boxSizing: 'border-box', display: 'grid', placeItems: 'center',
          border: `${rem(1.5)} solid ${on ? '${colors.brand.primary}' : '${colors.sand[776]}'}`, transition: 'border-color .15s',
        }}
      >
        <Box sx={{ width: rem(7), height: rem(7), borderRadius: '50%', bgcolor: colors.brand.primary, transform: on ? 'scale(1)' : 'scale(0)', transition: `transform .18s ${EASE}` }} />
      </Box>
      {label}
    </ButtonBase>
  )
}
