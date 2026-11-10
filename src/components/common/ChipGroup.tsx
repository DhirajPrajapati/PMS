import { Box, ButtonBase } from '@mui/material'
import { colors } from '../../theme'
import { perfPalette as P } from '../../theme/pms'
import { rem } from '../../utils/format'
import { r } from '../../utils/responsive'

/** Pill-shaped filter chips (single choice). Scrolls sideways on phones. */
export default function ChipGroup<T extends string>({ items, value, onChange, ariaLabel }: { items: readonly T[]; value: T; onChange: (v: T) => void; ariaLabel: string }) {
  return (
    <Box role="group" aria-label={ariaLabel} sx={{ display: 'flex', gap: rem(8), overflowX: { xs: 'auto', sm: 'visible' }, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' }, flexShrink: 0, maxWidth: '100%' }}>
      {items.map((f) => {
        const on = f === value
        return (
          <ButtonBase key={f} aria-pressed={on} onClick={() => onChange(f)} sx={{ flexShrink: 0, height: r(30, 32), px: rem(15), borderRadius: rem(16), fontFamily: 'inherit', fontSize: r(12.8, 11.6), fontWeight: 600, color: on ? colors.brand.accent : colors.text.strong, bgcolor: on ? P.tone.maroon[2] : P.chip, transition: 'background-color .25s, color .25s' }}>{f}</ButtonBase>
        )
      })}
    </Box>
  )
}
