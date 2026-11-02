import { Box, ButtonBase } from '@mui/material'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useState, type MouseEvent, type ReactNode } from 'react'
import { formatDate, formatInr, rem } from '../../../utils/format'
import CheckDot from '../../common/CheckDot'
import Collapse, { COLLAPSE_MS as DUR, EASE } from '../../common/Collapse'
import Logo from '../../common/Logo'
import { colors, gradients } from '../../../theme'

export interface AifUnitClass {
  name: string
  /** ISO date */
  inceptionDate: string
  commitment: number
  capitalCalled: number
  contributed: number
  currentValue: number
  defaultSelected: boolean
}

export interface AifFund {
  id: string
  provider: string
  name: string
  folio: string
  /** e.g. "CAT III" */
  category: string
  broker: string
  commitment: number
  capitalCalled: number
  contributed: number
  currentValue: number
  unitClasses: AifUnitClass[]
}

export const NARROW = '@media (max-width:48rem)'

export const C = {
  maroon: colors.brand.primaryDark,
  gold: colors.gold.base,
  text: colors.text.ink,
  body: colors.text.body,
  line: colors.border.default,
  rule: colors.border.rule,
  head: colors.text.subtle,
}

export const inr = (n: number) => `₹${formatInr(n)}`
export const font = { fontFamily: 'inherit', m: 0 } as const

const statLabel = { ...font, fontSize: rem(12), lineHeight: rem(16), color: C.gold } as const
const statValue = { ...font, mt: rem(2.5), fontSize: rem(11.5), fontWeight: 600, lineHeight: rem(16), color: C.body } as const
const bigValue = { ...font, mt: rem(3.5), fontSize: rem(15.5), fontWeight: 800, lineHeight: rem(20), color: C.text } as const


const COLS = [42, 68, 0, 144.5, 144.5, 144.5, 144.5].map((w) => (w ? rem(w) : '1fr')).join(' ')
const TABLE_MIN = rem(763)

export interface AifHeader {
  provider: string
  name: string
  folio: string
  category: string
  broker: string
  commitment: number
  capitalCalled: number
  contributed: number
  currentValue: number
}

