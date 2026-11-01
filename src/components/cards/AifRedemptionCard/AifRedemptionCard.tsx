import { Box, ButtonBase, InputBase } from '@mui/material'
import { useState } from 'react'
import { formatDate, formatInr, rem } from '../../../utils/format'
import { AifCardShell, C, type AifHeader } from '../AifTopupCard/AifTopupCard'
import RadioOption from '../../common/RadioOption'
import { colors, gradients } from '../../../theme'

export interface AifRedemptionUnit {
  name: string
  inceptionDate: string
  nav: number
  investedValue: number
  currentValue: number
  /** ISO date */
  exitLoadDate: string
}

export interface AifRedemptionFund extends AifHeader {
  id: string
  unitClasses: AifRedemptionUnit[]
}

type Mode = 'full' | 'partial'
interface Sel {
  mode: Mode
  /** Partial amount as typed (digits only) */
  partial: string
}

const WIDTHS = [150, 150, 100, 160, 160, 130, 190, 184]
const COLS = WIDTHS.map(rem).join(' ')
const TABLE_MIN = rem(WIDTHS.reduce((a, b) => a + b, 0))
const HEADS = ['Unit Class', 'Inception Date', 'NAV', 'Invested Val. (₹)', 'Current Value (₹)', 'Exit Load', 'Redemption Type', 'Amount (₹)']
const RIGHT = new Set([3, 4, 7])

