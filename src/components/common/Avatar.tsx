import { Box } from '@mui/material'
import { colors } from '../../theme'

const initials = (name: string) => name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()

/** Maroon round avatar with gold initials. `size` is any CSS length (or responsive object). */
export default function Avatar({ name, size, fontSize = '1rem' }: { name: string; size: string | { xs: string; sm: string }; fontSize?: string | { xs: string; sm: string } }) {
  return (
    <Box sx={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, display: 'grid', placeItems: 'center', background: `linear-gradient(135deg,${colors.red[300]},${colors.brand.wineDeep})`, color: colors.gold.base, fontFamily: 'inherit', fontSize, fontWeight: 800 }}>
      {initials(name)}
    </Box>
  )
}
