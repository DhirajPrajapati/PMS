import { Box, ButtonBase, Dialog } from '@mui/material'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { colors, gradients, overlays, shadows } from '../../theme'
import { rem } from '../../utils/format'

interface Props {
  open: boolean
  onClose: () => void
  titleId: string
  title: string
  /** Optional line under the title */
  subtitle?: string
  /** Leading header icon (defaults to nothing) */
  icon?: ReactNode
  /** Paper width in rem px; capped to the viewport */
  width?: number
  /** Fixed paper height in rem px (capped to the viewport); omit to size to content */
  height?: number
  headerHeight?: number
  children: ReactNode
  footer?: ReactNode
}

/** The shared dialog frame used by "Tentative RD File": accent bar, white header with chip close button, white footer. */
export default function DialogShell({ open, onClose, titleId, title, subtitle, icon, width = 576, height, headerHeight = 49, children, footer }: Props) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby={titleId}
      slotProps={{
        backdrop: { sx: { bgcolor: overlays.backdrop, backdropFilter: 'blur(3px)' } },
        paper: {
          sx: {
            width: rem(width), maxWidth: `calc(100% - ${rem(32)})`, maxHeight: `calc(100% - ${rem(32)})`, m: 0,
            ...(height ? { height: rem(height) } : {}),
            borderRadius: rem(20), overflow: 'hidden', bgcolor: colors.surface.dialog, fontFamily: 'inherit', boxShadow: shadows.dialog,
          },
        },
      }}
    >
      <Box sx={{ height: rem(3), flexShrink: 0, background: gradients.accentBar }} />

      <Box
        sx={{
          bgcolor: colors.base.white, display: 'flex', alignItems: 'center', gap: rem(10), height: rem(headerHeight), px: rem(20),
          borderBottom: `${rem(1)} solid ${colors.border.default}`, flexShrink: 0,
        }}
      >
        {icon}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box id={titleId} component="h2" sx={{ m: 0, fontFamily: 'inherit', fontSize: rem(13.5), fontWeight: 700, color: colors.brown[114] }}>
            {title}
          </Box>
          {subtitle && <Box sx={{ fontSize: rem(10.5), lineHeight: rem(14), color: colors.text.muted }}>{subtitle}</Box>}
        </Box>
        <ButtonBase
          aria-label="Close"
          onClick={onClose}
          sx={{ width: rem(24), height: rem(24), borderRadius: '50%', bgcolor: colors.surface.chip, color: colors.brown[294] }}
        >
          <X size="0.75rem" strokeWidth={2.2} />
        </ButtonBase>
      </Box>

      {children}

      {footer && (
        <Box
          sx={{
            bgcolor: colors.base.white, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', px: rem(20), py: rem(13),
            borderTop: `${rem(1)} solid ${colors.border.default}`, flexShrink: 0,
          }}
        >
          {footer}
        </Box>
      )}
    </Dialog>
  )
}
