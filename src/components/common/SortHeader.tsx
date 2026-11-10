import { Box, ButtonBase } from '@mui/material'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { colors } from '../../theme'
import type { SortState } from '../../hooks/useSort'
import { rem } from '../../utils/format'

export interface SortColumn<K extends string> {
  /** null = not sortable (plain label) */
  key: K | null
  label: string
  align?: 'left' | 'right'
  /** Extra right padding in px (aligns the last column with its cells) */
  pr?: number
}

interface Props<K extends string> {
  columns: SortColumn<K>[]
  /** CSS grid-template-columns shared with the body rows */
  grid: string
  sort: SortState<K>
  onSort: (key: K) => void
  /** px */
  height?: number
}

/** Table header row with sortable columns: accent colour + arrow on the active one, aria-sort for screen readers. */
export default function SortHeader<K extends string>({ columns, grid, sort, onSort, height = 41.5 }: Props<K>) {
  return (
    <Box role="row" sx={{ display: 'grid', gridTemplateColumns: grid, height: rem(height), alignItems: 'center', borderBottom: `${rem(1)} solid ${colors.border.default}` }}>
      {columns.map((c, i) => {
        const on = c.key !== null && sort.key === c.key
        const Icon = on ? (sort.dir === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown
        const look = { gap: rem(4), fontFamily: 'inherit', fontSize: rem(11.7), fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: on ? colors.brand.accent : colors.text.mutedWarm } as const
        return (
          <Box role="columnheader" key={c.label} aria-sort={c.key === null ? undefined : on ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'} sx={{ pl: i === 0 ? rem(14.5) : 0, pr: c.pr ? rem(c.pr) : 0, textAlign: c.align ?? 'left' }}>
            {c.key === null ? (
              <Box component="span" sx={{ ...look, display: 'inline-flex' }}>{c.label}</Box>
            ) : (
              <ButtonBase onClick={() => onSort(c.key as K)} sx={look}>{c.label}<Icon size={rem(11)} /></ButtonBase>
            )}
          </Box>
        )
      })}
    </Box>
  )
}
