import { Box } from '@mui/material'
import { createContext, useContext, type ReactNode } from 'react'
import { rem } from '../../utils/format'
import ApiResponsePanel from './ApiResponsePanel'
import { colors } from '../../theme'

/** Whether the API response panels are shown (toggled from the page header). */
export const ResponsesVisibleContext = createContext(true)

export interface SectionResponse {
  endpoint: string
  data?: unknown
  label?: string
}

interface Props {
  index: number
  title: string
  subtitle?: string
  responses?: SectionResponse[]
  /** The UI this section renders; omit for response-only sections */
  children?: ReactNode
}

const STACK = '@media (max-width:75rem)'

/**
 * Numbered page section. On wide screens the UI sits on the left and its mock API
 * response(s) stick to the right; on narrower screens the responses move below the UI.
 */
export default function PageSection({ index, title, subtitle, responses = [], children }: Props) {
  const visible = useContext(ResponsesVisibleContext) && responses.length > 0
  const hasUi = children !== undefined && children !== null
  const side = visible && hasUi

  return (
    <Box component="section" aria-label={title} sx={{ mb: rem(44) }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: rem(12), px: rem(14), pt: rem(8), mb: rem(4) }}>
        <Box sx={{ width: rem(28), height: rem(28), borderRadius: '50%', bgcolor: colors.brand.primary, color: colors.base.white, display: 'grid', placeItems: 'center', fontSize: rem(12), fontWeight: 800, flexShrink: 0 }}>
          {index}
        </Box>
        <Box>
          <Box component="h2" sx={{ m: 0, fontSize: rem(18), fontWeight: 800, color: colors.text.strong, lineHeight: 1.2 }}>{title}</Box>
          {subtitle && <Box sx={{ mt: rem(2), fontSize: rem(12), color: colors.text.faint }}>{subtitle}</Box>}
        </Box>
      </Box>

      <Box
        sx={{
          display: 'grid', alignItems: 'start', columnGap: rem(8),
          gridTemplateColumns: side ? 'minmax(0, 1fr) minmax(0, 26rem)' : 'minmax(0, 1fr)',
          [STACK]: { gridTemplateColumns: 'minmax(0, 1fr)' },
        }}
      >
        {hasUi && <Box sx={{ minWidth: 0 }}>{children}</Box>}
        {visible && (
          <Box
            sx={{
              minWidth: 0, display: 'grid', gap: rem(10), p: `${rem(12)} ${rem(14)} 0`, alignContent: 'start',
              ...(side
                ? { position: 'sticky', top: rem(12), maxHeight: `calc(100vh - ${rem(24)})`, overflowY: 'auto', [STACK]: { position: 'static', maxHeight: 'none', pt: rem(8) } }
                : { gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 26rem), 1fr))' }),
            }}
          >
            {responses.map((r) => (
              <ApiResponsePanel key={r.endpoint + (r.label ?? '')} {...r} maxHeight={side ? 'calc(100vh - 9rem)' : rem(340)} />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  )
}
