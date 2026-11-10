import { Box, ButtonBase } from '@mui/material'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { colors } from '../../theme'
import { rem } from '../../utils/format'
import { r } from '../../utils/responsive'

const btn = { height: rem(24), minWidth: rem(24), borderRadius: rem(7), border: `${rem(1)} solid ${colors.border.default}`, fontFamily: 'inherit', fontSize: rem(12), fontWeight: 700, color: colors.text.secondary, bgcolor: colors.base.white, transition: 'background-color .25s, color .25s, border-color .25s', '&:disabled': { opacity: 0.45 } } as const

/** Right-aligned numbered pager (1-based pages): prev, page buttons, next. */
export default function Pagination({ page, totalPages, onChange, ariaLabel = 'Pages' }: { page: number; totalPages: number; onChange: (p: number) => void; ariaLabel?: string }) {
  return (
    <Box component="nav" aria-label={ariaLabel} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: rem(6), px: r(14, 17), height: rem(48) }}>
      <ButtonBase aria-label="Previous page" disabled={page <= 1} onClick={() => onChange(page - 1)} sx={btn}><ChevronLeft size={rem(13)} /></ButtonBase>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <ButtonBase key={p} aria-label={`Page ${p}`} aria-current={p === page ? 'page' : undefined} onClick={() => onChange(p)} sx={{ ...btn, minWidth: rem(25), height: rem(26), ...(p === page ? { bgcolor: colors.brand.accent, borderColor: colors.brand.accent, color: colors.base.white } : {}) }}>{p}</ButtonBase>
      ))}
      <ButtonBase aria-label="Next page" disabled={page >= totalPages} onClick={() => onChange(page + 1)} sx={btn}><ChevronRight size={rem(13)} /></ButtonBase>
    </Box>
  )
}
