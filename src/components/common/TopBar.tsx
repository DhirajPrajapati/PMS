import { Box, ButtonBase } from '@mui/material'
import { Menu } from 'lucide-react'
import { colors } from '../../theme'
import { rem } from '../../utils/format'
import { reset } from '../../utils/responsive'
import Avatar from './Avatar'

/** Phone-only app bar: menu button, brand mark, user avatar. */
export default function TopBar({ name, onMenu }: { name: string; onMenu?: () => void }) {
  return (
    <Box sx={{ display: { xs: 'flex', sm: 'none' }, alignItems: 'center', justifyContent: 'space-between', height: rem(67), px: rem(18), bgcolor: colors.base.white, borderBottom: `${rem(1)} solid ${colors.border.default}` }}>
      <ButtonBase aria-label="Menu" onClick={onMenu} sx={{ width: rem(37), height: rem(37), borderRadius: rem(10), border: `${rem(1)} solid ${colors.border.default}`, color: colors.text.ink }}>
        <Menu size={rem(20)} />
      </ButtonBase>
      <Box sx={{ textAlign: 'center', lineHeight: 1, ...reset }} aria-label="ICICI Prudential Alternate Investments">
        <Box sx={{ fontSize: rem(15), fontWeight: 800, fontStyle: 'italic', color: colors.brown[543], letterSpacing: '-0.02em' }}>ICICI</Box>
        <Box sx={{ fontSize: rem(14), fontWeight: 800, color: colors.red[365], letterSpacing: '-0.04em' }}>PRUDENTIAL</Box>
        <Box sx={{ fontSize: rem(5.5), fontWeight: 700, color: colors.brown[569], letterSpacing: '0.05em' }}>ALTERNATE INVESTMENTS</Box>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', height: rem(40), pl: rem(14), borderLeft: `${rem(1)} solid ${colors.border.input}` }}>
        <Avatar name={name} size={rem(36)} fontSize={rem(15)} />
      </Box>
    </Box>
  )
}
