import { Box, ButtonBase } from '@mui/material'
import { formatAum, formatCrore, formatDate, rem } from '../../../utils/format'
import Sparkline from '../../common/Sparkline'
import { tagStyle } from '../../../utils/tags'
import { colors, gradients } from '../../../theme'
import StrategyCardShell from './StrategyCardShell'
import { C, PX, font, tileLabel, tileValue } from './shared'
import type { MyStrategy } from './types'

const pad2 = (iso: string) => formatDate(iso).replace(/^(\d) /, '0$1 ')

const chip = {
  ...font,
  height: rem(22.6), px: rem(7), boxSizing: 'border-box', display: 'flex', alignItems: 'center', borderRadius: rem(5),
  fontSize: rem(12), fontWeight: 600, whiteSpace: 'nowrap',
} as const

const aifTileLabel = { ...tileLabel, fontSize: rem(12) } as const

export default function AifStrategyCard({ strategy, onTopUp, onStatement }: {
  strategy: MyStrategy
  onTopUp?: (s: MyStrategy) => void
  onStatement?: (s: MyStrategy) => void
}) {
  const aif = strategy.aif
  if (!aif) return null
  const positive = aif.absReturn >= 0
  const retColor = positive ? colors.status.positiveText : colors.status.negativeText
  const cat = tagStyle('PMS')

  return (
    <StrategyCardShell strategy={strategy} wrapName>
      {/* Folio + category chips */}
      <Box sx={{ px: rem(PX), mt: rem(1), display: 'flex', gap: rem(6) }}>
        <Box sx={{ ...chip, bgcolor: colors.cream[939], border: `${rem(1)} solid ${colors.sand[812]}`, color: colors.brown[327], fontWeight: 500 }}>
          Folio: {aif.folio}
        </Box>
        <Box sx={{ ...chip, bgcolor: cat.bg, color: cat.fg }}>{aif.category}</Box>
      </Box>

      {/* Invested | AUM */}
      <Box sx={{ mt: rem(22.6), px: rem(PX), display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: rem(9) }}>
        {[
          { label: 'Invested', value: formatCrore(strategy.invested), bg: colors.rose[981], border: colors.rose[922], color: colors.brand.accent },
          { label: 'AUM', value: formatCrore(strategy.aum), bg: colors.blue[980], border: colors.blue[920], color: colors.blue[241] },
        ].map((t) => (
          <Box
            key={t.label}
            sx={{ boxSizing: 'border-box', px: rem(16), pt: rem(18), pb: rem(18), borderRadius: rem(14), bgcolor: t.bg, border: `${rem(1)} solid ${t.border}` }}
          >
            <Box sx={{ ...aifTileLabel, color: t.color }}>{t.label}</Box>
            <Box sx={{ ...tileValue, color: C.text }}>{t.value}</Box>
          </Box>
        ))}
      </Box>

      {/* Absolute return + sparkline */}
      <Box sx={{ position: 'relative', mt: rem(24.5), pl: rem(22.8), pr: rem(PX + 1.5) }}>
        <Box sx={{ ...tileLabel, fontSize: rem(12.5), fontWeight: 500, letterSpacing: '0.08em', color: colors.green[394] }}>Abs. Return</Box>
        <Box sx={{ mt: rem(7), display: 'flex', alignItems: 'flex-end', gap: rem(9) }}>
          <Box sx={{ ...font, fontSize: rem(24), fontWeight: 800, lineHeight: rem(30), color: retColor, whiteSpace: 'nowrap' }}>
            {positive ? '+' : '-'}{formatAum(Math.abs(aif.absReturn))}
          </Box>
          <Box sx={{ ...font, pb: rem(4), fontSize: rem(12), fontWeight: 500, lineHeight: rem(16), color: retColor, whiteSpace: 'nowrap' }}>
            {positive ? '+' : '-'}{Math.abs(aif.absReturnPct).toFixed(2)}%
          </Box>
        </Box>
        <Box sx={{ position: 'absolute', top: rem(16.6), right: rem(PX + 1.5), width: rem(79), height: rem(23.7) }}>
          <Sparkline data={aif.trend} positive={positive} />
        </Box>
      </Box>

      {/* As on date | NAV */}
      <Box sx={{ mx: rem(PX), mt: rem(17.2), borderTop: `${rem(1)} solid ${C.line}`, display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        {[
          { label: 'As on Date', value: pad2(aif.navDate) },
          { label: 'NAV', value: `₹${aif.nav.toFixed(2)}` },
        ].map((x, i) => (
          <Box
            key={x.label}
            sx={{
              mt: rem(15), height: rem(48), boxSizing: 'border-box', pt: rem(5), pl: rem(8.5),
              ...(i === 1 ? { borderLeft: `${rem(1)} solid ${C.line}` } : {}),
            }}
          >
            <Box sx={{ ...font, fontSize: rem(13), lineHeight: rem(18), color: colors.text.mutedWarm }}>{x.label}</Box>
            <Box sx={{ ...font, mt: rem(2), fontSize: rem(13), fontWeight: 700, lineHeight: rem(18), color: colors.text.strong }}>{x.value}</Box>
          </Box>
        ))}
      </Box>

      {/* Actions */}
      <Box sx={{ mt: 'auto', pt: rem(14), px: rem(PX), display: 'flex', gap: rem(9) }}>
        <ButtonBase
          onClick={() => onStatement?.(strategy)}
          sx={{
            flex: 1, height: rem(35.5), borderRadius: rem(10), boxSizing: 'border-box', border: `${rem(1)} solid ${C.maroon}`,
            bgcolor: colors.base.white, color: C.maroon, fontFamily: 'inherit', fontSize: rem(12), fontWeight: 700,
          }}
        >
          View Statement
        </ButtonBase>
        <ButtonBase
          onClick={() => onTopUp?.(strategy)}
          sx={{
            flex: 1, height: rem(35.5), borderRadius: rem(10), color: colors.base.white, fontFamily: 'inherit',
            fontSize: rem(12), fontWeight: 700, background: gradients.primaryButton,
          }}
        >
          Top up
        </ButtonBase>
      </Box>
    </StrategyCardShell>
  )
}
