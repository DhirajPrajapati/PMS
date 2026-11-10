import { Box, ButtonBase } from '@mui/material'
import { useState } from 'react'
import { formatCrore, rem } from '../../../utils/format'
import PerformanceChart from '../../common/PerformanceChart'
import { colors, gradients } from '../../../theme'
import StrategyCardShell from './StrategyCardShell'
import { C, PX, font, tileLabel, tileValue } from './shared'
import type { MyStrategy } from './types'

interface Props {
  strategy: MyStrategy
  onPerformance?: (s: MyStrategy) => void
  onInvestMore?: (s: MyStrategy) => void
}

export default function PmsStrategyCard({ strategy, onPerformance, onInvestMore }: Props) {
  const [range, setRange] = useState(strategy.defaultRange)
  const perf = strategy.performance[range] ?? null
  const positive = strategy.xirr >= 0
  const xirrColor = positive ? colors.green[394] : colors.status.negativeText

  return (
    <StrategyCardShell strategy={strategy}>
      {/* Tiles (scroll sideways when the card is narrow) */}
      <Box
        sx={{
          mt: rem(12.5), display: 'grid', gridTemplateColumns: 'repeat(3, minmax(min-content, 1fr))', gap: rem(9), px: rem(PX), overflowX: 'auto',
          scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {[
          { label: 'Invested', value: formatCrore(strategy.invested), bg: colors.rose[981], border: colors.rose[922], color: colors.brand.accent, valueColor: C.text },
          { label: 'AUM', value: formatCrore(strategy.aum), bg: colors.blue[980], border: colors.blue[920], color: colors.blue[241], valueColor: C.text },
          {
            label: 'XIRR', value: `${positive ? '' : '-'}${Math.abs(strategy.xirr)}%`,
            bg: positive ? colors.green[978] : colors.rose[980], border: positive ? colors.green[912] : colors.rose[918], color: xirrColor, valueColor: xirrColor,
          },
        ].map((t) => (
          <Box
            key={t.label}
            sx={{
              boxSizing: 'border-box', px: rem(11.5), pt: rem(11.5), pb: rem(11.8),
              borderRadius: rem(14), bgcolor: t.bg, border: `${rem(1)} solid ${t.border}`,
            }}
          >
            <Box sx={{ ...tileLabel, color: t.color }}>{t.label}</Box>
            <Box sx={{ ...tileValue, color: t.valueColor }}>{t.value}</Box>
          </Box>
        ))}
      </Box>

      {/* Performance */}
      <Box sx={{ mx: rem(PX), mt: rem(12.4), minHeight: rem(192), flex: 1, display: 'flex', flexDirection: 'column', boxSizing: 'border-box', border: `${rem(1)} solid ${C.line}`, borderRadius: rem(12), px: rem(8.5), position: 'relative' }}>
        <Box sx={{ ...font, pt: rem(10.5), height: rem(29), flexShrink: 0, boxSizing: 'border-box', fontSize: rem(11.5), fontWeight: 700, letterSpacing: '0.1em', lineHeight: rem(16), color: colors.brown[180], textTransform: 'uppercase' }}>
          Performance
        </Box>
        <Box sx={{ position: 'relative', flex: 1, minHeight: rem(130), mx: rem(-8.5) }}>
          {/* Absolutely filled so the chart gets a definite height even when the card height is auto (mobile carousel) */}
          <Box sx={{ position: 'absolute', inset: 0 }}>
            {perf && <PerformanceChart benchmark={perf.benchmark} portfolio={perf.portfolio} />}
          </Box>
        </Box>
        <Box sx={{ mt: rem(4), flexShrink: 0, display: 'flex', justifyContent: 'center', gap: rem(4.5) }}>
          {strategy.ranges.map((r) => {
            const on = r === range
            return (
              <ButtonBase
                key={r}
                aria-pressed={on}
                onClick={() => setRange(r)}
                sx={{
                  height: rem(25), minWidth: rem(29), px: rem(8), borderRadius: rem(13),
                  bgcolor: on ? colors.red[271] : colors.blue[941], color: on ? colors.base.white : colors.gray[239],
                  fontFamily: 'inherit', fontSize: rem(12.5), fontWeight: 500, transition: 'background-color .15s',
                }}
              >
                {r}
              </ButtonBase>
            )
          })}
        </Box>
      </Box>

      {/* Actions */}
      <Box sx={{ mt: rem(12), px: rem(PX), display: 'flex', gap: rem(9) }}>
        <ButtonBase
          onClick={() => onPerformance?.(strategy)}
          sx={{
            flex: 1, height: rem(35.5), borderRadius: rem(10), boxSizing: 'border-box', border: `${rem(1)} solid ${C.maroon}`,
            bgcolor: colors.base.white, color: C.maroon, fontFamily: 'inherit', fontSize: rem(12), fontWeight: 700,
          }}
        >
          Performance
        </ButtonBase>
        <ButtonBase
          onClick={() => onInvestMore?.(strategy)}
          sx={{
            flex: 1, height: rem(35.5), borderRadius: rem(10), color: colors.base.white, fontFamily: 'inherit',
            fontSize: rem(12), fontWeight: 700, background: gradients.primaryButton,
          }}
        >
          Invest More
        </ButtonBase>
      </Box>
    </StrategyCardShell>
  )
}
