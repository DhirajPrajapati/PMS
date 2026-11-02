import { Box, ButtonBase } from '@mui/material'
import { useRef } from 'react'
import { colors } from '../../theme'
import { R, goldLabel, rem } from './ReportsParts'
import { fieldSx } from './SelectField'

export const iso2label = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

export function CalendarIcon() {
  return (
    <Box component="svg" viewBox="0 0 20 20" aria-hidden sx={{ width: rem(16), height: rem(16), flexShrink: 0 }}>
      <rect x="2" y="3.5" width="16" height="14.5" rx="2.2" fill={R.gold} />
      <rect x="5" y="1" width="2" height="4" rx="1" fill={R.gold} stroke={colors.base.white} strokeWidth="0.8" />
      <rect x="13" y="1" width="2" height="4" rx="1" fill={R.gold} stroke={colors.base.white} strokeWidth="0.8" />
      <rect x="10.5" y="10.5" width="4.5" height="4.5" rx="0.8" fill={colors.base.white} />
    </Box>
  )
}

export default function DateField({ label, value, onChange, min, max }: { label: string; value: string; onChange: (iso: string) => void; min?: string; max?: string }) {
  const ref = useRef<HTMLInputElement>(null)
  const open = () => {
    try {
      ref.current?.showPicker()
    } catch {
      ref.current?.focus()
    }
  }
  return (
    <Box sx={{ position: 'relative', minWidth: 0 }}>
      <Box component="label" sx={{ ...goldLabel, display: 'block', mb: rem(8) }}>{label}</Box>
      <ButtonBase onClick={open} aria-label={label} sx={{ ...fieldSx, height: rem(35) }}>
        <Box component="span" sx={{ fontSize: value ? rem(10.5) : rem(10.1), color: value ? colors.text.body : colors.sand[686], fontWeight: value ? 500 : 400 }}>{value ? iso2label(value) : 'DD MMMM YYYY'}</Box>
        <CalendarIcon />
      </ButtonBase>
      <input ref={ref} type="date" tabIndex={-1} aria-hidden value={value} min={min} max={max} onChange={(e) => onChange(e.target.value)} style={{ position: 'absolute', left: 0, bottom: 0, width: 1, height: 1, opacity: 0, pointerEvents: 'none' }} />
    </Box>
  )
}

