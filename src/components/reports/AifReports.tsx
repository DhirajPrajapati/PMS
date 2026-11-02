import { Box, ButtonBase, Collapse, Drawer, useMediaQuery } from '@mui/material'
import { ChevronDown, ChevronUp, Download, Mail, RotateCcw, Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  fetchAifOptions, fetchAifSchemes, generateAifReport,
  type AifCategory, type AifGenerateResponse, type AifOptionsResponse, type AifSchemesResponse, type ApiAifFolio, type ApiAifScheme,
} from '../../api/aifReports'
import { colors } from '../../theme'
import { rem as css } from '../../utils/format'
import ApiResponsePanel from '../common/ApiResponsePanel'
import { glossButton } from '../common/ConfirmDialog'
import Logo from '../common/Logo'
import { Bone } from '../common/Skeleton'
import DateField from './DateField'
import { R, font, goldLabel, rem } from './ReportsParts'
import { SelectField, fieldSx } from './SelectField'

const MOBILE = '(max-width:48rem)'
const FILTERS: (AifCategory | 'All')[] = ['All', 'CAT II', 'CAT III']
/** Shared motion: height eases open/closed, content fades. */
const EASE = 'cubic-bezier(.2,.7,.2,1)'
const fadeIn = {
  animation: `aif-fade .32s ${EASE} both`,
  '@keyframes aif-fade': { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'none' } },
  '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
} as const
const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`

/* ---------- small pieces ---------- */

function CatBadge({ category, compact }: { category: AifCategory; compact: boolean }) {
  const three = category === 'CAT III'
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex', alignItems: 'center', height: compact ? css(20) : rem(20), px: compact ? css(8) : rem(8.5), borderRadius: compact ? css(5) : rem(5), fontFamily: 'inherit',
        fontSize: compact ? css(10.5) : rem(10.5), fontWeight: 700, letterSpacing: '0.05em', whiteSpace: 'nowrap',
        bgcolor: three ? colors.blue[935] : colors.green[931], color: three ? colors.blue[392] : colors.green[394],
      }}
    >
      {category}
    </Box>
  )
}

function Checkbox({ on, size }: { on: boolean; size: string }) {
  return (
    <Box sx={{ width: size, height: size, flexShrink: 0, boxSizing: 'border-box', borderRadius: '28%', display: 'grid', placeItems: 'center', border: `${css(1.5)} solid ${on ? R.maroon : colors.sand[820]}`, bgcolor: on ? R.maroon : 'transparent', transition: 'background-color .15s, border-color .15s' }}>
      <Box component="svg" viewBox="0 0 12 12" sx={{ width: '62%', height: '62%', opacity: on ? 1 : 0, transition: 'opacity .15s' }}>
        <path d="M2.5 6.4l2.3 2.3 4.7-5" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </Box>
    </Box>
  )
}

function ReportTile({ name, on, onToggle, compact }: { name: string; on: boolean; onToggle: () => void; compact: boolean }) {
  return (
    <ButtonBase
      role="radio"
      aria-checked={on}
      onClick={onToggle}
      sx={{
        justifyContent: 'flex-start', gap: compact ? css(10) : rem(10), minHeight: compact ? css(51) : rem(33.5), px: compact ? css(12) : rem(11), py: compact ? css(6) : 0, boxSizing: 'border-box', textAlign: 'left',
        borderRadius: compact ? css(14) : rem(12), border: `${compact ? css(1.5) : rem(1)} solid ${on ? R.maroon : colors.border.default}`, bgcolor: on ? colors.cream[957] : colors.base.white,
        fontFamily: 'inherit', fontSize: compact ? css(12.5) : rem(10.35), lineHeight: 1.25, fontWeight: on ? 700 : 400, color: on ? colors.text.ink : colors.text.secondary,
        transition: `background-color .25s ${EASE}, border-color .25s ${EASE}, transform .15s`, '&:hover': { borderColor: on ? R.maroon : colors.sand[620] }, '&:active': { transform: 'scale(.985)' },
      }}
    >
      <Checkbox on={on} size={compact ? css(16.5) : rem(15)} />
      {name}
    </ButtonBase>
  )
}

function PillButton({ kind, disabled, busy, onClick, icon, children, fullWidth, compact }: { kind: 'outline' | 'solid'; disabled: boolean; busy: boolean; onClick: () => void; icon: React.ReactNode; children: string; fullWidth?: boolean; compact: boolean }) {
  const solid = kind === 'solid'
  return (
    <ButtonBase
      disabled={disabled || busy}
      onClick={onClick}
      sx={{
        height: compact ? css(41) : rem(35), width: fullWidth ? '100%' : solid ? rem(139) : rem(148.5), gap: compact ? css(9) : rem(8), borderRadius: '999px', boxSizing: 'border-box', fontFamily: 'inherit',
        fontSize: compact ? css(13.5) : rem(11.1), fontWeight: 500, whiteSpace: 'nowrap', transition: 'opacity .15s',
        color: disabled ? colors.sand[686] : solid ? colors.base.white : R.maroon,
        border: solid ? 'none' : `${compact ? css(1) : rem(1)} solid ${disabled ? colors.sand[859] : R.maroon}`,
        background: solid ? (disabled ? colors.cream[890] : glossButton) : colors.base.white, opacity: busy ? 0.7 : 1,
        '&.Mui-disabled': { pointerEvents: 'none', color: disabled ? colors.sand[686] : undefined },
      }}
    >
      {icon}
      {children}
    </ButtonBase>
  )
}

/* ---------- report picker (shared by the desktop panel and the phone sheet) ---------- */

interface PickerProps {
  compact: boolean
  options: AifOptionsResponse | null
  reports: string[]
  onToggle: (id: string) => void
  consolidate: string | null
  onConsolidate: (v: string) => void
  from: string
  to: string
  onFrom: (v: string) => void
  onTo: (v: string) => void
  canGenerate: boolean
  busy: AifGenerateResponse | 'email' | 'download' | null
  onGenerate: (d: 'email' | 'download') => void
  status: string | null
}

function ReportPicker({ compact, options, reports, onToggle, consolidate, onConsolidate, from, to, onFrom, onTo, canGenerate, busy, onGenerate, status }: PickerProps) {
  const list = options?.data.reports ?? []
  const needsCriteria = list.some((r) => r.requires_criteria && reports.includes(r.id))
  const divider = { height: compact ? css(1) : rem(1), bgcolor: colors.border.default, my: compact ? css(16) : rem(17) } as const
  const working = busy === 'email' || busy === 'download' ? busy : null
  return (
    <Box>
      {!compact && <Box sx={{ ...font, fontSize: rem(10.5), fontWeight: 600, lineHeight: rem(16), color: colors.text.secondary, mb: rem(14) }}>Select Report</Box>}
      <Box role="radiogroup" aria-label="Select report" sx={{ display: 'grid', gridTemplateColumns: compact ? 'repeat(2, minmax(0, 1fr))' : 'repeat(4, minmax(0, 1fr))', gap: compact ? css(12) : rem(9) }}>
        {options
          ? list.map((r) => <ReportTile key={r.id} name={r.name} on={reports.includes(r.id)} onToggle={() => onToggle(r.id)} compact={compact} />)
          : Array.from({ length: 6 }, (_, i) => <Bone key={i} h={compact ? 51 : 33.5} r={compact ? 14 : 12} />)}
      </Box>

      <Collapse in={needsCriteria && !!options} timeout={380} easing={EASE} unmountOnExit>
        <>
          <Box sx={{ ...divider, mt: compact ? css(24) : rem(21) }} />
          <Box sx={{ ...font, fontSize: compact ? css(12.5) : rem(10.5), fontWeight: 600, lineHeight: rem(16), color: colors.text.secondary, mb: compact ? css(16) : rem(14) }}>Report Criteria</Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: compact ? '1fr' : 'repeat(3, minmax(0, 1fr))', columnGap: rem(11), rowGap: compact ? css(16) : 0 }}>
            <Box sx={{ minWidth: 0 }}>
              <Box sx={{ ...goldLabel, mb: rem(8) }}>Consolidate by</Box>
              <SelectField
                placeholder="Select criteria"
                value={consolidate}
                onChange={onConsolidate}
                valueColor={colors.text.ink}
                groups={[{ options: [{ value: '', label: 'Select criteria' }, ...(options?.data.consolidate_by ?? [])] }]}
              />
            </Box>
            <DateField label="From date" value={from} onChange={onFrom} max={to || undefined} />
            <DateField label="To date" value={to} onChange={onTo} min={from || undefined} />
          </Box>
        </>
      </Collapse>

      <Box sx={{ ...divider, mt: compact ? css(24) : rem(19), mb: compact ? css(18) : rem(14) }} />
      {status && <Box role="status" key={status} sx={{ ...fadeIn, ...font, mb: rem(8), textAlign: compact ? 'center' : 'right', fontSize: compact ? css(12) : rem(10), color: colors.status.positiveText }}>{status}</Box>}
      <Box sx={{ display: 'flex', flexDirection: compact ? 'column' : 'row', justifyContent: 'flex-end', gap: compact ? css(10) : rem(10.5) }}>
        <PillButton kind="outline" fullWidth={compact} compact={compact} disabled={!canGenerate} busy={working === 'email'} onClick={() => onGenerate('email')} icon={<Mail size={compact ? '1.0625rem' : '0.9rem'} strokeWidth={1.6} />}>Download via Email</PillButton>
        <PillButton kind="solid" fullWidth={compact} compact={compact} disabled={!canGenerate} busy={working === 'download'} onClick={() => onGenerate('download')} icon={<Download size={compact ? '1.0625rem' : '0.9rem'} strokeWidth={1.6} />}>Direct Download</PillButton>
      </Box>
    </Box>
  )
}

/* ---------- details (holders / broker / value) ---------- */

function FolioDetails({ folio, compact }: { folio: ApiAifFolio; compact: boolean }) {
  const label = { ...font, fontSize: compact ? css(13) : rem(10.2), lineHeight: compact ? css(20) : rem(16), color: R.gold } as const
  const value = { ...font, fontSize: compact ? css(13.5) : rem(10.3), lineHeight: compact ? css(21) : rem(16.5), color: colors.text.secondary } as const
  return (
    <Box sx={{ display: 'grid', gap: compact ? css(17) : rem(17) }}>
      <Box>
        <Box sx={{ ...label, mb: compact ? css(6) : rem(7) }}>Holder(s)</Box>
        {folio.holders.map((h) => <Box key={h} sx={value}>{h}</Box>)}
      </Box>
      <Box>
        <Box sx={{ ...label, mb: compact ? css(6) : rem(7) }}>Broker</Box>
        <Box sx={{ ...value, fontWeight: 700 }}>{folio.broker}</Box>
      </Box>
      <Box>
        <Box sx={{ ...label, mb: compact ? css(6) : rem(7) }}>Current Value</Box>
        <Box sx={{ ...font, fontSize: compact ? css(16) : rem(13.5), fontWeight: 700, lineHeight: compact ? css(22) : rem(18), color: colors.text.ink }}>{inr(folio.current_value)}</Box>
      </Box>
    </Box>
  )
}

/* ---------- main view ---------- */

export default function AifReports() {
  const isMobile = useMediaQuery(MOBILE)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<AifCategory | 'All'>('All')
  const [schemesRes, setSchemesRes] = useState<AifSchemesResponse | null>(null)
  const [optionsRes, setOptionsRes] = useState<AifOptionsResponse | null>(null)
  const [sel, setSel] = useState<{ schemeId: string; folio: string } | null>(null)
  const [reports, setReports] = useState<string[]>([])
  const [consolidate, setConsolidate] = useState<string | null>(null)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [lastSel, setLastSel] = useState<{ schemeId: string; folio: string } | null>(null)
  const [sheet, setSheet] = useState(false)
  const [busy, setBusy] = useState<'email' | 'download' | null>(null)
  const [generated, setGenerated] = useState<AifGenerateResponse | null>(null)
  const [showResponses, setShowResponses] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchAifOptions().then((r) => !cancelled && setOptionsRes(r))
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    fetchAifSchemes({ search, category }).then((r) => !cancelled && setSchemesRes(r))
    return () => {
      cancelled = true
    }
  }, [search, category])

  const schemes = schemesRes?.data.schemes ?? []
  const shown = sel ?? lastSel
  const selFolio = schemes.find((s) => s.id === shown?.schemeId)?.folios.find((f) => f.folio_no === shown?.folio)

  const clearPicks = () => {
    setReports([])
    setConsolidate(null)
    setFrom('')
    setTo('')
    setGenerated(null)
  }
  const pickFolio = (scheme: ApiAifScheme, folio: string | null) => {
    clearPicks()
    setSheet(false)
    const next = folio ? { schemeId: scheme.id, folio } : null
    if (next) setLastSel(next)
    setSel(next)
  }
  /** One report at a time: picking another replaces it, picking the same one clears it. */
  const toggleReport = (id: string) => setReports((r) => (r.includes(id) ? [] : [id]))

  const list = optionsRes?.data.reports ?? []
  const needsCriteria = list.some((r) => r.requires_criteria && reports.includes(r.id))
  const datesOk = !!from && !!to && from <= to
  const canGenerate = reports.length > 0 && (!needsCriteria || (!!consolidate && datesOk))

  const run = (delivery: 'email' | 'download') => {
    if (!sel) return
    setBusy(delivery)
    generateAifReport({
      scheme_id: sel.schemeId, folio_no: sel.folio, report_ids: reports, delivery,
      ...(needsCriteria ? { criteria: { consolidate_by: consolidate ?? '', from_date: from, to_date: to } } : {}),
    })
      .then(setGenerated)
      .finally(() => setBusy(null))
  }

  const picker = (compact: boolean) => (
    <ReportPicker
      compact={compact} options={optionsRes} reports={reports} onToggle={toggleReport} consolidate={consolidate} onConsolidate={(v) => setConsolidate(v || null)}
      from={from} to={to} onFrom={setFrom} onTo={setTo} canGenerate={canGenerate} busy={busy} onGenerate={run} status={generated?.message ?? null}
    />
  )

  const folioLabelSx = { fontFamily: 'inherit', fontWeight: 700 } as const

  return (
    <Box sx={{ ...fadeIn, mt: { xs: css(22), md: rem(14) } }}>
      {/* Search + category filter */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'stretch', md: 'center' }, gap: { xs: css(14), md: rem(11.5) } }}>
        <Box sx={{ position: 'relative', width: { xs: '100%', md: rem(275) } }}>
          <Box sx={{ position: 'absolute', left: { xs: css(16), md: rem(15) }, top: '50%', transform: 'translateY(-50%)', display: 'flex', color: colors.text.mutedWarm }}>
            <Search size="1.0625rem" strokeWidth={1.6} />
          </Box>
          <Box
            component="input"
            type="search"
            aria-label="Search by scheme name, folio name"
            placeholder="Search by scheme name, folio name..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            sx={{
              ...fieldSx, display: 'block', height: { xs: css(37), md: rem(33) }, pl: { xs: css(44), md: rem(40) }, pr: rem(12), borderRadius: { xs: css(18.5), md: rem(16.5) }, outline: 'none',
              color: colors.text.body, fontSize: { xs: css(13), md: rem(10.9) }, '&::placeholder': { color: colors.sand[686], opacity: 1 }, '&:focus': { borderColor: R.maroon },
              '&::-webkit-search-cancel-button': { display: 'none' },
            }}
          />
        </Box>
        <Box role="radiogroup" aria-label="Category" sx={{ display: 'flex', overflow: 'hidden', border: `${rem(1)} solid ${colors.sand[859]}`, borderRadius: { xs: css(18.5), md: rem(16.5) }, bgcolor: colors.base.white, height: { xs: css(37.5), md: rem(33) }, boxSizing: 'border-box', width: { xs: '100%', md: 'auto' } }}>
          {FILTERS.map((f, i) => {
            const on = category === f
            return (
              <ButtonBase
                key={f}
                role="radio"
                aria-checked={on}
                onClick={() => setCategory(f)}
                sx={{
                  flex: { xs: 1, md: 'none' }, minWidth: { md: rem(f === 'All' ? 42 : f === 'CAT II' ? 58.5 : 62) }, px: { md: rem(12) }, fontFamily: 'inherit', fontSize: { xs: css(13), md: rem(10.9) }, fontWeight: on ? 700 : 500,
                  color: on ? colors.base.white : colors.text.secondary, bgcolor: on ? R.maroon : colors.base.white, borderLeft: i && !on && category !== FILTERS[i - 1] ? `${rem(1)} solid ${colors.border.default}` : 'none',
                  transition: 'background-color .15s, color .15s',
                }}
              >
                {f}
              </ButtonBase>
            )
          })}
        </Box>
      </Box>

      {/* Scheme cards */}
      <Box sx={{ mt: { xs: css(25), md: rem(16) }, display: 'grid', gap: { xs: css(13), md: rem(11) } }}>
        {!schemesRes &&
          Array.from({ length: 3 }, (_, i) => <Bone key={i} h={isMobile ? 138 : 114.5} r={isMobile ? 20 : 18} />)}
        {schemesRes && schemes.length === 0 && (
          <Box sx={{ ...font, py: rem(40), textAlign: 'center', fontSize: rem(11), color: colors.text.mutedWarm }}>No schemes match your search.</Box>
        )}
        {schemes.map((s) => {
          const open = sel?.schemeId === s.id
          return (
            <Box
              key={s.id}
              sx={{ ...fadeIn, bgcolor: colors.base.white, border: `${isMobile ? css(1.5) : rem(open ? 1.5 : 1)} solid ${open ? R.maroon : colors.border.default}`, borderRadius: { xs: css(20), md: rem(19) }, overflow: 'hidden', transition: `border-color .3s ${EASE}, box-shadow .3s ${EASE}`, boxShadow: open ? '0 0.5rem 1.5rem rgba(138,31,32,.08)' : 'none' }}
            >
              <Box sx={{ px: { xs: css(16), md: rem(19) }, pt: { xs: css(18), md: rem(15.5) }, pb: { xs: css(18), md: rem(15.5) } }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: rem(8) }}>
                  <Box sx={{ minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: css(8), md: rem(9) }, height: { xs: css(20), md: rem(16) } }}>
                      <Logo size={isMobile ? '0.8125rem' : rem(8.5)} />
                      <Box sx={{ ...font, fontSize: { xs: css(10.5), md: rem(9.8) }, letterSpacing: '0.06em', color: colors.text.mutedWarm }}>{s.provider}</Box>
                    </Box>
                    <Box component="h3" sx={{ ...font, mt: { xs: css(6), md: rem(4.5) }, fontSize: { xs: css(16), md: rem(15) }, fontWeight: 600, lineHeight: { xs: css(24), md: rem(22) }, color: colors.text.ink }}>{s.name}</Box>
                  </Box>
                  <CatBadge category={s.category} compact={isMobile} />
                </Box>

                {isMobile ? (
                  <Box sx={{ mt: css(13), display: 'flex', alignItems: 'center', gap: css(12) }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <SelectField
                        prefix="Folio:"
                        placeholder="Select folio"
                        value={open ? sel!.folio : null}
                        onChange={(v) => pickFolio(s, v)}
                        valueColor={R.maroon}
                        groups={[{ options: s.folios.map((f) => ({ value: f.folio_no, label: f.folio_no })) }]}
                      />
                    </Box>
                    <ButtonBase
                      aria-label="Reset folio"
                      disabled={!open}
                      onClick={() => pickFolio(s, null)}
                      sx={{ width: css(38), height: css(38), borderRadius: css(12), flexShrink: 0, color: open ? R.maroon : colors.text.mutedWarm, bgcolor: open ? colors.cream[957] : 'transparent', transition: 'background-color .15s', '&.Mui-disabled': { color: colors.sand[755] } }}
                    >
                      <RotateCcw size="1.125rem" strokeWidth={1.6} />
                    </ButtonBase>
                  </Box>
                ) : (
                  <Box sx={{ mt: rem(13), display: 'flex', flexWrap: 'wrap', gap: rem(7) }}>
                    {s.folios.map((f) => {
                      const on = open && sel!.folio === f.folio_no
                      return (
                        <ButtonBase
                          key={f.folio_no}
                          aria-expanded={on}
                          onClick={() => pickFolio(s, on ? null : f.folio_no)}
                          sx={{
                            height: rem(32.5), gap: rem(9), px: rem(11), borderRadius: rem(11), boxSizing: 'border-box', ...folioLabelSx, fontSize: rem(10), color: on ? R.maroon : colors.gold.deep,
                            bgcolor: colors.cream[972], border: `${rem(1)} solid ${colors.sand[859]}`, transition: 'color .15s, border-color .15s', '&:hover': { borderColor: colors.sand[620] },
                          }}
                        >
                          Folio No: {f.folio_no}
                          {on ? <ChevronUp size="0.875rem" strokeWidth={1.7} /> : <ChevronDown size="0.875rem" strokeWidth={1.7} />}
                        </ButtonBase>
                      )
                    })}
                  </Box>
                )}
              </Box>

              <Collapse in={open} timeout={380} easing={EASE} unmountOnExit>
              {shown?.schemeId === s.id && selFolio && (
                isMobile ? (
                  <Box sx={{ borderTop: `${css(1)} solid ${colors.border.default}`, px: css(16), py: css(25) }}>
                    <Box sx={{ border: `${css(1)} solid ${colors.border.default}`, borderRadius: css(16), px: css(24), py: css(24) }}>
                      <FolioDetails folio={selFolio} compact />
                    </Box>
                    <ButtonBase onClick={() => setSheet(true)} sx={{ mt: css(25), width: '100%', height: css(41), borderRadius: '999px', background: glossButton, color: colors.base.white, fontFamily: 'inherit', fontSize: css(13.5), fontWeight: 500 }}>
                      Select report
                    </ButtonBase>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', borderTop: `${rem(1)} solid ${colors.border.default}`}}>
                    <Box sx={{ width: rem(170), flexShrink: 0, boxSizing: 'border-box', px: rem(14.5), pt: rem(19), pb: rem(18), bgcolor: colors.cream[975], borderRight: `${rem(1)} solid ${colors.border.default}` }}>
                      <FolioDetails folio={selFolio} compact={false} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0, px: rem(19.5), pt: rem(19), pb: rem(18) }}>{picker(false)}</Box>
                  </Box>
                )
              )}
              </Collapse>
            </Box>
          )
        })}
      </Box>

      {/* Phone: report sheet */}
      <Drawer
        anchor="bottom"
        open={isMobile && sheet && !!selFolio}
        onClose={() => setSheet(false)}
        slotProps={{
          backdrop: { sx: { bgcolor: 'rgba(30,22,18,.55)' } },
          paper: { sx: { borderTopLeftRadius: css(24), borderTopRightRadius: css(24), maxHeight: '92%', bgcolor: colors.base.white, backgroundImage: 'none', fontFamily: 'inherit' } },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', px: css(15), pt: css(24), pb: css(14), borderBottom: `${css(1)} solid ${colors.border.default}`, flexShrink: 0 }}>
          <Box>
            <Box component="h2" sx={{ ...font, fontSize: css(16.5), fontWeight: 700, lineHeight: css(24), color: colors.text.ink }}>Select report</Box>
            <Box sx={{ ...font, mt: css(3), fontSize: css(11), lineHeight: css(16), color: colors.text.mutedWarm }}>Folio {sel?.folio}</Box>
          </Box>
          <ButtonBase aria-label="Close" onClick={() => setSheet(false)} sx={{ color: colors.text.secondary, p: css(4), borderRadius: '50%' }}>
            <X size="1.375rem" strokeWidth={1.5} />
          </ButtonBase>
        </Box>
        <Box sx={{ overflowY: 'auto', px: css(19), pt: css(20), pb: css(22) }}>{picker(true)}</Box>
      </Drawer>

      {/* API responses */}
      <Box sx={{ mt: rem(32) }}>
        <ButtonBase
          role="switch"
          aria-checked={showResponses}
          onClick={() => setShowResponses((v) => !v)}
          sx={{ gap: rem(8), height: rem(26), px: rem(10), borderRadius: rem(13), border: `${rem(1)} solid ${R.line}`, bgcolor: colors.base.white, fontFamily: 'inherit', fontSize: rem(9.7), color: colors.text.body }}
        >
          <Box sx={{ position: 'relative', width: rem(26), height: rem(14), borderRadius: rem(7), bgcolor: showResponses ? colors.brand.primary : colors.sand[820], transition: 'background-color .2s' }}>
            <Box sx={{ position: 'absolute', top: rem(2), left: rem(2), width: rem(10), height: rem(10), borderRadius: '50%', bgcolor: colors.base.white, transform: showResponses ? 'translateX(0.75rem)' : 'none', transition: 'transform .2s' }} />
          </Box>
          API responses
        </ButtonBase>
        {showResponses && (
          <Box sx={{ mt: rem(12), display: 'grid', gap: rem(10), gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 26rem), 1fr))' }}>
            <ApiResponsePanel endpoint={`GET /api/aif/report-schemes?search=${encodeURIComponent(search)}&category=${category === 'All' ? '' : category}`} data={schemesRes ?? undefined} maxHeight={rem(340)} />
            <ApiResponsePanel endpoint="GET /api/aif/report-options" data={optionsRes ?? undefined} maxHeight={rem(340)} />
            {sel && reports.length > 0 && (
              <ApiResponsePanel
                label="Request body"
                endpoint="POST /api/aif/reports/generate"
                data={{
                  scheme_id: sel.schemeId, folio_no: sel.folio, report_ids: reports,
                  ...(needsCriteria ? { criteria: { consolidate_by: consolidate, from_date: from, to_date: to } } : {}),
                  delivery: 'email | download',
                }}
                maxHeight={rem(340)}
              />
            )}
            {generated && <ApiResponsePanel label="Response" endpoint="POST /api/aif/reports/generate" data={generated} maxHeight={rem(340)} />}
          </Box>
        )}
      </Box>
    </Box>
  )
}
