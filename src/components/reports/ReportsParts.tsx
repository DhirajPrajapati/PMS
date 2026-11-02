import { Box, ButtonBase } from '@mui/material'
import { Check } from 'lucide-react'
import type { ReactNode } from 'react'
import { rem as baseRem } from '../../utils/format'
import { colors } from '../../theme'

/** The reference screenshots are 2x captures of a page shown at ~87.5% zoom, so every measured value is scaled by 2/1.75. */
export const rem = (px: number) => baseRem(px * (2 / 1.75))

export const R = {
  maroon: colors.brand.accent,
  gold: colors.gold.base,
  ink: colors.text.ink,
  body: colors.text.secondary,
  muted: colors.text.mutedWarm,
  line: colors.border.default,
  field: colors.border.input,
  chipBg: colors.surface.tableHead,
}

export const font = { fontFamily: 'inherit', m: 0 } as const

/** Gold uppercase caption, e.g. "1. SELECT HOLDER" */
export const goldLabel = { ...font, fontSize: rem(9.7), fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: R.gold, lineHeight: rem(16) } as const

interface ChipProps {
  label: string
  selected: boolean
  onClick: () => void
  /** "outline": selected = maroon outline + check (holders). "fill": selected = solid maroon (categories, criteria). */
  variant: 'outline' | 'fill'
  height: number
  fontSize: number
  px: number
}

export function Chip({ label, selected, onClick, variant, height, fontSize, px }: ChipProps) {
  const fill = variant === 'fill' && selected
  const outline = variant === 'outline' && selected
  return (
    <ButtonBase
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      sx={{
        height: rem(height), px: rem(px), gap: rem(6), borderRadius: rem(height / 2), boxSizing: 'border-box', flexShrink: 0, whiteSpace: 'nowrap',
        fontFamily: 'inherit', fontSize: rem(fontSize), lineHeight: 1, transition: 'background-color .15s, border-color .15s, color .15s',
        fontWeight: fill || outline ? 600 : 500,
        color: fill ? colors.base.white : outline ? R.maroon : colors.text.secondary,
        bgcolor: fill ? R.maroon : outline ? colors.base.white : R.chipBg,
        border: `${rem(1)} solid ${fill || outline ? R.maroon : colors.sand[859]}`,
        '&:hover': { borderColor: fill || outline ? R.maroon : colors.sand[620] },
      }}
    >
      {outline && <Check size="0.75rem" strokeWidth={2.4} />}
      {label}
    </ButtonBase>
  )
}

/** White card with the numbered title ("1  Select Holder type and DI code"). Body is indented under the title. */
export function SectionCard({ index, title, children }: { index: number; title: string; children: ReactNode }) {
  return (
    <Box component="section" aria-label={title} sx={{ bgcolor: colors.base.white, border: `${rem(1)} solid ${R.line}`, borderRadius: rem(26), px: { xs: '1.03125rem', md: rem(21) }, pt: { xs: '1rem', md: rem(20) }, pb: { xs: '1.1875rem', md: rem(20) }, scrollMarginTop: rem(96) }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: rem(10), height: rem(21) }}>
        <Box sx={{ width: rem(21), height: rem(21), borderRadius: '50%', flexShrink: 0, display: 'grid', placeItems: 'center', bgcolor: colors.cream[953], color: R.maroon, fontSize: rem(9.7), fontWeight: 600 }}>
          {index}
        </Box>
        <Box component="h2" sx={{ ...font, fontSize: rem(13.6), fontWeight: 600, lineHeight: rem(21), color: R.ink }}>{title}</Box>
      </Box>
      <Box sx={{ mt: { xs: '1.375rem', md: rem(18) }, pl: { xs: 0, md: rem(31) } }}>{children}</Box>
    </Box>
  )
}
