import { Box } from '@mui/material'
import type { SxProps, Theme } from '@mui/material'
import { rem } from '../../utils/format'
import { colors, gradients } from '../../theme'

interface BoneProps {
  /** px (converted to rem) or any CSS length */
  w?: number | string
  h?: number | string
  /** border radius in px, or 'round' for a circle */
  r?: number | 'round'
  /** Absolute placement inside a SkeletonCard, in px measured from the card's outer edge */
  x?: number
  y?: number
  right?: number
  sx?: SxProps<Theme>
}

const len = (v: number | string | undefined, fallback: string) => (v === undefined ? fallback : typeof v === 'number' ? rem(v) : v)

/** A single shimmering placeholder block. */
export function Bone({ w, h = 12, r = 6, x, y, right, sx }: BoneProps) {
  const placed = x !== undefined || right !== undefined || y !== undefined
  return (
    <Box
      aria-hidden
      sx={[
        {
          ...(placed ? { position: 'absolute', top: y === undefined ? undefined : rem(y - 1), left: x === undefined ? undefined : rem(x - 1), right: right === undefined ? undefined : rem(right - 1) } : {}),
          width: w === undefined && x !== undefined && right !== undefined ? 'auto' : len(w, '100%'), height: len(h, '0.75rem'), flexShrink: 0, borderRadius: r === 'round' ? '50%' : rem(r),
          backgroundColor: colors.cream[914],
          backgroundImage: gradients.shimmer,
          backgroundSize: '200% 100%', backgroundRepeat: 'no-repeat',
          animation: 'bone-shimmer 1.4s ease-in-out infinite',
          '@keyframes bone-shimmer': { from: { backgroundPosition: '200% 0' }, to: { backgroundPosition: '-200% 0' } },
          '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    />
  )
}

/** White rounded container that marks its content as loading for assistive tech. */
export function SkeletonCard({ children, minHeight, height, radius = 20, sx }: { children: React.ReactNode; minHeight?: number; height?: number; radius?: number; sx?: SxProps<Theme> }) {
  return (
    <Box
      role="status"
      aria-busy="true"
      aria-label="Loading"
      sx={[
        { width: '100%', boxSizing: 'border-box', bgcolor: colors.base.white, border: `${rem(1)} solid ${colors.border.default}`, borderRadius: rem(radius), overflow: 'hidden', position: 'relative', minHeight: minHeight ? rem(minHeight) : undefined, height: height ? rem(height) : undefined },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Box>
  )
}
