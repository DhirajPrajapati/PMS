import { Box, ButtonBase, InputBase } from '@mui/material'
import { Check, FileText, X } from 'lucide-react'
import { useState, type MouseEvent } from 'react'
import Logo from '../../common/Logo'
import Sparkline from '../../common/Sparkline'
import { formatAum, formatInr, formatPct, formatShort, rem } from '../../../utils/format'
import { colors } from '../../../theme'

const MOBILE = '@media (max-width:48rem)'

export interface RedemptionOption {
  code: string
  label: string
  summaryLabel: string
  requiresAmount: boolean
  rdFileAvailable: boolean
}

export type CardVariant = 'purchase' | 'summary' | 'redemption'

export interface PmsStrategy {
  id: string
  provider: string
  code: string
  name: string
  distributor: string
  /** Current AUM in rupees */
  aumRupees: number
  /** Signed percentage from the API, e.g. 15.2 or -3.4 */
  xirr: number
  /** Chart series from the API; may contain negative values */
  trend: number[]
  /** Minimum additional purchase, in rupees */
  minAmount: number
  /** Quick-add chip values, in rupees */
  quickAdd: number[]
  /** Card layout: purchase (amount input), summary (AUM only) or redemption */
  variant: CardVariant
  /** Redemption cards: show the "View Pending Partial Redemptions" link */
  hasPendingPartial: boolean
  /** Redemption cards: choices shown under "Redemption Type" */
  redemptionOptions: RedemptionOption[]
}

const C = {
  maroon: colors.brand.primaryDark,
  gold: colors.gold.base,
  goldSoft: colors.gold.soft,
  text: colors.text.ink,
  body: colors.text.body,
  provider: colors.text.subtle,
  line: colors.border.soft,
  disabled: colors.text.disabled,
  link: colors.text.muted,
  red: colors.status.error,
  green: colors.status.positive,
  negative: colors.status.negative,
}

const font = { fontFamily: 'inherit', m: 0 } as const

const linkBtn = (disabled: boolean) => ({
  fontFamily: 'inherit',
  fontSize: rem(12),
  lineHeight: rem(16),
  color: disabled ? C.disabled : C.link,
  textDecoration: 'underline',
  cursor: disabled ? 'default' : 'pointer',
  p: 0,
})

const label = {
  ...font,
  fontSize: rem(12),
  fontWeight: 600,
  lineHeight: rem(16),
  letterSpacing: '0.05em',
  color: C.gold,
  textTransform: 'uppercase',
} as const

interface Props {
  strategy: PmsStrategy
  /** Called when "View Pending Partial Redemptions" is clicked */
  onViewPending?: (strategy: PmsStrategy) => void
  /** Called when "View RD File" is clicked */
  onViewRdFile?: (strategy: PmsStrategy) => void
}

