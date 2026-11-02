import { Box } from '@mui/material'
import { colors } from '../../theme'
import { rem as css } from '../../utils/format'
import { R, font, rem } from './ReportsParts'

export interface StepState {
  /** Circle filled + dark title */
  reached: boolean
}

const STEPS = [
  { title: 'Client Selection', sub: 'Select Holder type and DI code' },
  { title: 'Choose Reports', sub: 'Browse and select reports' },
  { title: 'Configure', sub: 'Set criteria or Date Range' },
  { title: 'Generate', sub: 'Download and share' },
]

// Space after each step before the connector, and after the connector before the next step (px)
const GAPS: [number, number][] = [[13, 25], [25, 25], [25, 65]]

interface Props {
  /** Phone layout: circles with the title underneath, no subtitles */
  compact?: boolean
  /** Per step: circle filled + dark title */
  reached: [boolean, boolean, boolean, boolean]
  /** Phone layout only: which circles are filled (step 4 fills as soon as criteria are chosen) */
  circles?: [boolean, boolean, boolean, boolean]
  /** Per connector: maroon when that stage is done */
  lines: [boolean, boolean, boolean]
}

/** Sticky 4-step progress header. */
const fade = { animation: 'rpt-step-fade .35s ease both', '@keyframes rpt-step-fade': { from: { opacity: 0 }, to: { opacity: 1 } }, '@media (prefers-reduced-motion: reduce)': { animation: 'none' } } as const

export default function ReportsStepper({ compact = false, reached, circles = reached, lines }: Props) {
  if (compact) {
    return (
      <Box
        component="nav"
        aria-label="Progress"
        sx={{ position: 'sticky', top: 'var(--reports-sticky-top, 0px)', zIndex: 20, ...fade, bgcolor: colors.surface.page, mx: css(-14), px: css(14), mt: css(14), py: css(10) }}
      >
        <Box component="ol" sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', m: 0, p: 0, listStyle: 'none' }}>
          {STEPS.map((s, i) => {
            const filled = circles[i]
            const dark = reached[i]
            return (
              <Box component="li" key={s.title} aria-current={dark ? 'step' : undefined} sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', pr: i < 3 ? css(18) : 0 }}>
                <Box
                  sx={{
                    width: css(28), height: css(28), borderRadius: '50%', boxSizing: 'border-box', display: 'grid', placeItems: 'center', fontSize: css(12), fontWeight: 600, transition: 'background-color .2s, border-color .2s',
                    bgcolor: filled ? R.maroon : 'transparent', color: filled ? colors.base.white : R.muted, border: `${css(1)} solid ${filled ? R.maroon : colors.sand[755]}`,
                  }}
                >
                  {i + 1}
                </Box>
                <Box sx={{ ...font, mt: css(10), fontSize: css(9.5), fontWeight: 700, lineHeight: css(14), textAlign: 'center', whiteSpace: 'nowrap', color: dark ? R.ink : colors.sand[686], transition: 'color .2s' }}>{s.title}</Box>
                {i < 3 && (
                  <Box aria-hidden sx={{ position: 'absolute', top: css(13), right: css(3.5), width: css(11.5), height: css(2), borderRadius: css(1), bgcolor: lines[i] ? R.maroon : colors.sand[820], transition: 'background-color .2s' }} />
                )}
              </Box>
            )
          })}
        </Box>
      </Box>
    )
  }
  return (
    <Box
      component="nav"
      aria-label="Progress"
      sx={{ position: 'sticky', top: 'var(--reports-sticky-top, 0px)', zIndex: 20, ...fade, bgcolor: colors.surface.page, mx: rem(-16), px: rem(20), mt: rem(16), pt: rem(8), pb: rem(8), overflowX: 'auto', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}
    >
      <Box component="ol" sx={{ display: 'flex', alignItems: 'center', m: 0, p: 0, listStyle: 'none', minWidth: 'max-content' }}>
        {STEPS.map((s, i) => {
          const on = reached[i]
          return (
            <Box component="li" key={s.title} sx={{ display: 'contents' }}>
              <Box aria-current={on ? 'step' : undefined} sx={{ display: 'flex', alignItems: 'center', gap: rem(7), flexShrink: 0 }}>
                <Box
                  sx={{
                    width: rem(25), height: rem(25), borderRadius: '50%', boxSizing: 'border-box', display: 'grid', placeItems: 'center', fontSize: rem(10), fontWeight: 600,
                    transition: 'background-color .2s, border-color .2s, color .2s',
                    bgcolor: on ? R.maroon : 'transparent', color: on ? colors.base.white : R.muted, border: `${rem(1)} solid ${on ? R.maroon : colors.sand[755]}`,
                  }}
                >
                  {i + 1}
                </Box>
                <Box>
                  <Box sx={{ ...font, fontSize: rem(10), fontWeight: 700, lineHeight: rem(16), color: on ? R.ink : colors.sand[755], transition: 'color .2s' }}>{s.title}</Box>
                  <Box sx={{ ...font, mt: rem(4), fontSize: rem(10.1), lineHeight: rem(16), color: on ? R.muted : colors.sand[686], transition: 'color .2s' }}>{s.sub}</Box>
                </Box>
              </Box>
              {i < STEPS.length - 1 && (
                <Box
                  aria-hidden
                  sx={{
                    flexShrink: 0, width: rem(36), height: rem(1.5), mt: rem(-1), ml: rem(GAPS[i][0]), mr: rem(GAPS[i][1]), borderRadius: rem(1),
                    bgcolor: lines[i] ? R.maroon : colors.sand[820], transition: 'background-color .2s',
                  }}
                />
              )}
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}
