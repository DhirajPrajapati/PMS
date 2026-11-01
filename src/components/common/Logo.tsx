import { Box } from '@mui/material'
import { colors } from '../../theme'

export default function Logo({ size = '0.875rem' }: { size?: string }) {
  return (
    <Box component="svg" viewBox="0 0 24 24" sx={{ width: size, height: size, flexShrink: 0 }} aria-hidden>
      <defs>
        <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={colors.brown[543]} />
          <stop offset="1" stopColor={colors.red[365]} />
        </linearGradient>
      </defs>
      <ellipse cx="12" cy="12" rx="9" ry="10.5" fill="url(#logo-g)" transform="rotate(20 12 12)" />
      <circle cx="13.5" cy="6.5" r="1.7" fill={colors.base.white} />
      <path d="M11 10.5h2.4L12 18h-2.4z" fill={colors.base.white} />
    </Box>
  )
}
