import { Box, ButtonBase } from '@mui/material'
import { ListFilter } from 'lucide-react'
import { formatCrore, rem } from '../utils/format'
import { tagStyle } from '../utils/tags'
import Logo from './common/Logo'
import type { MyStrategy } from './cards/MyStrategyCard'
import { colors, gradients } from '../theme'

// Column widths in px (converted to rem). Numeric columns are wide enough for
// their headings to stay on one line.
const WIDTHS = [262, 84, 84, 78, 116, 112, 211]
const COLS = WIDTHS.map(rem).join(' ')
const TABLE_MIN = rem(WIDTHS.reduce((a, b) => a + b, 0))

const HEADS = ['Strategy/Scheme Name', 'Invested (₹)', 'AUM (₹)', 'XIRR (%)', 'Benchmark (%)', 'Portfolio (%)', 'Actions']

const C = { line: colors.cream[894], head: colors.text.mutedWarm, num: colors.gray[398], text: colors.text.strong, maroon: colors.brand.primary }

const signed = (n: number) => `${n > 0 ? '+' : ''}${n.toFixed(2)}`

const numCell = { textAlign: 'right', pr: rem(16), fontSize: rem(13), color: C.num, whiteSpace: 'nowrap' } as const

interface Props {
  strategies: MyStrategy[]
  onPerformance?: (s: MyStrategy) => void
  onInvestMore?: (s: MyStrategy) => void
}

export default function StrategyTable({ strategies, onPerformance, onInvestMore }: Props) {
  return (
    <Box sx={{ px: rem(14) }}>
      <Box
        sx={{
          border: `${rem(1)} solid ${colors.border.default}`, borderRadius: rem(20), bgcolor: colors.base.white, overflowX: 'auto',
          scrollbarWidth: 'thin', scrollbarColor: `${colors.rose[725]} transparent`,
          '&::-webkit-scrollbar': { height: rem(5) },
          '&::-webkit-scrollbar-thumb': { bgcolor: colors.rose[725], borderRadius: rem(3) },
          '&::-webkit-scrollbar-track': { bgcolor: 'transparent', mx: rem(20) },
        }}
      >
        <Box role="table" sx={{ minWidth: TABLE_MIN }}>
          {/* Header */}
          <Box
            role="row"
            sx={{ display: 'grid', gridTemplateColumns: COLS, alignItems: 'center', height: rem(52), borderBottom: `${rem(1)} solid ${C.line}` }}
          >
            {HEADS.map((h, i) => (
              <Box
                key={h}
                role="columnheader"
                sx={{
                  fontSize: rem(13), fontWeight: 600, color: C.head, whiteSpace: 'nowrap',
                  display: 'flex', alignItems: 'center',
                  pl: i === 0 ? rem(24.5) : 0,
                  ...(i >= 1 && i <= 5 ? { justifyContent: 'flex-end', pr: rem(16) } : {}),
                  ...(i === 6 ? { pl: rem(9), pr: rem(14), justifyContent: 'space-between' } : {}),
                }}
              >
                {h}
                {i === 6 && <ListFilter size="1.125rem" strokeWidth={2} color={C.head} />}
              </Box>
            ))}
          </Box>

          {/* Rows */}
          {strategies.map((s, idx) => {
            const perf = s.performance[s.defaultRange]
            const t = tagStyle(s.tag)
            return (
              <Box
                key={s.id}
                role="row"
                sx={{
                  display: 'grid', gridTemplateColumns: COLS, alignItems: 'center', height: rem(70.5),
                  borderBottom: idx < strategies.length - 1 ? `${rem(1)} solid ${C.line}` : 0,
                  transition: 'background-color .15s', '&:hover': { bgcolor: colors.cream[973] },
                }}
              >
                <Box role="cell" sx={{ pl: rem(24.5), minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: rem(6), height: rem(22) }}>
                    <Box sx={{ width: rem(20), height: rem(20), borderRadius: '50%', bgcolor: colors.cream[940], display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                      <Logo size={rem(14)} />
                    </Box>
                    <Box component="span" sx={{ fontSize: rem(12), color: C.head, whiteSpace: 'nowrap' }}>{s.provider}</Box>
                    <Box
                      component="span"
                      sx={{ px: rem(10), height: rem(19), lineHeight: rem(19), borderRadius: rem(10), bgcolor: t.bg, color: t.fg, fontSize: rem(12), fontWeight: 700 }}
                    >
                      {s.tag}
                    </Box>
                  </Box>
                  <Box sx={{ mt: rem(2), fontSize: rem(13.5), fontWeight: 600, color: C.text, whiteSpace: 'nowrap' }}>{s.name}</Box>
                </Box>
                <Box role="cell" sx={numCell}>{formatCrore(s.invested).replace('₹', '')}</Box>
                <Box role="cell" sx={numCell}>{formatCrore(s.aum).replace('₹', '')}</Box>
                <Box role="cell" sx={{ ...numCell, color: s.xirr < 0 ? colors.status.negativeText : C.num }}>{s.xirr.toFixed(1)}</Box>
                <Box role="cell" sx={numCell}>{perf ? signed(perf.benchmark) : '-'}</Box>
                <Box role="cell" sx={numCell}>{perf ? signed(perf.portfolio) : '-'}</Box>
                <Box role="cell" sx={{ pl: rem(9), display: 'flex', gap: rem(6.5) }}>
                  <ButtonBase
                    onClick={() => onPerformance?.(s)}
                    sx={{
                      width: rem(95), height: rem(30), borderRadius: rem(8), boxSizing: 'border-box', border: `${rem(1)} solid ${C.maroon}`,
                      color: C.maroon, fontFamily: 'inherit', fontSize: rem(13), fontWeight: 600,
                    }}
                  >
                    Performance
                  </ButtonBase>
                  <ButtonBase
                    onClick={() => onInvestMore?.(s)}
                    sx={{
                      width: rem(86), height: rem(30), borderRadius: rem(8), color: colors.base.white, fontFamily: 'inherit',
                      fontSize: rem(13), fontWeight: 600, background: gradients.primaryButton,
                    }}
                  >
                    Invest More
                  </ButtonBase>
                </Box>
              </Box>
            )
          })}
        </Box>
      </Box>
    </Box>
  )
}
