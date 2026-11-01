import { Box, ButtonBase, Dialog } from '@mui/material'
import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { fetchPendingPartialRedemptions, type PendingRedemption, type RedemptionStatus } from '../api/redemptions'
import { formatDate, formatInr, rem } from '../utils/format'
import type { PmsStrategy } from './cards/PmsCard'
import { colors, gradients, overlays, shadows } from '../theme'

const MOBILE = '@media (max-width:48rem)'

const C = {
  maroon: colors.brand.accent,
  gold: colors.gold.base,
  text: colors.text.dialog,
  muted: colors.text.muted,
  line: colors.border.default,
}

const STATUS: Record<RedemptionStatus, { label: string; bg: string; color: string }> = {
  TRANSACTION_REJECTED: { label: 'Transaction Rejected', bg: colors.rose[945], color: colors.status.errorText },
  PAYOUT_INITIATED: { label: 'Payout Initiated', bg: colors.cream[920], color: colors.brown[357] },
}

/** "2025-05-14" -> "14 May 2025" */
const COLS = `${rem(195)} ${rem(162)} 1fr`
const COLS_MOBILE = '1fr 1fr 1.5fr'

const headCell = {
  fontSize: rem(12), fontWeight: 600, letterSpacing: '0.05em', lineHeight: rem(16),
  color: C.gold, textTransform: 'uppercase',
  [MOBILE]: { fontSize: rem(10.5), lineHeight: rem(13), letterSpacing: '0.03em' },
} as const

interface Props {
  /** Dialog is open while a strategy is set */
  strategy: PmsStrategy | null
  onClose: () => void
}

export default function PendingRedemptionsDialog({ strategy, onClose }: Props) {
  const [rows, setRows] = useState<PendingRedemption[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const id = strategy?.id
  useEffect(() => {
    if (!id) return
    let cancelled = false
    setRows(null)
    setError(null)
    fetchPendingPartialRedemptions(id)
      .then((d) => !cancelled && setRows(d.items))
      .catch((e: Error) => !cancelled && setError(e.message))
    return () => {
      cancelled = true
    }
  }, [id])

  return (
    <Dialog
      open={!!strategy}
      onClose={onClose}
      aria-labelledby="pending-redemptions-title"
      slotProps={{
        backdrop: { sx: { bgcolor: overlays.backdrop, backdropFilter: 'blur(3px)' } },
        paper: {
          sx: {
            width: rem(620), maxWidth: `calc(100% - ${rem(32)})`, m: 0, borderRadius: rem(20),
            position: 'relative', overflow: 'hidden', bgcolor: colors.surface.dialog, boxShadow: shadows.dialog,
            fontFamily: 'inherit',
          },
        },
      }}
    >
      {/* Accent bar */}
      <Box sx={{ height: rem(3), background: gradients.accentBar }} />

      {/* Header */}
      <Box
        sx={{
          bgcolor: colors.base.white, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: rem(63), px: rem(25), borderBottom: `${rem(1)} solid ${C.line}`, flexShrink: 0,
        }}
      >
        <Box id="pending-redemptions-title" component="h2" sx={{ m: 0, fontFamily: 'inherit', fontSize: rem(16), fontWeight: 700, color: colors.brown[114] }}>
          Pending Partial Redemptions
        </Box>
        <ButtonBase
          aria-label="Close"
          onClick={onClose}
          sx={{ width: rem(30), height: rem(30), borderRadius: '50%', bgcolor: colors.surface.chip, color: colors.brown[294] }}
        >
          <X size="0.875rem" strokeWidth={2.2} />
        </ButtonBase>
      </Box>

      {/* Body */}
      <Box sx={{ px: rem(25), pt: rem(18), pb: rem(25), overflowY: 'auto', [MOBILE]: { px: rem(16), pb: rem(16) } }}>
        {strategy && (
          <Box sx={{ fontSize: rem(12.5), lineHeight: rem(16), color: C.muted, mb: rem(25) }}>
            {strategy.name} · {strategy.code}
          </Box>
        )}

        <Box sx={{ border: `${rem(1)} solid ${C.line}`, borderRadius: rem(14), bgcolor: colors.base.white }}>
          <Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: COLS, alignItems: 'center', minHeight: rem(43), px: rem(17), bgcolor: colors.cream[953], gap: rem(8), [MOBILE]: { gridTemplateColumns: COLS_MOBILE, px: rem(12), gap: rem(6) } }}>
              <Box sx={headCell}>Date</Box>
              <Box sx={headCell}>Redeem Amount</Box>
              <Box sx={headCell}>Status</Box>
            </Box>

            {!rows && !error && (
              <Box sx={{ py: rem(24), textAlign: 'center', fontSize: rem(13), color: C.muted }}>Loading…</Box>
            )}
            {error && (
              <Box sx={{ py: rem(24), textAlign: 'center', fontSize: rem(13), color: colors.status.errorText }}>{error}</Box>
            )}
            {rows?.length === 0 && (
              <Box sx={{ py: rem(24), textAlign: 'center', fontSize: rem(13), color: C.muted }}>
                No pending partial redemptions
              </Box>
            )}
            {rows?.map((r, i) => {
              const st = STATUS[r.status]
              return (
                <Box
                  key={i}
                  sx={{
                    display: 'grid', gridTemplateColumns: COLS, alignItems: 'center', height: rem(54.5), px: rem(17), gap: rem(8),
                    borderTop: `${rem(1)} solid ${C.line}`, fontSize: rem(13.5), color: C.text,
                    [MOBILE]: { gridTemplateColumns: COLS_MOBILE, px: rem(12), gap: rem(6), fontSize: rem(12) },
                  }}
                >
                  <Box>{formatDate(r.date)}</Box>
                  <Box>₹ {formatInr(r.amount)}</Box>
                  <Box>
                    <Box
                      component="span"
                      sx={{
                        display: 'inline-block', height: rem(24), lineHeight: rem(24), px: rem(10), borderRadius: rem(12),
                        bgcolor: st.bg, color: st.color, fontSize: rem(12), fontWeight: 600, whiteSpace: 'nowrap',
                        [MOBILE]: { px: rem(7), fontSize: rem(10.5) },
                      }}
                    >
                      {st.label}
                    </Box>
                  </Box>
                </Box>
              )
            })}
          </Box>
        </Box>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          bgcolor: colors.base.white, display: 'flex', justifyContent: 'flex-end', px: rem(25), py: rem(16.5),
          borderTop: `${rem(1)} solid ${C.line}`, flexShrink: 0, [MOBILE]: { py: rem(14) },
        }}
      >
        <ButtonBase
          onClick={onClose}
          sx={{
            width: rem(100), height: rem(41.5), borderRadius: rem(14), boxSizing: 'border-box',
            border: `${rem(1.5)} solid ${C.maroon}`, color: C.maroon, fontFamily: 'inherit', fontSize: rem(14), fontWeight: 600,
          }}
        >
          Close
        </ButtonBase>
      </Box>
    </Dialog>
  )
}
