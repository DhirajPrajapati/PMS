import { Box } from '@mui/material'
import type { ReactNode } from 'react'
import { rem } from '../../../utils/format'
import Logo from '../../common/Logo'
import { tagStyle } from '../../../utils/tags'
import { colors } from '../../../theme'
import { C, PX, font } from './shared'
import type { MyStrategy } from './types'

/** Shared frame for My Strategies cards: border, corner tag and logo/name header. `children` is the product-specific body. */
export default function StrategyCardShell({ strategy, wrapName = false, children }: { strategy: MyStrategy; wrapName?: boolean; children: ReactNode }) {
  const tag = tagStyle(strategy.tag)
  return (
    <Box
      sx={{
        position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', bgcolor: colors.base.white,
        borderRadius: rem(20), border: `${rem(1.5)} solid ${C.line}`, pb: rem(12),
      }}
    >
      {/* Corner tag: S-curved left edge (concave at the top, convex at the bottom) */}
      <Box
        sx={{
          position: 'absolute', top: rem(-1.5), right: rem(-1.5), width: rem(77.5), height: rem(30.5),
          borderTopRightRadius: rem(20), overflow: 'hidden',
        }}
      >
        <Box
          component="svg"
          viewBox="0 0 76 29"
          preserveAspectRatio="none"
          aria-hidden
          sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
        >
          <defs>
            <linearGradient id={`tag-g-${strategy.tag}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={tag.from} />
              <stop offset="1" stopColor={tag.to} />
            </linearGradient>
          </defs>
          <path d="M0 0A14.5 14.5 0 0 1 14.5 14.5A14.5 14.5 0 0 0 29 29H76V0Z" fill={`url(#tag-g-${strategy.tag})`} />
        </Box>
        <Box
          sx={{
            position: 'relative', height: '100%', pl: rem(14.5), pt: rem(1.5), pr: rem(1.5), boxSizing: 'border-box', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: tag.fg, fontWeight: 700, fontSize: rem(13), letterSpacing: '0.05em',
          }}
        >
          {strategy.tag}
        </Box>
      </Box>

      {/* Header */}
      <Box sx={{ px: rem(PX), pt: rem(13) }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: rem(6), height: rem(20) }}>
          <Box sx={{ width: rem(20), height: rem(20), borderRadius: '50%', bgcolor: colors.cream[940], display: 'grid', placeItems: 'center' }}>
            <Logo size={rem(14)} />
          </Box>
          <Box component="span" sx={{ ...font, fontSize: rem(12), color: colors.text.mutedWarm }}>
            {strategy.provider}
          </Box>
        </Box>
        <Box
          sx={{
            ...font, mt: rem(3.5), fontSize: rem(14.5), fontWeight: 600, lineHeight: rem(18.6), color: colors.text.strong,
            ...(wrapName ? {} : { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }),
          }}
        >
          {strategy.name}
        </Box>
      </Box>

      {children}
    </Box>
  )
}
