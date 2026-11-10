import { rem } from '../../../utils/format'
import { colors } from '../../../theme'

export const C = {
  maroon: colors.brand.primary,
  text: colors.text.ink,
  line: colors.border.soft,
}

/** Card side padding, measured from the design (px). */
export const PX = 10.5

export const font = { fontFamily: 'inherit', m: 0 } as const

export const tileLabel = {
  ...font,
  fontSize: rem(11.5),
  fontWeight: 600,
  lineHeight: rem(16),
  letterSpacing: '0.03em',
  textTransform: 'uppercase',
} as const

export const tileValue = {
  ...font,
  mt: rem(4),
  fontSize: rem(12),
  fontWeight: 800,
  lineHeight: rem(16),
} as const