export default function PmsCard({ strategy, onViewPending, onViewRdFile }: Props) {
  const isPurchase = strategy.variant === 'purchase'
  const isRedemption = strategy.variant === 'redemption'
  const [redeemOption, setRedeemOption] = useState<RedemptionOption | null>(null)
  const [redeemAmount, setRedeemAmount] = useState(0)
  const [selected, setSelected] = useState(false)
  const [amount, setAmount] = useState(0)
  const [history, setHistory] = useState<number[]>([])

  const stop = (e: MouseEvent) => e.stopPropagation()
  const showError = selected && amount === 0
  const belowMin = selected && amount > 0 && amount < strategy.minAmount
  const hasError = isPurchase && (showError || belowMin)
  const positive = strategy.xirr >= 0
  const minLabel = formatShort(strategy.minAmount)

  const addChip = (rupees: number) => {
    setHistory((h) => [...h, amount])
    setAmount((a) => a + rupees)
  }
  const undo = () => {
    setAmount(history[history.length - 1] ?? 0)
    setHistory((h) => h.slice(0, -1))
  }
  const clear = () => {
    setAmount(0)
    setHistory([])
  }

  return (
    <Box
      role="checkbox"
      aria-checked={selected}
      tabIndex={0}
      onClick={() => setSelected((s) => !s)}
      onKeyDown={(e) => {
        if (e.target === e.currentTarget && (e.key === ' ' || e.key === 'Enter')) {
          e.preventDefault()
          setSelected((s) => !s)
        }
      }}
      sx={{
        width: '100%',
        boxSizing: 'border-box',
        bgcolor: colors.base.white,
        borderRadius: rem(20),
        border: `${rem(2)} solid ${selected ? C.maroon : C.line}`,
        p: `${rem(17)} ${rem(17)} ${rem(isPurchase ? 33 : isRedemption ? 17 : 38)}`,
        cursor: 'pointer',
        outline: 'none',
        transition: 'border-color .15s',
        '&:focus-visible': { boxShadow: `0 0 0 ${rem(3)} ${C.goldSoft}` },
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', height: rem(24) }}>
        <Logo />
        <Box
          component="span"
          sx={{ ...font, ml: rem(4), flex: 1, fontSize: rem(11.5), lineHeight: rem(16), letterSpacing: '0.07em', color: C.provider, textTransform: 'uppercase' }}
        >
          {strategy.provider}
        </Box>
        <Box
          sx={{
            height: rem(18), px: rem(6), display: 'flex', alignItems: 'center', borderRadius: rem(4),
            bgcolor: colors.cream[939], border: `${rem(1)} solid ${C.goldSoft}`, color: colors.brown[327],
            fontWeight: 700, fontSize: rem(12), letterSpacing: '0.05em', mr: rem(12), boxSizing: 'border-box',
          }}
        >
          {strategy.code}
        </Box>
        <Box
          sx={{
            width: rem(24), height: rem(24), borderRadius: '50%', display: 'grid', placeItems: 'center',
            bgcolor: selected ? C.maroon : colors.cream[910], color: colors.base.white, transition: 'background-color .15s',
          }}
        >
          <Check size="0.8125rem" strokeWidth={3} />
        </Box>
      </Box>

      <Box sx={{ ...font, mt: rem(4.5), fontSize: rem(17.5), fontWeight: 700, lineHeight: rem(24), color: C.text }}>
        {strategy.name}
      </Box>

      <Box sx={{ ...font, mt: rem(18.5), fontSize: rem(12), lineHeight: rem(16), color: C.gold }}>
        Distributor Name: <Box component="span" sx={{ color: C.body }}>{strategy.distributor}</Box>
      </Box>

      {/* AUM / XIRR */}
      <Box
        sx={{
          mt: rem(23),
          borderTop: `${rem(1)} solid ${C.line}`,
          ...(isPurchase || isRedemption
            ? { borderBottom: `${rem(1)} solid ${C.line}`, py: rem(26.5) }
            : { pt: rem(26.5) }),
        }}
      >
        <Box sx={{ display: 'flex', height: rem(45.5) }}>
          <Box
            sx={{
              width: rem(180.5), boxSizing: 'border-box', flexShrink: 0, borderLeft: `${rem(2)} solid ${colors.sand[692]}`, pl: rem(16),
              [MOBILE]: { width: 'auto', flex: 1 },
            }}
          >
            <Box sx={label}>Current AUM</Box>
            <Box sx={{ ...font, mt: rem(4.5), fontSize: rem(17.5), fontWeight: 800, lineHeight: rem(24), color: C.text }}>
              {formatAum(strategy.aumRupees)}
            </Box>
          </Box>
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'space-between', minWidth: 0, [MOBILE]: { flex: 'none' } }}>
            <Box sx={{ [MOBILE]: { textAlign: 'right' } }}>
              <Box sx={{ ...label, mt: rem(1.5) }}>XIRR</Box>
              <Box sx={{ ...font, mt: rem(9.5), fontSize: rem(13), lineHeight: rem(18), color: positive ? C.green : C.negative }}>
                {formatPct(strategy.xirr)}
              </Box>
            </Box>
            {/* Chart is hidden on mobile */}
            <Box sx={{ mt: rem(1), width: rem(90), height: rem(38), [MOBILE]: { display: 'none' } }}>
              <Sparkline data={strategy.trend} positive={positive} />
            </Box>
          </Box>
        </Box>
      </Box>

      {isPurchase && (
        <>
      {/* Amount */}
      <Box sx={{ mt: rem(14.5), display: 'flex', justifyContent: 'space-between', alignItems: 'center', lineHeight: rem(16) }}>
        <Box sx={{ ...font, fontSize: rem(12), color: C.body }}>Additional Purchase Amount</Box>
        <Box sx={{ ...font, fontSize: rem(12), color: C.gold }}>(Minimum: {minLabel})</Box>
      </Box>

      <Box
        onClick={stop}
        sx={{
          mt: rem(13.5), display: 'flex', alignItems: 'center', gap: rem(12), height: rem(35), boxSizing: 'border-box',
          pl: rem(12), pr: rem(13), borderRadius: rem(10), cursor: 'default',
          border: `${rem(1)} solid ${hasError ? C.red : C.line}`,
          '&:focus-within': { borderColor: hasError ? C.red : C.gold },
        }}
      >
        <InputBase
          fullWidth
          placeholder="₹ Enter Amount"
          value={amount ? `₹ ${formatInr(amount)}` : ''}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, '')
            setAmount(digits ? Math.min(Number(digits), 99999999999) : 0)
          }}
          inputProps={{ inputMode: 'numeric', 'aria-label': 'Additional purchase amount' }}
          sx={{
            fontFamily: 'inherit', fontSize: rem(14), color: C.text,
            '& input': { p: 0, height: rem(20) },
            '& input::placeholder': { color: C.disabled, opacity: 1 },
          }}
        />
        <ButtonBase disableRipple disabled={history.length === 0} onClick={undo} sx={linkBtn(history.length === 0)}>
          Undo
        </ButtonBase>
        <ButtonBase disableRipple disabled={amount === 0} onClick={clear} sx={linkBtn(amount === 0)}>
          Clear
        </ButtonBase>
      </Box>

      {hasError && (
        <Box sx={{ ...font, mt: rem(9.5), fontSize: rem(12), lineHeight: rem(16), color: C.red }}>
          {showError ? 'Please enter an amount to proceed' : `Minimum amount is ${minLabel}`}
        </Box>
      )}

      <Box onClick={stop} sx={{ mt: hasError ? rem(13) : rem(12), display: 'flex', gap: rem(8), cursor: 'default', width: 'fit-content' }}>
        {strategy.quickAdd.map((v) => (
          <ButtonBase
            key={v}
            onClick={() => addChip(v)}
            sx={{
              px: rem(11), height: rem(32), borderRadius: rem(16), border: `${rem(1)} solid ${C.goldSoft}`, boxSizing: 'border-box',
              color: C.gold, fontFamily: 'inherit', fontSize: rem(12), '&:hover': { bgcolor: colors.cream[957] },
            }}
          >
            {formatShort(v)}
          </ButtonBase>
        ))}
      </Box>
        </>
      )}

      {isRedemption && (
        <>
          <Box sx={{ mt: rem(13), display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: rem(8) }}>
            <Box sx={{ ...label, whiteSpace: 'nowrap' }}>Redemption Type</Box>
            {strategy.hasPendingPartial && (
              <ButtonBase
                disableRipple
                onClick={(e) => {
                  e.stopPropagation()
                  onViewPending?.(strategy)
                }}
                sx={{
                  fontFamily: 'inherit', fontSize: rem(12), lineHeight: rem(16), fontWeight: 500,
                  color: colors.brand.accent, textDecoration: 'underline', p: 0, textAlign: 'right',
                }}
              >
                View Pending Partial Redemptions
              </ButtonBase>
            )}
          </Box>
          <Box onClick={stop} sx={{ mt: rem(13), cursor: 'default' }}>
            {!redeemOption ? (
              <Box sx={{ display: 'flex', gap: rem(8) }}>
                {strategy.redemptionOptions.map((o) => (
                  <ButtonBase
                    key={o.code}
                    onClick={() => {
                      setRedeemOption(o)
                      setSelected(true)
                    }}
                    sx={{
                      flex: 1, height: rem(34), borderRadius: rem(10), boxSizing: 'border-box',
                      border: `${rem(1)} solid ${colors.sand[839]}`, bgcolor: colors.base.white, color: C.body,
                      fontFamily: 'inherit', fontSize: rem(13),
                    }}
                  >
                    {o.label}
                  </ButtonBase>
                ))}
              </Box>
            ) : (
              <Box
                sx={{
                  height: rem(34), boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: rem(7),
                  pl: rem(13), pr: rem(9), borderRadius: rem(10), border: `${rem(1)} solid ${C.line}`,
                  '&:focus-within': { borderColor: C.gold },
                }}
              >
                {redeemOption.requiresAmount ? (
                  <InputBase
                    autoFocus
                    fullWidth
                    placeholder="₹ Enter Amount"
                    value={redeemAmount ? `₹ ${formatInr(redeemAmount)}` : ''}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '')
                      setRedeemAmount(digits ? Math.min(Number(digits), 99999999999) : 0)
                    }}
                    inputProps={{ inputMode: 'numeric', 'aria-label': 'Redemption amount' }}
                    sx={{
                      fontFamily: 'inherit', fontSize: rem(14), color: C.text,
                      '& input': { p: 0, height: rem(20) },
                      '& input::placeholder': { color: C.disabled, opacity: 1 },
                    }}
                  />
                ) : (
                  <>
                    <Box sx={{ ...font, flex: 1, fontSize: rem(14), fontWeight: 500, color: C.text }}>
                      {redeemOption.summaryLabel}
                    </Box>
                    {redeemOption.rdFileAvailable && (
                      <ButtonBase
                        disableRipple
                        onClick={() => onViewRdFile?.(strategy)}
                        sx={{ gap: rem(8), p: 0, color: colors.brand.accent, fontFamily: 'inherit', fontSize: rem(13) }}
                      >
                        <FileText size="0.8125rem" strokeWidth={2} />
                        View RD File
                      </ButtonBase>
                    )}
                  </>
                )}
                <ButtonBase
                  aria-label="Change redemption type"
                  onClick={() => {
                    setRedeemOption(null)
                    setRedeemAmount(0)
                  }}
                  sx={{
                    width: rem(20), height: rem(20), borderRadius: '50%', bgcolor: colors.rose[925], color: colors.text.muted, flexShrink: 0,
                  }}
                >
                  <X size="0.625rem" strokeWidth={2.5} />
                </ButtonBase>
              </Box>
            )}
          </Box>
        </>
      )}
    </Box>
  )
}