export default function AifRedemptionCard({
  fund,
  onRedeem,
}: {
  fund: AifRedemptionFund
  onRedeem?: (fund: AifRedemptionFund, items: { unitClass: string; type: Mode; amount: number }[]) => void
}) {
  const [sel, setSel] = useState<Record<string, Sel>>({})

  const amountOf = (u: AifRedemptionUnit): number => {
    const s = sel[u.name]
    if (!s) return 0
    return s.mode === 'full' ? u.investedValue : Number(s.partial || 0)
  }
  const pick = (u: AifRedemptionUnit, mode: Mode) =>
    setSel((p) => ({ ...p, [u.name]: { mode, partial: p[u.name]?.partial ?? '' } }))
  const setPartial = (u: AifRedemptionUnit, raw: string) => {
    const digits = raw.replace(/\D/g, '').replace(/^0+(?=\d)/, '')
    const capped = Number(digits) > u.investedValue ? String(u.investedValue) : digits
    setSel((p) => ({ ...p, [u.name]: { mode: 'partial', partial: capped } }))
  }

  const total = fund.unitClasses.reduce((a, u) => a + amountOf(u), 0)
  const hasPartialEmpty = fund.unitClasses.some((u) => sel[u.name]?.mode === 'partial' && !sel[u.name].partial)
  const canRedeem = total > 0 && !hasPartialEmpty
  const showAmount = Object.keys(sel).length > 0

  return (
    <AifCardShell fund={fund} unitCount={fund.unitClasses.length}>
      <Box sx={{ border: `${rem(1)} solid ${C.line}`, borderRadius: rem(20), overflow: 'hidden', bgcolor: colors.base.white }}>
        <Box sx={{ overflowX: 'auto' }}>
          <Box role="table" sx={{ minWidth: TABLE_MIN }}>
            <Box role="row" sx={{ display: 'grid', gridTemplateColumns: COLS, alignItems: 'center', height: rem(37.5), bgcolor: colors.surface.tableHead, borderBottom: `${rem(1)} solid ${C.line}` }}>
              {HEADS.map((h, i) => (
                <Box
                  key={h}
                  role="columnheader"
                  sx={{
                    fontSize: rem(12), color: C.gold, whiteSpace: 'nowrap', pl: i === 0 ? rem(14) : 0,
                    ...(RIGHT.has(i) ? { textAlign: 'right', pr: rem(14) } : { pl: i === 0 ? rem(14) : rem(4) }),
                    ...(i === 7 ? { pr: rem(14.5), opacity: showAmount ? 1 : 0, transition: 'opacity .2s' } : {}),
                  }}
                >
                  {h}
                </Box>
              ))}
            </Box>
            {fund.unitClasses.map((u, idx) => {
              const s = sel[u.name]
              return (
                <Box
                  key={u.name}
                  role="row"
                  sx={{
                    display: 'grid', gridTemplateColumns: COLS, alignItems: 'center', minHeight: rem(36.7), py: rem(s?.mode === 'partial' ? 5 : 0),
                    bgcolor: idx % 2 === 1 ? colors.surface.tint : colors.base.white, fontSize: rem(12), fontWeight: 500, color: colors.brown[196],
                    borderBottom: idx < fund.unitClasses.length - 1 ? `${rem(1)} solid ${C.line}` : 0, transition: 'padding .2s',
                    '& > div': { whiteSpace: 'nowrap' },
                  }}
                >
                  <Box sx={{ pl: rem(14), fontWeight: 700, color: C.text }}>{u.name}</Box>
                  <Box sx={{ pl: rem(4) }}>{formatDate(u.inceptionDate)}</Box>
                  <Box sx={{ pl: rem(4) }}>{u.nav.toFixed(2)}</Box>
                  <Box sx={{ textAlign: 'right', pr: rem(14) }}>{formatInr(u.investedValue)}</Box>
                  <Box sx={{ textAlign: 'right', pr: rem(14) }}>{formatInr(u.currentValue)}</Box>
                  <Box sx={{ pl: rem(4) }}>{formatDate(u.exitLoadDate)}</Box>
                  <Box sx={{ pl: rem(4), display: 'flex', gap: rem(10), alignItems: 'center' }} role="radiogroup" aria-label={`Redemption type for ${u.name}`}>
                    <RadioOption on={s?.mode === 'full'} label="Full" onClick={() => pick(u, 'full')} />
                    <RadioOption on={s?.mode === 'partial'} label="Partial" onClick={() => pick(u, 'partial')} />
                  </Box>
                  <Box sx={{ pr: rem(14.5), display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                    {s?.mode === 'full' ? (
                      <Box sx={{ fontWeight: 700, color: colors.red[325] }}>{formatInr(u.investedValue)}</Box>
                    ) : s?.mode === 'partial' ? (
                      <InputBase
                        value={s.partial ? formatInr(Number(s.partial)) : ''}
                        onChange={(e) => setPartial(u, e.target.value)}
                        placeholder="0"
                        inputProps={{ inputMode: 'numeric', 'aria-label': `Partial amount for ${u.name}`, style: { textAlign: 'right' } }}
                        sx={{
                          width: rem(85), height: rem(25), px: rem(8), boxSizing: 'border-box', border: `${rem(1)} solid ${colors.border.input}`, borderRadius: rem(8),
                          fontFamily: 'inherit', fontSize: rem(12), bgcolor: colors.surface.tint, '&.Mui-focused': { borderColor: colors.brand.primary },
                        }}
                      />
                    ) : (
                      <Box sx={{ color: colors.sand[755] }}>—</Box>
                    )}
                  </Box>
                </Box>
              )
            })}
          </Box>
        </Box>

        {/* Footer */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: rem(12), px: rem(14), py: rem(12), bgcolor: colors.cream[971], borderTop: `${rem(2)} solid ${C.line}` }}>
          <Box sx={{ fontSize: rem(12), color: colors.text.secondary, display: 'flex', gap: rem(6), alignItems: 'baseline' }}>
            Total Redemption Amount
            <Box component="span" sx={{ fontWeight: 800, color: colors.red[325], fontSize: rem(12.5) }}>
              ₹ {total > 0 ? formatInr(total) : '—'}
            </Box>
          </Box>
          <ButtonBase
            disabled={!canRedeem}
            onClick={() =>
              onRedeem?.(
                fund,
                fund.unitClasses.filter((u) => amountOf(u) > 0).map((u) => ({ unitClass: u.name, type: sel[u.name].mode, amount: amountOf(u) })),
              )
            }
            sx={{
              height: rem(33), px: rem(17), borderRadius: rem(10), fontFamily: 'inherit', fontSize: rem(12.5), fontWeight: 600, color: colors.base.white,
              background: gradients.primaryButton, transition: 'background .2s',
              '&.Mui-disabled': { background: colors.border.soft, color: colors.sand[704] },
            }}
          >
            Redeem
          </ButtonBase>
        </Box>
      </Box>
    </AifCardShell>
  )
}
