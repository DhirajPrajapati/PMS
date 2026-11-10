import { Box, ButtonBase } from '@mui/material'
import type { ReactNode } from 'react'
import { colors } from '../../theme'
import { fadeUp } from '../../theme/motion'
import { perfPalette as P } from '../../theme/pms'
import { rem } from '../../utils/format'
import { reset } from '../../utils/responsive'
import Collapse from './Collapse'
import RotatingChevron from './RotatingChevron'

interface Props {
  /** Left of the first line, e.g. a <Pill> */
  badge: ReactNode
  /** Small grey text beside the badge, e.g. a date */
  meta: string
  title: ReactNode
  value: ReactNode
  valueWeight?: 500 | 600
  open: boolean
  onToggle: () => void
  /** Position in the list, for the entry stagger */
  index?: number
  /** Expanded content; shown inside a tinted card */
  children: ReactNode
}

/** Phone list row: badge + meta + chevron, a title and a value; tap to open a tinted detail card. */
export default function ExpandableItem({ badge, meta, title, value, valueWeight = 600, open, onToggle, index = 0, children }: Props) {
  const line = { ...reset, fontSize: rem(12.6), lineHeight: rem(19), color: colors.text.ink } as const
  return (
    <Box role="listitem" sx={{ borderBottom: `${rem(1)} solid ${colors.border.default}`, ...fadeUp(index) }}>
      <ButtonBase aria-expanded={open} onClick={onToggle} sx={{ display: 'block', width: '100%', textAlign: 'left', px: rem(17), pt: rem(9), pb: rem(12), fontFamily: 'inherit' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: rem(22) }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: rem(9) }}>
            {badge}
            <Box component="span" sx={{ ...reset, fontSize: rem(11), color: P.slate }}>{meta}</Box>
          </Box>
          <Box sx={{ color: P.slate, display: 'flex' }}><RotatingChevron open={open} /></Box>
        </Box>
        <Box sx={{ ...line, mt: rem(2), fontWeight: 600 }}>{title}</Box>
        <Box sx={{ ...line, fontWeight: valueWeight }}>{value}</Box>
      </ButtonBase>
      <Collapse open={open}>
        <Box sx={{ mx: rem(12), mb: rem(13), p: rem(12), borderRadius: rem(12), bgcolor: P.tableHead, border: `${rem(1)} solid ${colors.border.default}` }}>{children}</Box>
      </Collapse>
    </Box>
  )
}
