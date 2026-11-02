import { Box, ButtonBase, Menu, MenuItem } from '@mui/material'
import { Check, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { colors } from '../../theme'
import { R, rem } from './ReportsParts'

export const fieldSx = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', height: rem(36), px: rem(14), boxSizing: 'border-box', borderRadius: '999px',
  border: `${rem(1)} solid ${colors.sand[859]}`, bgcolor: colors.base.white, fontFamily: 'inherit', fontSize: rem(10.9), textAlign: 'left',
  '&:hover': { borderColor: colors.sand[620] },
} as const


export interface SelectOption {
  value: string
  label: string
}
export interface SelectGroup {
  heading?: string
  options: SelectOption[]
}

/** Pill dropdown: "Prefix: Value" button + grouped menu with a check on the selected row. */
export function SelectField({ prefix, placeholder, groups, value, onChange, valueColor, width }: {
  prefix?: string
  placeholder: string
  groups: SelectGroup[]
  value: string | null
  onChange: (v: string) => void
  valueColor: string
  width?: unknown
}) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const open = !!anchor
  const selected = groups.flatMap((g) => g.options).find((o) => o.value === value)
  return (
    <Box sx={{ width: width ?? '100%' }}>
      <ButtonBase
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{ ...fieldSx, borderColor: open ? R.maroon : colors.sand[859], '&:hover': { borderColor: open ? R.maroon : colors.sand[620] } }}
      >
        <Box component="span" sx={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: colors.text.mutedWarm, fontWeight: 400 }}>
          {selected ? (
            <>
              {prefix && <>{prefix} </>}
              <Box component="span" sx={{ fontWeight: prefix ? 700 : 600, color: valueColor }}>{selected.label}</Box>
            </>
          ) : (
            <>{prefix && <>{prefix} </>}{placeholder}</>
          )}
        </Box>
        {open ? <ChevronUp size="0.875rem" color={colors.text.body} /> : <ChevronDown size="0.875rem" color={colors.text.body} />}
      </ButtonBase>
      <Menu
        anchorEl={anchor}
        open={open}
        onClose={() => setAnchor(null)}
        slotProps={{ paper: { sx: { mt: rem(6), borderRadius: rem(20), minWidth: anchor?.clientWidth, maxHeight: '60vh', boxShadow: '0 0.5rem 2rem rgba(42,24,16,.14)' } }, list: { sx: { py: rem(6) } } }}
      >
        {groups.flatMap((g, gi) => [
          g.heading && (
            <Box key={`h${gi}`} role="presentation" sx={{ px: rem(16), pt: rem(gi === 0 ? 8 : 14), pb: rem(6), fontSize: rem(9.4), fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: colors.text.mutedWarm }}>
              {g.heading}
            </Box>
          ),
          ...g.options.map((o) => (
            <MenuItem
              key={o.value}
              selected={o.value === value}
              onClick={() => {
                onChange(o.value)
                setAnchor(null)
              }}
              sx={{
                minHeight: rem(36), px: rem(16), mx: rem(6), borderRadius: rem(12), justifyContent: 'space-between', fontSize: rem(10.9), fontWeight: 500, color: R.ink,
                '&.Mui-selected, &.Mui-selected:hover, &.Mui-selected.Mui-focusVisible': { bgcolor: colors.cream[953], color: R.maroon }, '&:hover': { bgcolor: colors.cream[953] },
              }}
            >
              {o.label}
              {o.value === value && <Check size="0.875rem" strokeWidth={2} />}
            </MenuItem>
          )),
        ])}
      </Menu>
    </Box>
  )
}

