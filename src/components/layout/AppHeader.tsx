import { Box } from '@mui/material'
import { colors } from '../../theme'
import { shellPalette as S } from '../../theme/pms'
import { rem } from '../../utils/format'
import { reset } from '../../utils/responsive'
import Avatar from '../common/Avatar'
import { HEADER_H } from './Sidebar'

export type HeaderPill = { label: string; active?: boolean; href?: string }

/** Desktop top bar: account pills on the right, then the signed-in user. */
export default function AppHeader({ pills, userName }: { pills: HeaderPill[]; userName: string }) {
  return (
    <Box component="header" sx={{ height: rem(HEADER_H), flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', pr: rem(32.3), bgcolor: colors.base.white, ...reset }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: rem(6.5) }}>
        {pills.map((p) => (
          <Box
            key={p.label}
            component={p.href ? 'a' : 'span'}
            href={p.href}
            sx={{ height: rem(28), px: rem(12.2), display: 'inline-flex', alignItems: 'center', borderRadius: rem(14), textDecoration: 'none', fontSize: rem(12.3), fontWeight: 700, whiteSpace: 'nowrap', bgcolor: p.active ? S.pillActiveBg : S.pillIdleBg, color: p.active ? S.pillActiveText : S.pillIdleText }}
          >
            {p.label}
          </Box>
        ))}
      </Box>
      <Box sx={{ ml: rem(10.6), pl: rem(14), height: rem(40), display: 'flex', alignItems: 'center', gap: rem(10.6), borderLeft: `${rem(1)} solid ${S.rule}` }}>
        <Box component="span" sx={{ fontSize: rem(13.3), fontWeight: 700, color: colors.text.ink, whiteSpace: 'nowrap' }}>{userName}</Box>
        <Avatar name={userName} size={rem(37.6)} fontSize={rem(14.7)} />
      </Box>
    </Box>
  )
}
