import { Box, ButtonBase, useMediaQuery } from '@mui/material'
import { FileText } from 'lucide-react'
import { useEffect, useState } from 'react'
import { fetchAdvancedOptions, type AdvancedOptionsResponse, type ApiAdvancedSection } from '../../api/reports'
import { rem as css } from '../../utils/format'
import { colors } from '../../theme'
import { glossButton } from '../common/ConfirmDialog'
import DialogShell from '../common/DialogShell'
import { Bone } from '../common/Skeleton'
import { R, font, rem } from './ReportsParts'
import { SelectField } from './SelectField'

const MOBILE = '(max-width:48rem)'
const BROWN = colors.text.secondary

interface Props {
  open: boolean
  reportId: string | null
  /** Values the user applied earlier for this report (section id -> option value) */
  applied: Record<string, string> | undefined
  onClose: () => void
  onApply: (values: Record<string, string>) => void
  /** Reports the mock API response so the page can show it */
  onLoaded?: (res: AdvancedOptionsResponse) => void
}

const defaultsOf = (sections: ApiAdvancedSection[]) => Object.fromEntries(sections.map((s) => [s.id, s.default_value]))

function RadioDot({ on, size }: { on: boolean; size: string }) {
  return (
    <Box sx={{ width: size, height: size, flexShrink: 0, borderRadius: '50%', boxSizing: 'border-box', display: 'grid', placeItems: 'center', border: `${css(1.5)} solid ${on ? R.maroon : colors.sand[820]}`, transition: 'border-color .15s' }}>
      <Box sx={{ width: '48%', height: '48%', borderRadius: '50%', bgcolor: R.maroon, transform: on ? 'scale(1)' : 'scale(0)', transition: 'transform .18s ease' }} />
    </Box>
  )
}

