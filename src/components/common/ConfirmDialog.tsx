import { Box, ButtonBase } from '@mui/material'
import { TriangleAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import { colors } from '../../theme'
import { rem } from '../../utils/format'
import DialogShell from './DialogShell'

/** Maroon pill with the soft diagonal sheen used on primary dialog buttons. */
export const glossButton = `linear-gradient(105deg, transparent 28%, rgba(255,255,255,.2) 44%, transparent 60%), linear-gradient(135deg, ${colors.brand.wine}, ${colors.brand.wineDeep})`

interface Props {
  open: boolean
  title: string
  message: ReactNode
  cancelLabel: string
  confirmLabel: string
  onCancel: () => void
  onConfirm: () => void
  /** Leading header icon (a gold warning triangle by default) */
  icon?: ReactNode
}

/** Confirmation built on the shared DialogShell: title row, message, "cancel" text action and a maroon "confirm" pill. */
export default function ConfirmDialog({ open, title, message, cancelLabel, confirmLabel, onCancel, onConfirm, icon }: Props) {
  return (
    <DialogShell
      open={open}
      onClose={onCancel}
      titleId="confirm-title"
      title={title}
      width={460}
      headerHeight={52}
      icon={<Box sx={{ display: 'flex', color: colors.gold.base, flexShrink: 0 }}>{icon ?? <TriangleAlert size="1.125rem" strokeWidth={1.7} />}</Box>}
      footer={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: rem(10) }}>
          <ButtonBase onClick={onCancel} sx={{ height: rem(36), px: rem(14), borderRadius: '999px', fontFamily: 'inherit', fontSize: rem(12.5), fontWeight: 500, color: colors.text.muted }}>
            {cancelLabel}
          </ButtonBase>
          <ButtonBase onClick={onConfirm} sx={{ height: rem(36), px: rem(20), borderRadius: '999px', fontFamily: 'inherit', fontSize: rem(12.5), fontWeight: 500, color: colors.base.white, background: glossButton }}>
            {confirmLabel}
          </ButtonBase>
        </Box>
      }
    >
      <Box id="confirm-desc" sx={{ px: rem(20), py: rem(20), bgcolor: colors.base.white, fontSize: rem(12.5), lineHeight: rem(21), color: colors.text.muted }}>
        {message}
      </Box>
    </DialogShell>
  )
}