/** Shared collapsed/expanded frame for AIF cards; `children` is the expanded right-hand content. */
export function AifCardShell({ fund, unitCount, children }: { fund: AifHeader; unitCount: number; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const stop = (e: MouseEvent) => e.stopPropagation()

  const stats = [
    { label: 'Unit Classes', value: String(unitCount).padStart(2, '0') },
    { label: 'Broker', value: fund.broker },
    { label: 'Commitment Amount', value: inr(fund.commitment) },
    { label: 'Capital called', value: inr(fund.capitalCalled) },
    { label: 'Amount Contributed', value: inr(fund.contributed) },
  ]

  return (
    <Box
      sx={{
        width: '100%', boxSizing: 'border-box', bgcolor: colors.base.white, borderRadius: rem(20), overflow: 'hidden',
        border: `${rem(open ? 2 : 1)} solid ${open ? C.maroon : C.line}`, transition: `border-color .25s`,
      }}
    >
      {/* Header (click anywhere to open / close) */}
      <Box
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setOpen((o) => !o)
          }
        }}
        sx={{
          position: 'relative', display: 'flex', alignItems: 'flex-start', minHeight: rem(85), boxSizing: 'border-box',
          pl: rem(23.4), pr: rem(24), cursor: 'pointer', outline: 'none', borderBottom: `${rem(1)} solid ${C.line}`,
          '&:focus-visible': { boxShadow: `inset 0 0 0 ${rem(2)} ${colors.gold.soft}` },
        }}
      >
        <Box sx={{ mt: rem(21), mr: rem(12) }}>
          <CheckDot on={open} size={23} icon={12} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0, pt: rem(20.4), pb: rem(19) }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: rem(11), height: rem(14) }}>
            <Logo size={rem(10)} />
            <Box component="span" sx={{ ...font, fontSize: rem(11.25), letterSpacing: '0.07em', color: C.head, textTransform: 'uppercase' }}>
              {fund.provider}
            </Box>
          </Box>
          <Box sx={{ mt: rem(7.3), display: 'flex', alignItems: 'center', gap: rem(12), flexWrap: 'wrap' }}>
            <Box component="h3" sx={{ ...font, fontSize: rem(17.25), fontWeight: 700, lineHeight: rem(24), color: C.text }}>
              {fund.name}
            </Box>
            <Box
              sx={{
                height: rem(24), px: rem(6.5), display: 'flex', alignItems: 'center', borderRadius: rem(4), boxSizing: 'border-box',
                bgcolor: colors.cream[939], border: `${rem(1)} solid ${colors.sand[812]}`, color: colors.brown[327], fontWeight: 600, fontSize: rem(11.75),
                letterSpacing: '0.05em', whiteSpace: 'nowrap',
              }}
            >
              Folio No: {fund.folio}
            </Box>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: rem(16.6), mt: rem(19) }}>
          <Box
            sx={{
              height: rem(22.3), px: rem(9.8), display: 'flex', alignItems: 'center', borderRadius: rem(5), bgcolor: colors.blue[935],
              color: colors.blue[392], fontWeight: 700, fontSize: rem(11.5), letterSpacing: '0.05em', whiteSpace: 'nowrap',
            }}
          >
            {fund.category}
          </Box>
          <Box
            sx={{
              display: 'flex', color: colors.gold.deep, transform: open ? 'rotate(180deg)' : 'none',
              transition: `transform ${DUR}s ${EASE}`,
            }}
          >
            <ChevronDown size="0.75rem" strokeWidth={2.4} />
          </Box>
        </Box>
      </Box>

      {/* Collapsed: summary row (click toggles too) */}
      <Box onClick={() => setOpen(true)} sx={{ cursor: open ? 'default' : 'pointer' }}>
        <Collapse open={!open}>
          <Box
            sx={{
              display: 'grid', gridTemplateColumns: '1.13fr repeat(4, 1fr) 1.12fr', minHeight: rem(64.5), boxSizing: 'border-box',
              [NARROW]: { gridTemplateColumns: 'repeat(2, 1fr)', rowGap: rem(12), py: rem(12) },
            }}
          >
            {[...stats, { label: 'Current Value', value: inr(fund.currentValue), big: true }].map((s, i) => (
              <Box
                key={s.label}
                sx={{
                  position: 'relative', pl: i === 0 ? rem(19.5) : rem(17.5), pt: rem(12.5), minWidth: 0,
                  '&:not(:first-of-type)::before': {
                    content: '""', position: 'absolute', left: 0, top: rem(11), height: rem(42.5), width: rem(1), bgcolor: C.rule,
                  },
                  [NARROW]: { pl: rem(19.5), pt: 0, '&::before': { display: 'none' } },
                }}
              >
                <Box sx={statLabel}>{s.label}</Box>
                <Box sx={'big' in s && s.big ? bigValue : statValue}>{s.value}</Box>
              </Box>
            ))}
          </Box>
        </Collapse>
      </Box>

      {/* Expanded: sidebar + unit-class table */}
      <Box onClick={stop}>
        <Collapse open={open}>
          <Box sx={{ display: 'flex', [NARROW]: { flexDirection: 'column' } }}>
            {/* Sidebar */}
            <Box
              sx={{
                position: 'relative', overflow: 'hidden', width: rem(172), flexShrink: 0, boxSizing: 'border-box',
                px: rem(15), py: rem(14.5), borderRight: `${rem(1)} solid ${C.line}`,
                background: gradients.sidebar,
                [NARROW]: {
                  width: '100%', borderRight: 0, borderBottom: `${rem(1)} solid ${C.line}`, display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)', rowGap: rem(14), columnGap: rem(12), px: rem(19.5),
                },
              }}
            >
              <Box sx={{ position: 'absolute', top: rem(-12), right: rem(-26), width: rem(88), height: rem(88), borderRadius: '50%', bgcolor: colors.cream[927] }} />
              <Box sx={{ position: 'absolute', bottom: rem(-22), left: rem(-14), width: rem(62), height: rem(62), borderRadius: '50%', bgcolor: colors.cream[908] }} />
              {[
                { label: 'Broker', value: fund.broker },
                { label: 'Commitment Amount', value: inr(fund.commitment) },
                { label: 'Capital called', value: inr(fund.capitalCalled) },
                { label: 'Amount Contributed', value: inr(fund.contributed) },
                { label: 'Current Value', value: inr(fund.currentValue), big: true },
              ].map((s, i, arr) => (
                <Box key={s.label} sx={{ position: 'relative', mb: i < arr.length - 1 ? rem(20.25) : 0, [NARROW]: { mb: 0 } }}>
                  <Box sx={statLabel}>{s.label}</Box>
                  <Box sx={s.big ? bigValue : statValue}>{s.value}</Box>
                </Box>
              ))}
            </Box>

            <Box sx={{ flex: 1, minWidth: 0, p: `${rem(21.5)} ${rem(21)} ${rem(36)}`, [NARROW]: { p: `${rem(16)} ${rem(14)} ${rem(20)}` } }}>
              {children}
            </Box>
          </Box>
        </Collapse>
      </Box>
    </Box>
  )
}