/** "Advanced Options" modal: a section list on the left (a dropdown on phones) and radio choices for the active section. */
export default function AdvancedOptionsDialog({ open, reportId, applied, onClose, onApply, onLoaded }: Props) {
  const isMobile = useMediaQuery(MOBILE)
  const [res, setRes] = useState<AdvancedOptionsResponse | null>(null)
  const [draft, setDraft] = useState<Record<string, string>>({})
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    if (!open || !reportId) return
    let cancelled = false
    fetchAdvancedOptions(reportId).then((r) => {
      if (cancelled) return
      setRes(r)
      onLoaded?.(r)
      setDraft({ ...defaultsOf(r.data.sections), ...applied })
      setActiveId(r.data.sections[0]?.id ?? '')
    })
    return () => {
      cancelled = true
    }
    // `applied` is read once when the dialog opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, reportId])

  const sections = res?.data.report_id === reportId ? res.data.sections : []
  const loading = sections.length === 0
  const active = sections.find((s) => s.id === activeId) ?? sections[0]
  const labelOf = (s: ApiAdvancedSection) => s.options.find((o) => o.value === draft[s.id])?.label ?? ''

  const optionsFor = (s: ApiAdvancedSection) => (
    <Box role="radiogroup" aria-label={s.title} sx={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))', columnGap: css(isMobile ? 0 : 7), rowGap: css(isMobile ? 4 : 8.6), mt: css(isMobile ? 12 : 19) }}>
      {s.options.map((o) => {
        const on = draft[s.id] === o.value
        return (
          <ButtonBase
            key={o.value}
            role="radio"
            aria-checked={on}
            onClick={() => setDraft((d) => ({ ...d, [s.id]: o.value }))}
            sx={{
              justifyContent: 'flex-start', gap: css(isMobile ? 10 : 12), height: css(isMobile ? 34 : 43.4), px: css(isMobile ? 10 : 14), borderRadius: css(isMobile ? 12 : 14),
              fontFamily: 'inherit', fontSize: css(isMobile ? 12.5 : 12), fontWeight: 400, color: BROWN, textAlign: 'left', bgcolor: on ? colors.cream[957] : 'transparent', transition: 'background-color .15s',
              '&:hover': { bgcolor: on ? colors.cream[957] : colors.surface.tableHead },
            }}
          >
            <RadioDot on={on} size={css(16.5)} />
            {o.label}
          </ButtonBase>
        )
      })}
    </Box>
  )

  const panel = active && (
    <Box key={active.id} sx={{ animation: 'adv-fade .28s cubic-bezier(.2,.7,.2,1) both', '@keyframes adv-fade': { from: { opacity: 0, transform: 'translateY(6px)' }, to: { opacity: 1, transform: 'none' } }, '@media (prefers-reduced-motion: reduce)': { animation: 'none' } }}>
      <Box component="h3" sx={{ ...font, fontSize: css(isMobile ? 14 : 15), fontWeight: 700, lineHeight: css(isMobile ? 22 : 24), color: R.ink }}>{active.title}</Box>
      <Box sx={{ ...font, mt: css(isMobile ? 3 : 4), fontSize: css(isMobile ? 11 : 12), lineHeight: css(16), color: colors.text.mutedWarm }}>Choose one option below</Box>
      {optionsFor(active)}
    </Box>
  )

  const footer = (
    <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: css(12) }}>
      <ButtonBase
        disabled={loading}
        onClick={() => setDraft(defaultsOf(sections))}
        sx={{ fontFamily: 'inherit', fontSize: css(12), color: colors.text.muted, borderRadius: css(6), '&:hover': { color: R.maroon } }}
      >
        Reset to defaults
      </ButtonBase>
      <Box sx={{ display: 'flex', gap: css(isMobile ? 9 : 14) }}>
        <ButtonBase onClick={onClose} sx={{ height: css(36), minWidth: css(isMobile ? 76 : 76), px: css(14), borderRadius: '999px', boxSizing: 'border-box', border: `${css(1)} solid ${colors.sand[859]}`, fontFamily: 'inherit', fontSize: css(12.5), fontWeight: 500, color: BROWN, bgcolor: colors.base.white }}>
          Cancel
        </ButtonBase>
        <ButtonBase
          disabled={loading}
          onClick={() => onApply(draft)}
          sx={{ height: css(36), minWidth: css(84), px: css(14), borderRadius: '999px', fontFamily: 'inherit', fontSize: css(12.5), fontWeight: 500, color: colors.base.white, background: glossButton, '&.Mui-disabled': { opacity: 0.5, color: colors.base.white } }}
        >
          Apply
        </ButtonBase>
      </Box>
    </Box>
  )

  return (
    <DialogShell
      open={open}
      onClose={onClose}
      titleId="adv-title"
      title="Advanced Options"
      subtitle="Applied to the selected report"
      headerHeight={60}
      width={820}
      height={isMobile ? undefined : 640}
      icon={
        <Box sx={{ width: css(34), height: css(34), flexShrink: 0, borderRadius: css(11), display: 'grid', placeItems: 'center', bgcolor: R.maroon, color: colors.base.white }}>
          <FileText size="1.0625rem" strokeWidth={1.7} />
        </Box>
      }
      footer={footer}
    >
      {isMobile ? (
        <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: css(15), pt: css(15), pb: css(16) }}>
          {loading ? (
            <Bone h={41} r={21} />
          ) : (
            <>
              <SelectField
                placeholder="Select option group"
                value={active?.id ?? null}
                onChange={setActiveId}
                valueColor={colors.brown[294]}
                groups={[{ options: sections.map((s) => ({ value: s.id, label: s.title })) }]}
              />
              <Box sx={{ mt: css(23) }}>{panel}</Box>
            </>
          )}
        </Box>
      ) : (
        <Box sx={{ flex: 1, minHeight: 0, display: 'flex' }}>
          <Box component="nav" aria-label="Option groups" sx={{ width: css(220), flexShrink: 0, overflowY: 'auto', bgcolor: colors.cream[975] }}>
            {loading
              ? Array.from({ length: 7 }, (_, i) => (
                  <Box key={i} sx={{ height: css(83.4), px: css(20.6), pt: css(25), display: 'grid', gap: rem(10), alignContent: 'start' }}>
                    <Bone w={100} h={12} />
                    <Bone w={60} h={10} />
                  </Box>
                ))
              : sections.map((s) => {
                  const on = s.id === active?.id
                  return (
                    <ButtonBase
                      key={s.id}
                      onClick={() => setActiveId(s.id)}
                      aria-current={on ? 'true' : undefined}
                      sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', width: '100%', p: `${css(14)} ${css(18)}`, textAlign: 'left', bgcolor: on ? colors.cream[957] : 'transparent', transition: 'background-color .15s', '&:hover': { bgcolor: colors.cream[957] } }}
                    >
                      <Box sx={{ ...font, fontSize: css(12), fontWeight: 700, lineHeight: css(18), color: on ? R.maroon : R.ink, transition: 'color .15s' }}>{s.title}</Box>
                      <Box sx={{ ...font, mt: css(8.5), fontSize: css(12), lineHeight: css(18), color: colors.text.mutedWarm }}>{labelOf(s)}</Box>
                    </ButtonBase>
                  )
                })}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0, overflowY: 'auto', bgcolor: colors.base.white, px: css(28), pt: css(28), pb: css(24) }}>{loading ? <Bone w={160} h={18} /> : panel}</Box>
        </Box>
      )}

    </DialogShell>
  )
}
