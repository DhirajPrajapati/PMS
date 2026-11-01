import { Box, ButtonBase } from '@mui/material'
import { useState } from 'react'
import { formatCrore, rem } from '../../../utils/format'
import Logo from '../../common/Logo'
import { tagStyle } from '../../../utils/tags'
import PerformanceChart from '../../common/PerformanceChart'
import { colors, gradients } from '../../../theme'

export interface MyStrategy {
  id: string
  provider: string
  /** Corner tag, e.g. "PMS" */
  tag: string
  name: string
  /** Rupees */
  invested: number
  /** Rupees */
  aum: number
  /** Signed percentage */
  xirr: number
  /** Performance range buttons, in display order */
  ranges: string[]
  defaultRange: string
  /** Returns per range label (benchmark vs portfolio), straight from the API */
  performance: Record<string, Performance>
}

export interface Performance {
  benchmark: number
  portfolio: number
}

const C = {
  maroon: colors.brand.primary,
  text: colors.text.ink,
  line: colors.border.soft,
}

const font = { fontFamily: 'inherit', m: 0 } as const

const tileLabel = {
  ...font,
  fontSize: rem(11.5),
  fontWeight: 600,
  lineHeight: rem(16),
  letterSpacing: '0.03em',
  textTransform: 'uppercase',
} as const

const tileValue = {
  ...font,
  mt: rem(4),
  fontSize: rem(12),
  fontWeight: 800,
  lineHeight: rem(16),
} as const

interface Props {
  strategy: MyStrategy
  onPerformance?: (s: MyStrategy) => void
  onInvestMore?: (s: MyStrategy) => void
}

export default function MyStrategyCard({ strategy, onPerformance, onInvestMore }: Props) {
  const [range, setRange] = useState(strategy.defaultRange)
  const perf = strategy.performance[range] ?? null

  const tag = tagStyle(strategy.tag)
  const positive = strategy.xirr >= 0
  const xirrColor = positive ? colors.green[394] : colors.status.negativeText

  return (
    <Box
      sx={{
        position: 'relative', width: '100%', boxSizing: 'border-box', bgcolor: colors.base.white,
        borderRadius: rem(20), border: `${rem(1.5)} solid ${C.line}`, pb: rem(12),
      }}
    >
      {/* Corner tag: S-curved left edge (concave at the top, convex at the bottom) */}
      <Box
        sx={{
          position: 'absolute', top: rem(-1.5), right: rem(-1.5), width: rem(77.5), height: rem(30.5),
          borderTopRightRadius: rem(20), overflow: 'hidden',
        }}
      >
        <Box
          component="svg"
          viewBox="0 0 76 29"
          preserveAspectRatio="none"
          aria-hidden
          sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
        >
          <defs>
            <linearGradient id={`tag-g-${strategy.tag}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={tag.from} />
              <stop offset="1" stopColor={tag.to} />
            </linearGradient>
          </defs>
          <path d="M0 0A14.5 14.5 0 0 1 14.5 14.5A14.5 14.5 0 0 0 29 29H76V0Z" fill={`url(#tag-g-${strategy.tag})`} />
        </Box>
        <Box
          sx={{
            position: 'relative', height: '100%', pl: rem(14.5), pt: rem(1.5), pr: rem(1.5), boxSizing: 'border-box', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: tag.fg, fontWeight: 700, fontSize: rem(13), letterSpacing: '0.05em',
          }}
        >
          {strategy.tag}
        </Box>
      </Box>

      {/* Header */}
      <Box sx={{ px: rem(13), pt: rem(11) }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: rem(6), height: rem(24) }}>
          <Box sx={{ width: rem(20), height: rem(20), borderRadius: '50%', bgcolor: colors.cream[940], display: 'grid', placeItems: 'center' }}>
            <Logo size={rem(14)} />
          </Box>
          <Box component="span" sx={{ ...font, fontSize: rem(12), color: colors.text.mutedWarm }}>
            {strategy.provider}
          </Box>
        </Box>
        <Box
          sx={{
            ...font, mt: rem(5), fontSize: rem(14.5), fontWeight: 600, lineHeight: rem(20), color: colors.text.strong,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}
        >
          {strategy.name}
        </Box>
      </Box>

      {/* Tiles (scroll sideways when the card is narrow) */}
      <Box
        sx={{
          mt: rem(12.5), display: 'grid', gridTemplateColumns: 'repeat(3, minmax(min-content, 1fr))', gap: rem(6), px: rem(13), overflowX: 'auto',
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
              boxSizing: 'border-box', px: rem(9), pt: rem(11.5), pb: rem(8),
              borderRadius: rem(14), bgcolor: t.bg, border: `${rem(1)} solid ${t.border}`,
            }}
          >
            <Box sx={{ ...tileLabel, color: t.color }}>{t.label}</Box>
            <Box sx={{ ...tileValue, color: t.valueColor }}>{t.value}</Box>
          </Box>
        ))}
      </Box>

      {/* Performance */}
      <Box sx={{ mx: rem(13), mt: rem(13), height: rem(192), boxSizing: 'border-box', border: `${rem(1)} solid ${C.line}`, borderRadius: rem(12), px: rem(8.5), position: 'relative' }}>
        <Box sx={{ ...font, pt: rem(10.5), height: rem(29), boxSizing: 'border-box', fontSize: rem(11.5), fontWeight: 700, letterSpacing: '0.1em', lineHeight: rem(16), color: colors.brown[180], textTransform: 'uppercase' }}>
          Performance
        </Box>
        <Box sx={{ height: rem(130), mx: rem(-8.5) }}>
          {perf && <PerformanceChart benchmark={perf.benchmark} portfolio={perf.portfolio} />}
        </Box>
        <Box sx={{ mt: rem(4), display: 'flex', justifyContent: 'center', gap: rem(4.5) }}>
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
      <Box sx={{ mt: rem(13), px: rem(13), display: 'flex', gap: rem(8) }}>
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
    </Box>
  )
}
