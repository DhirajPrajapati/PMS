import { Box, Tooltip } from '@mui/material'
import { Building2, Landmark, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react'
import type { ReactNode } from 'react'
import { rem } from '../../../utils/format'
import CheckDot from '../../common/CheckDot'
import { colors } from '../../../theme'

export interface Profile {
  id: string
  investorCode: string
  name: string
  joint: boolean
  verified: boolean
  mobile: string
  /** Masked by the backend */
  email: string
  address: string
  bankName: string
  /** Masked by the backend, e.g. "XXXX 4521" */
  bankAccount: string
  nominees: number
  broker: string
}

interface Props {
  profile: Profile
  /** Stacked label/value rows (mobile) instead of the wide two-block layout */
  compact?: boolean
  selected?: boolean
  /** Called on click / Enter / Space; the parent decides select vs. deselect */
  onSelect?: (p: Profile) => void
}

const font = { fontFamily: 'inherit', m: 0 } as const
const GOLD = colors.gold.base
const BORDER_HOVER = colors.sand[620]

const pill = (bg: string, fg: string, border: string) =>
  ({
    ...font, display: 'inline-flex', alignItems: 'center', height: rem(18), px: rem(7), borderRadius: rem(4), boxSizing: 'border-box',
    bgcolor: bg, color: fg, border: `${rem(1)} solid ${border}`, fontSize: rem(12), fontWeight: 700, letterSpacing: '0.04em', whiteSpace: 'nowrap', flexShrink: 0,
  }) as const

function Label({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: rem(4), color: GOLD, fontSize: 'inherit', fontWeight: 400, verticalAlign: 'top' }}>
      {icon}
      {children}
    </Box>
  )
}

const iconProps = { size: '0.65rem', strokeWidth: 1.7 } as const

const columnLabel = { ...font, fontSize: rem(11), fontWeight: 700, lineHeight: rem(14), letterSpacing: '0.06em', textTransform: 'uppercase', color: GOLD } as const

export default function ProfileCard({ profile: p, compact = false, selected = false, onSelect }: Props) {
  const header = (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: rem(10), height: rem(20) }}>
      <Box component="h3" sx={{ ...font, flex: 1, minWidth: 0, fontSize: rem(compact ? 17 : 16), fontWeight: 700, lineHeight: rem(20), color: colors.text.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {p.name}
      </Box>
      <Box component="span" sx={pill(colors.cream[908], colors.brown[318], colors.gold.soft)}>{p.investorCode}</Box>
      {p.joint && <Box component="span" sx={pill(colors.rose[967], colors.brand.accent, colors.rose[906])}>Joint</Box>}
      <CheckDot on={selected} size={20} icon={11} />
    </Box>
  )

  return (
    <Box
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={() => onSelect?.(p)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect?.(p)
        }
      }}
      sx={{
        cursor: 'pointer', outline: 'none', width: '100%', boxSizing: 'border-box', bgcolor: colors.base.white, borderRadius: rem(compact ? 18 : 20),
        border: `${rem(1.5)} solid ${selected ? BORDER_HOVER : colors.border.default}`, boxShadow: selected ? '0 0.25rem 1rem rgba(122, 31, 32, 0.08)' : 'none', px: rem(compact ? 14 : 14.5), pt: rem(compact ? 14 : 14.5),
        // Every card is the same size: long text is trimmed, never wrapped
        ...(compact ? { minHeight: rem(440) } : { height: rem(231) }), overflow: 'hidden',
        transition: 'border-color .15s, box-shadow .15s',
        '&:hover, &:focus-visible': { borderColor: BORDER_HOVER },
      }}
    >
      {header}

      {compact ? (
        <Box sx={{ mt: rem(12), pt: rem(14), borderTop: `${rem(1)} solid ${colors.border.default}`, display: 'grid', gap: rem(14), fontSize: rem(13.5), color: colors.text.secondary }}>
          {[
            { label: 'Mobile:', icon: <Phone {...iconProps} />, value: p.mobile },
            { label: 'Email:', icon: <Mail {...iconProps} />, value: p.email },
            { label: 'Address:', icon: <MapPin {...iconProps} />, value: <Box sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '2.9em' }}>{p.address}</Box> },
            {
              label: 'Bank:', icon: <Landmark {...iconProps} />,
              value: (
                <>
                  {p.bankName}
                  <br />
                  {p.bankAccount}
                </>
              ),
            },
            { label: 'Nominees:', icon: <ShieldCheck {...iconProps} />, value: p.nominees },
            { label: 'Broker:', icon: <Building2 {...iconProps} />, value: p.broker },
          ].map((r) => (
            <Box key={r.label}>
              <Label icon={r.icon}>{r.label}</Label>
              <Box sx={{ mt: rem(4), lineHeight: 1.45 }}>{r.value}</Box>
            </Box>
          ))}
        </Box>
      ) : (
        <>
          <Box sx={{ mt: rem(17), height: rem(16), display: 'flex', alignItems: 'center', gap: rem(8), fontSize: rem(12.5), lineHeight: rem(16), color: colors.text.secondary, whiteSpace: 'nowrap' }}>
            <Box component="span" sx={{ flexShrink: 0 }}><Label icon={<Phone {...iconProps} />}>Mobile:</Label> {p.mobile}</Box>
            <Box component="span" aria-hidden sx={{ color: colors.sand[686] }}>·</Box>
            <Box component="span" sx={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}><Label icon={<Mail {...iconProps} />}>Email:</Label> {p.email}</Box>
          </Box>

          <Tooltip
            title={p.address}
            arrow
            placement="top"
            slotProps={{
              tooltip: { sx: { bgcolor: colors.text.ink, fontSize: rem(12.5), borderRadius: rem(8), px: rem(12), py: rem(8), maxWidth: rem(300) } },
              arrow: { sx: { color: colors.text.ink } },
            }}
          >
            <Box sx={{ mt: rem(17), height: rem(16), fontSize: rem(12.5), lineHeight: rem(16), color: colors.text.secondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <Label icon={<MapPin {...iconProps} />}>Address:</Label> {p.address}
            </Box>
          </Tooltip>

          <Box sx={{ mt: rem(19), borderTop: `${rem(1)} solid ${colors.border.default}`, pt: rem(21), display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
            <Box sx={{ pl: rem(7), minWidth: 0 }}>
              <Box sx={{ ...columnLabel, mt: rem(-1) }}>Bank</Box>
              <Box sx={{ mt: rem(4), fontSize: rem(14.5), fontWeight: 700, lineHeight: rem(20), color: colors.text.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.bankName}</Box>
              <Box sx={{ mt: rem(1), fontSize: rem(12.5), lineHeight: rem(18), color: colors.text.mutedWarm }}>{p.bankAccount}</Box>
            </Box>
            <Box sx={{ pl: rem(7), minWidth: 0 }}>
              <Box sx={columnLabel}>Nominees</Box>
              <Box sx={{ mt: rem(9), fontSize: rem(15), fontWeight: 600, lineHeight: rem(20), color: colors.text.ink }}>{p.nominees}</Box>
            </Box>
            <Box sx={{ pl: rem(7), minWidth: 0 }}>
              <Box sx={columnLabel}>Broker</Box>
              <Box sx={{ mt: rem(9), fontSize: rem(13), lineHeight: rem(18), color: colors.text.mutedWarm, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.broker}</Box>
            </Box>
          </Box>
        </>
      )}
    </Box>
  )
}
