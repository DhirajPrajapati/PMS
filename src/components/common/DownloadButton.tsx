import { ButtonBase } from '@mui/material'
import { Download } from 'lucide-react'
import { colors } from '../../theme'
import { perfPalette as P } from '../../theme/pms'
import { rem } from '../../utils/format'
import { r } from '../../utils/responsive'

/** Tinted "Download" pill for panel headers. */
export default function DownloadButton({ ariaLabel = 'Download', label = 'Download', onClick }: { ariaLabel?: string; label?: string; onClick?: () => void }) {
  return (
    <ButtonBase aria-label={ariaLabel} onClick={onClick} sx={{ height: rem(29), px: rem(14), gap: rem(7), borderRadius: rem(10), bgcolor: P.tone.maroon[2], color: colors.brand.accent, fontFamily: 'inherit', fontSize: r(12.2, 11), fontWeight: 700, flexShrink: 0 }}>
      <Download size={rem(13)} />
      {label}
    </ButtonBase>
  )
}
