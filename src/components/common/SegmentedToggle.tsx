import { Box, ButtonBase } from '@mui/material'
import { rem } from '../../utils/format'
import { colors } from '../../theme'
import { perfPalette as P } from '../../theme/pms'

interface Props<T extends string> {
  options: readonly T[]
  value: T
  onChange: (v: T) => void
  ariaLabel: string
}

/** Pill-shaped two/three way switch (e.g. XIRR | TWRR). */
export default function SegmentedToggle<T extends string>({ options, value, onChange, ariaLabel }: Props<T>) {
  return (
    <Box role="group" aria-label={ariaLabel} sx={{ display: 'inline-flex', gap: rem(2), p: rem(3), borderRadius: rem(12), bgcolor: P.toggleTrack, flexShrink: 0 }}>
      {options.map((o) => {
        const on = o === value
        return (
          <ButtonBase key={o} aria-pressed={on} onClick={() => onChange(o)} sx={{ minWidth: { xs: rem(51), sm: rem(57) }, height: { xs: rem(32), sm: rem(35) }, px: rem(14), borderRadius: rem(10), fontFamily: 'inherit', fontSize: { xs: rem(11), sm: rem(12.2) }, fontWeight: 700, color: on ? colors.base.white : colors.text.secondary, bgcolor: on ? colors.brand.accent : 'transparent', boxShadow: on ? '0 2px 6px rgba(138,34,35,.25)' : 'none', transition: 'background-color .2s, color .2s, box-shadow .2s' }}>
            {o}
          </ButtonBase>
        )
      })}
    </Box>
  )
}