interface Props {
  fund: AifFund
  onMakePayment?: (fund: AifFund, unitClasses: string[]) => void
}

export default function AifTopupCard({ fund, onMakePayment }: Props) {
  const [picked, setPicked] = useState<Set<string>>(
    () => new Set(fund.unitClasses.filter((u) => u.defaultSelected).map((u) => u.name)),
  )
  const toggleRow = (name: string) =>
    setPicked((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  return (
    <AifCardShell fund={fund} unitCount={fund.unitClasses.length}>
              <Box sx={{ border: `${rem(1)} solid ${C.line}`, borderRadius: rem(20), overflow: 'hidden', overflowX: 'auto', bgcolor: colors.base.white }}>
                <Box role="table" sx={{ minWidth: TABLE_MIN }}>
                  <Box
                    role="row"
                    sx={{ display: 'grid', gridTemplateColumns: COLS, alignItems: 'center', height: rem(37.5), bgcolor: colors.surface.tableHead, borderBottom: `${rem(1)} solid ${C.line}` }}
                  >
                    {['', 'Unit Class', 'Inception Date', 'Commitment Amt. (₹)', 'Capital Called (₹)', 'Amt. Contributed (₹)', 'Current Value (₹)'].map((h, i) => (
                      <Box
                        key={i}
                        role="columnheader"
                        sx={{
                          fontSize: rem(12), color: C.gold, whiteSpace: 'nowrap', overflow: 'visible',
                          ...(i >= 3 ? { textAlign: 'right' } : {}),
                          ...(i === 6 ? { pr: rem(14.5) } : {}),
                        }}
                      >
                        {h}
                      </Box>
                    ))}
                  </Box>
                  {fund.unitClasses.map((u, idx) => {
                    const on = picked.has(u.name)
                    return (
                      <Box
                        key={u.name}
                        role="row"
                        onClick={() => toggleRow(u.name)}
                        sx={{
                          display: 'grid', gridTemplateColumns: COLS, alignItems: 'center', height: rem(36.7), cursor: 'pointer',
                          bgcolor: idx % 2 === 1 ? colors.surface.tint : colors.base.white,
                          borderBottom: idx < fund.unitClasses.length - 1 ? `${rem(1)} solid ${C.line}` : 0,
                          fontSize: rem(12), color: colors.brown[196], transition: 'background-color .15s', '&:hover': { bgcolor: colors.cream[963] },
                        }}
                      >
                        <Box sx={{ pl: rem(14) }}>
                          <CheckDot on={on} size={14} icon={8} />
                        </Box>
                        <Box sx={{ fontWeight: 700, color: C.text }}>{u.name}</Box>
                        <Box sx={{ fontWeight: 500, whiteSpace: 'nowrap' }}>{formatDate(u.inceptionDate)}</Box>
                        <Box sx={{ textAlign: 'right', fontWeight: 500 }}>{formatInr(u.commitment)}</Box>
                        <Box sx={{ textAlign: 'right', fontWeight: 500 }}>{formatInr(u.capitalCalled)}</Box>
                        <Box sx={{ textAlign: 'right', fontWeight: 500 }}>{formatInr(u.contributed)}</Box>
                        <Box sx={{ textAlign: 'right', fontWeight: 500, pr: rem(14.5) }}>{formatInr(u.currentValue)}</Box>
                      </Box>
                    )
                  })}
                </Box>
              </Box>

              <Box sx={{ mt: rem(14.5), display: 'flex', justifyContent: 'flex-end' }}>
                <ButtonBase
                  disabled={picked.size === 0}
                  onClick={() => onMakePayment?.(fund, [...picked])}
                  sx={{
                    height: rem(34), px: rem(14), gap: rem(8), borderRadius: rem(10), color: colors.base.white, fontFamily: 'inherit',
                    fontSize: rem(13), fontWeight: 500, background: gradients.primaryButton,
                    '&.Mui-disabled': { opacity: 0.45, color: colors.base.white },
                  }}
                >
                  Make Payment
                  <ChevronRight size="0.8125rem" strokeWidth={2.5} />
                </ButtonBase>
              </Box>
    </AifCardShell>
  )
}
