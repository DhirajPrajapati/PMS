import { Box, ButtonBase, useMediaQuery } from '@mui/material'
import { ChevronLeft, ChevronRight, Download, FileText, Mail, X } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import {
  fetchCatalog, fetchDiCodes, fetchHolders, generateReport,
  type AdvancedOptionsResponse, type ApiHolder, type ApiReport, type CatalogResponse, type DeliveryMode, type DiCodesResponse, type GenerateResponse, type HoldersResponse, type Product,
} from '../../api/reports'
import { colors, gradients } from '../../theme'
import ApiResponsePanel from '../common/ApiResponsePanel'
import { rem as css } from '../../utils/format'
import { Bone } from '../common/Skeleton'
import { Chip, R, SectionCard, font, goldLabel, rem } from './ReportsParts'
import { SelectField } from './SelectField'
import ReportsStepper from './ReportsStepper'
import AdvancedOptionsDialog from './AdvancedOptionsDialog'
import DateField from './DateField'
import AifReports from './AifReports'
import ConfirmDialog from '../common/ConfirmDialog'


/** Scroll a newly revealed section into view (not on first render). */
function useRevealScroll(shown: boolean, ref: RefObject<HTMLElement | null>) {
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    if (!shown) return
    const t = window.setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 90)
    return () => window.clearTimeout(t)
  }, [shown, ref])
}

function ProductToggle({ value, onChange }: { value: Product; onChange: (p: Product) => void }) {
  return (
    <Box role="radiogroup" aria-label="Product" sx={{ display: 'flex', p: css(4), gap: 0, borderRadius: '14px', bgcolor: colors.cream[914], boxShadow: 'inset 0 0.0625rem 0.1875rem rgba(90,60,40,.10)' }}>
      {(['PMS', 'AIF'] as const).map((p) => {
        const on = value === p
        return (
          <ButtonBase
            key={p}
            role="radio"
            aria-checked={on}
            onClick={() => onChange(p)}
            sx={{
              height: css(36), minWidth: css(p === 'PMS' ? 72 : 61), px: css(14), borderRadius: '13px', fontFamily: 'inherit', fontSize: css(12), fontWeight: 700, letterSpacing: '0.02em',
              color: on ? colors.base.white : colors.text.secondary, bgcolor: on ? R.maroon : 'transparent', boxShadow: on ? '0 0.1875rem 0.5rem rgba(138,31,32,.3)' : 'none', transition: 'background-color .15s, color .15s',
            }}
          >
            {p}
          </ButtonBase>
        )
      })}
    </Box>
  )
}

const MOBILE = '(max-width:48rem)'

/** Sections fade and slide up when they are revealed. */
const reveal = {
  animation: 'rpt-reveal .45s cubic-bezier(.2,.7,.2,1) both',
  '@keyframes rpt-reveal': { from: { opacity: 0, transform: 'translateY(14px)' }, to: { opacity: 1, transform: 'none' } },
  '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
} as const

/** Played on the lower sections when the flow is reset. */
const hide = {
  animation: 'rpt-hide .35s ease both',
  '@keyframes rpt-hide': { from: { opacity: 1, transform: 'none' }, to: { opacity: 0, transform: 'translateY(-10px)' } },
  '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
} as const

const holderLabel = (h: ApiHolder) => (h.holder_type === 'joint' ? h.name.replace(', ', ' & ') : h.name)

/** Horizontally sliding pages (phone). Height follows the active page; swipe or use the pager to change page. */
function SlidingPages({ page, onPage, children }: { page: number; onPage: (n: number) => void; children: React.ReactNode[] }) {
  const refs = useRef<(HTMLDivElement | null)[]>([])
  const [h, setH] = useState<number | undefined>()
  const startX = useRef<number | null>(null)
  useLayoutEffect(() => {
    const measure = () => setH(refs.current[page]?.offsetHeight)
    measure()
    const ro = new ResizeObserver(measure)
    if (refs.current[page]) ro.observe(refs.current[page]!)
    return () => ro.disconnect()
  }, [page, children.length])
  return (
    <Box
      onTouchStart={(e) => {
        startX.current = e.touches[0].clientX
      }}
      onTouchEnd={(e) => {
        if (startX.current === null) return
        const dx = e.changedTouches[0].clientX - startX.current
        startX.current = null
        if (dx < -50 && page < children.length - 1) onPage(page + 1)
        else if (dx > 50 && page > 0) onPage(page - 1)
      }}
      sx={{ mt: css(18), overflow: 'hidden', height: h, transition: 'height .35s ease', '@media (prefers-reduced-motion: reduce)': { transition: 'none' } }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', transform: `translateX(-${page * 100}%)`, transition: 'transform .4s cubic-bezier(.4,0,.2,1)', '@media (prefers-reduced-motion: reduce)': { transition: 'none' } }}>
        {children.map((c, i) => (
          <Box key={i} ref={(el: HTMLDivElement | null) => { refs.current[i] = el }} aria-hidden={i !== page} sx={{ flex: '0 0 100%', minWidth: 0, visibility: i === page ? 'visible' : 'hidden', transition: i === page ? 'none' : 'visibility 0s linear .4s' }}>
            {c}
          </Box>
        ))}
      </Box>
    </Box>
  )
}

function Pager({ page, count, onChange }: { page: number; count: number; onChange: (n: number) => void }) {
  const arrow = (dir: -1 | 1) => {
    const enabled = dir === -1 ? page > 0 : page < count - 1
    return (
      <ButtonBase aria-label={dir === -1 ? 'Previous page' : 'Next page'} disabled={!enabled} onClick={() => onChange(page + dir)} sx={{ p: css(6), color: enabled ? R.maroon : colors.sand[755] }}>
        {dir === -1 ? <ChevronLeft size="1rem" strokeWidth={2.2} /> : <ChevronRight size="1rem" strokeWidth={2.2} />}
      </ButtonBase>
    )
  }
  return (
    <Box sx={{ mt: css(16), display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: css(4) }}>
      {arrow(-1)}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: css(7) }}>
        {Array.from({ length: count }, (_, i) => (
          <Box
            key={i}
            component="button"
            type="button"
            aria-label={`Page ${i + 1}`}
            onClick={() => onChange(i)}
            sx={{ p: 0, border: 0, cursor: 'pointer', height: css(6), width: css(i === page ? 17 : 6), borderRadius: css(3), bgcolor: i === page ? R.maroon : colors.sand[843], transition: 'width .2s, background-color .2s' }}
          />
        ))}
      </Box>
      {arrow(1)}
    </Box>
  )
}

function ReportCard({ report, selected, onSelect, onAdvanced }: { report: ApiReport; selected: boolean; onSelect: () => void; onAdvanced: () => void }) {
  return (
    <Box
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
      }}
      sx={{
        display: 'flex', alignItems: 'center', gap: rem(10), minHeight: rem(61.5), px: rem(14), py: rem(11), boxSizing: 'border-box', cursor: 'pointer', outline: 'none',
        borderRadius: rem(20), border: `${rem(1)} solid ${selected ? R.maroon : R.line}`, bgcolor: selected ? colors.cream[953] : colors.base.white, transition: 'background-color .15s, border-color .15s',
        '&:hover': { borderColor: selected ? R.maroon : colors.sand[620] }, '&:focus-visible': { boxShadow: `0 0 0 ${rem(2)} ${colors.gold.soft}` },
      }}
    >
      <Box sx={{ width: rem(33), height: rem(33), flexShrink: 0, borderRadius: rem(10), display: 'grid', placeItems: 'center', bgcolor: selected ? R.maroon : colors.cream[953], color: selected ? colors.base.white : colors.text.mutedWarm, transition: 'background-color .15s' }}>
        <FileText size="1rem" strokeWidth={1.5} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ ...font, fontSize: rem(10.9), fontWeight: selected ? 700 : 500, lineHeight: rem(18), color: selected ? R.maroon : R.ink }}>{report.name}</Box>
        {selected && report.has_advance_options && (
          <Box
            component="button"
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onAdvanced()
            }}
            sx={{ display: 'block', p: 0, mt: rem(1), border: 0, bgcolor: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: rem(10.1), lineHeight: rem(16), color: R.maroon, textDecoration: 'underline' }}
          >
            Advance Options
          </Box>
        )}
      </Box>
      <Box sx={{ width: rem(17), height: rem(17), flexShrink: 0, borderRadius: '50%', boxSizing: 'border-box', display: 'grid', placeItems: 'center', border: `${rem(1.5)} solid ${selected ? R.maroon : colors.sand[820]}`, transition: 'border-color .15s' }}>
        <Box sx={{ width: rem(8.5), height: rem(8.5), borderRadius: '50%', bgcolor: R.maroon, transform: selected ? 'scale(1)' : 'scale(0)', transition: 'transform .18s ease' }} />
      </Box>
    </Box>
  )
}

function ActionButton({ kind, disabled, busy, onClick, children, icon }: { kind: 'plain' | 'outline' | 'solid'; disabled: boolean; busy: boolean; onClick: () => void; children: string; icon?: React.ReactNode }) {
  const palette = disabled
    ? { color: colors.sand[686], border: colors.sand[859], bg: kind === 'solid' ? colors.cream[890] : 'transparent' }
    : kind === 'solid'
      ? { color: colors.base.white, border: 'transparent', bg: gradients.primaryButton }
      : kind === 'outline'
        ? { color: R.maroon, border: R.maroon, bg: colors.base.white }
        : { color: colors.text.secondary, border: colors.sand[859], bg: colors.surface.tableHead }
  return (
    <ButtonBase
      disabled={disabled || busy}
      onClick={onClick}
      sx={{
        height: { xs: css(41), md: rem(50) }, minWidth: 0, gap: rem(8), px: rem(8), borderRadius: rem(12), boxSizing: 'border-box', fontFamily: 'inherit', fontSize: rem(10.5), fontWeight: 500, whiteSpace: 'nowrap',
        color: palette.color, border: `${rem(1)} solid ${palette.border}`, background: palette.bg, opacity: busy ? 0.7 : 1, transition: 'opacity .15s',
        '&.Mui-disabled': { color: palette.color, pointerEvents: 'none' },
      }}
    >
      {icon}
      {children}
    </ButtonBase>
  )
}

export default function ReportsPage() {
  const [product, setProduct] = useState<Product>('PMS')
  const [holdersRes, setHoldersRes] = useState<HoldersResponse | null>(null)
  const [catalogRes, setCatalogRes] = useState<CatalogResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [holderId, setHolderId] = useState<string | null>(null)
  const [diCode, setDiCode] = useState<string | null>(null)
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [reportId, setReportId] = useState<string | null>(null)
  const [criteriaId, setCriteriaId] = useState<string | null>(null)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [busy, setBusy] = useState<DeliveryMode | null>(null)
  const [generated, setGenerated] = useState<GenerateResponse | null>(null)
  const [advOpen, setAdvOpen] = useState(false)
  const [advRes, setAdvRes] = useState<AdvancedOptionsResponse | null>(null)
  const [diRes, setDiRes] = useState<DiCodesResponse | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [advanced, setAdvanced] = useState<Record<string, Record<string, string>>>({})
  const [showResponses, setShowResponses] = useState(true)
  const isMobile = useMediaQuery(MOBILE)
  const [pageNo, setPageNo] = useState(0)

  const sec2 = useRef<HTMLDivElement>(null)
  const sec3 = useRef<HTMLDivElement>(null)
  const sec4 = useRef<HTMLDivElement>(null)

  const changeProduct = (p: Product) => {
    if (p === product) return
    setProduct(p)
    setHoldersRes(null)
    setCatalogRes(null)
    setHolderId(null)
    setDiCode(null)
    setCategoryId(null)
    setReportId(null)
    setCriteriaId(null)
    setFromDate('')
    setToDate('')
    setGenerated(null)
  }

  useEffect(() => {
    let cancelled = false
    Promise.all([fetchHolders(product), fetchCatalog(product)])
      .then(([h, c]) => {
        if (cancelled) return
        setHoldersRes(h)
        setCatalogRes(c)
        setHolderId(h.data.holders.find((x) => x.holder_type === 'single')?.id ?? h.data.holders[0]?.id ?? null)
        setCategoryId(c.data.categories[0]?.id ?? null)
      })
      .catch((e: Error) => !cancelled && setError(e.message))
    return () => {
      cancelled = true
    }
  }, [product])

  useEffect(() => {
    if (!holderId) return
    let cancelled = false
    fetchDiCodes(holderId, product).then((r) => !cancelled && setDiRes(r))
    return () => {
      cancelled = true
    }
  }, [holderId, product])

  const holders = holdersRes?.data.holders ?? []
  const categories = catalogRes?.data.categories ?? []
  const criteriaList = catalogRes?.data.criteria ?? []
  const category = categories.find((c) => c.id === categoryId)
  const report = categories.flatMap((c) => c.reports).find((x) => x.id === reportId)
  const criteria = criteriaList.find((c) => c.id === criteriaId)
  const datesOk = !!fromDate && !!toDate && fromDate <= toDate
  const complete = !!criteria && (!criteria.requires_dates || datesOk)

  const PER_PAGE = 4
  const reports = category?.reports ?? []
  const pickReport = (id: string) => {
    setReportId(id)
    setCriteriaId(null)
    setFromDate('')
    setToDate('')
  }
  const pageCount = Math.max(1, Math.ceil((category?.reports.length ?? 0) / PER_PAGE))
  const safePage = Math.min(pageNo, pageCount - 1)

  useRevealScroll(!!diCode, sec2)
  useRevealScroll(!!report, sec3)
  useRevealScroll(!!criteria, sec4)

  const resetFlowNow = () => {
    setDiCode(null)
    setReportId(null)
    setCriteriaId(null)
    setFromDate('')
    setToDate('')
    setGenerated(null)
    setAdvanced({})
    setPageNo(0)
    setCategoryId(categories[0]?.id ?? null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  /** Fade the lower sections out, then clear everything. */
  const resetFlow = () => {
    setConfirmOpen(false)
    setResetting(true)
    window.setTimeout(() => {
      resetFlowNow()
      setResetting(false)
    }, 360)
  }

  const pickHolder = (id: string) => {
    setHolderId(id)
    setDiCode(null)
    setReportId(null)
    setCriteriaId(null)
  }
  const pickCriteria = (id: string) => {
    setCriteriaId(id)
    if (id !== 'date_range') {
      setFromDate('')
      setToDate('')
    }
  }

  const request = (delivery: DeliveryMode) => ({
    product,
    di_code: diCode ?? '',
    report_id: reportId ?? '',
    criteria: { type: criteriaId ?? '', ...(criteriaId === 'date_range' ? { from_date: fromDate, to_date: toDate } : {}) },
    delivery,
    ...(reportId && advanced[reportId] ? { advanced_options: advanced[reportId] } : {}),
  })
  const run = (delivery: DeliveryMode) => {
    setBusy(delivery)
    generateReport(request(delivery))
      .then(setGenerated)
      .finally(() => setBusy(null))
  }

  if (error) return <Box sx={{ p: rem(24), color: colors.status.error }}>{error}</Box>
  const ready = !!holdersRes && !!catalogRes

  return (
    <Box sx={{ maxWidth: rem(1280), mx: 'auto', px: { xs: css(14), md: rem(16) }, pb: rem(48) }}>
      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'flex-start', md: 'flex-start' }, justifyContent: 'space-between', gap: { xs: css(20), md: rem(12) }, pt: rem(16) }}>
        <Box>
          <Box sx={{ ...font, fontSize: rem(10.5), lineHeight: rem(16), color: colors.text.mutedWarm }}>
            <Box component="a" href="#/" sx={{ color: 'inherit', textDecoration: 'none', '&:hover': { color: R.maroon } }}>Dashboard</Box> / Reports
          </Box>
          <Box component="h1" sx={{ ...font, mt: rem(6), fontSize: rem(19.3), fontWeight: 800, lineHeight: rem(30), color: R.ink }}>Investment Reports</Box>
          <Box sx={{ ...font, mt: rem(14), fontSize: rem(10.9), lineHeight: rem(18), color: colors.text.mutedWarm }}>Generate and download category-wise reports for your portfolio.</Box>
        </Box>
        <ProductToggle value={product} onChange={changeProduct} />
      </Box>

      {product === 'AIF' ? (
        <AifReports />
      ) : (
        <>
      <ReportsStepper key={`stepper-${product}`} compact={isMobile} reached={[true, !!diCode, !!report, complete]} circles={[true, !!diCode, !!report, !!criteria]} lines={[!!diCode, !!report, !!criteria]} />

      <Box key={`flow-${product}`} sx={{ mt: rem(14), display: 'grid', gap: rem(15), animation: 'rpt-tab-fade .4s cubic-bezier(.2,.7,.2,1) both', '@keyframes rpt-tab-fade': { from: { opacity: 0, transform: 'translateY(10px)' }, to: { opacity: 1, transform: 'none' } }, '@media (prefers-reduced-motion: reduce)': { animation: 'none' } }}>
        {/* 1 · Client selection */}
        <SectionCard index={1} title="Select Holder type and DI code">
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, columnGap: rem(13.5), rowGap: { xs: css(22), md: 0 } }}>
            <Box sx={{ minWidth: 0 }}>
              <Box sx={{ ...goldLabel, mb: rem(8) }}>1. Select Holder</Box>
              {ready ? (
                <SelectField
                  prefix="Holder:"
                  placeholder="Select holder"
                  value={holderId}
                  onChange={pickHolder}
                  valueColor={R.maroon}
                  groups={[
                    { heading: 'Single holder', options: holders.filter((h) => h.holder_type === 'single').map((h) => ({ value: h.id, label: holderLabel(h) })) },
                    { heading: 'Joint holder', options: holders.filter((h) => h.holder_type === 'joint').map((h) => ({ value: h.id, label: holderLabel(h) })) },
                  ].filter((g) => g.options.length > 0)}
                />
              ) : (
                <Bone h={41} r={21} />
              )}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Box sx={{ ...goldLabel, mb: rem(8) }}>2. Select DI code</Box>
              {ready && diRes?.data.holder_id === holderId ? (
                <SelectField
                  placeholder="Select DI code"
                  value={diCode}
                  onChange={setDiCode}
                  valueColor={colors.text.body}
                  groups={[{ options: diRes.data.di_codes.map((d) => ({ value: d.di_code, label: d.label })) }]}
                />
              ) : (
                <Bone h={41} r={21} />
              )}
            </Box>
          </Box>
        </SectionCard>

        {/* 2 · Choose reports */}
        {diCode && (
          <Box ref={sec2} sx={resetting ? hide : reveal}>
            <SectionCard index={2} title="Browse and select reports">
              {isMobile ? (
                <SelectField
                  prefix="Category:"
                  placeholder="Select category"
                  value={categoryId}
                  valueColor={R.maroon}
                  onChange={(v) => {
                    setCategoryId(v)
                    setPageNo(0)
                  }}
                  groups={[{ options: categories.map((c) => ({ value: c.id, label: c.name })) }]}
                />
              ) : (
                <Box role="radiogroup" aria-label="Report category" sx={{ display: 'flex', flexWrap: 'wrap', gap: rem(5.5) }}>
                  {categories.map((c) => (
                    <Chip key={c.id} label={c.name} selected={c.id === categoryId} onClick={() => setCategoryId(c.id)} variant="fill" height={30.5} fontSize={10.1} px={12.5} />
                  ))}
                </Box>
              )}
              {isMobile ? (
                <SlidingPages page={safePage} onPage={setPageNo}>
                  {Array.from({ length: pageCount }, (_, i) => (
                    <Box key={i} role="radiogroup" aria-label={`Reports page ${i + 1}`} sx={{ display: 'grid', gap: css(8), alignContent: 'start' }}>
                      {reports.slice(i * PER_PAGE, (i + 1) * PER_PAGE).map((rep) => (
                        <ReportCard key={rep.id} report={rep} selected={rep.id === reportId} onSelect={() => pickReport(rep.id)} onAdvanced={() => setAdvOpen(true)} />
                      ))}
                    </Box>
                  ))}
                </SlidingPages>
              ) : (
                <Box role="radiogroup" aria-label="Reports" sx={{ mt: rem(20), display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: rem(10.5), alignItems: 'start' }}>
                  {reports.map((rep) => (
                    <ReportCard key={rep.id} report={rep} selected={rep.id === reportId} onSelect={() => pickReport(rep.id)} onAdvanced={() => setAdvOpen(true)} />
                  ))}
                </Box>
              )}
              {isMobile && pageCount > 1 && <Pager page={safePage} count={pageCount} onChange={setPageNo} />}
            </SectionCard>
          </Box>
        )}

        {/* 3 · Configure */}
        {report && (
          <Box ref={sec3} sx={resetting ? hide : reveal}>
            <SectionCard index={3} title="Set criteria or Date Range">
              <Box role="radiogroup" aria-label="Criteria" sx={{ display: 'flex', flexWrap: 'wrap', gap: rem(5.5) }}>
                {criteriaList.map((c) => (
                  <Chip key={c.id} label={c.label} selected={c.id === criteriaId} onClick={() => pickCriteria(c.id)} variant="fill" height={30.5} fontSize={10.1} px={12.5} />
                ))}
              </Box>
              {criteria?.requires_dates && (
                <Box sx={{ mt: rem(22), display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: rem(13.5) }}>
                  <DateField label="From date" value={fromDate} onChange={setFromDate} max={toDate || undefined} />
                  <DateField label="To date" value={toDate} onChange={setToDate} min={fromDate || undefined} />
                </Box>
              )}
            </SectionCard>
          </Box>
        )}

        {criteria?.requires_dates && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', height: rem(28), px: rem(8) }}>
            <ButtonBase
              disabled={!datesOk}
              onClick={() => sec4.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              sx={{ gap: rem(4), fontFamily: 'inherit', fontSize: rem(11.8), fontWeight: 500, color: R.maroon, '&.Mui-disabled': { color: colors.sand[755] } }}
            >
              View download options <ChevronRight size="0.875rem" />
            </ButtonBase>
          </Box>
        )}

        {/* 4 · Download and share */}
        {criteria && (
          <Box ref={sec4} sx={resetting ? hide : reveal}>
            <SectionCard index={4} title="Download and share">
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: rem(13.5) }}>
                <Box sx={{ boxSizing: 'border-box', minHeight: rem(84.5), px: rem(17), py: rem(14), borderRadius: rem(20), border: `${rem(1)} solid ${R.line}`, bgcolor: colors.base.white }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: rem(7) }}>
                    <FileText size="0.8125rem" strokeWidth={1.7} color={R.gold} />
                    <Box sx={{ ...goldLabel, flex: 1, fontSize: rem(9.4), letterSpacing: '0.09em' }}>Report details</Box>
                    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', height: rem(21), px: rem(10), borderRadius: rem(11), bgcolor: colors.cream[939], color: R.maroon, fontSize: rem(9.6), fontWeight: 700, letterSpacing: '0.02em' }}>{product}</Box>
                    <ButtonBase
                      aria-label="Remove report"
                      onClick={() => setConfirmOpen(true)}
                      sx={{ color: colors.text.mutedWarm, borderRadius: '50%', p: rem(2) }}
                    >
                      <X size="1rem" strokeWidth={1.6} />
                    </ButtonBase>
                  </Box>
                  <Box component="h3" sx={{ ...font, mt: rem(10), fontSize: rem(15.3), fontWeight: 700, lineHeight: rem(22), color: R.ink }}>{report?.name}</Box>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' }, gap: { xs: css(9), md: rem(8.5) }, p: { xs: css(18), md: rem(17) }, borderRadius: rem(20), border: `${rem(1)} dotted ${colors.sand[620]}`, bgcolor: colors.surface.panel }}>
                  <ActionButton kind="plain" disabled={!complete} busy={busy === 'download_email'} onClick={() => run('download_email')}>Download &amp; Email</ActionButton>
                  <ActionButton kind="outline" disabled={!complete} busy={busy === 'email'} onClick={() => run('email')} icon={<Mail size="1rem" strokeWidth={1.7} />}>Send via Email</ActionButton>
                  <ActionButton kind="solid" disabled={!complete} busy={busy === 'download'} onClick={() => run('download')} icon={<Download size="1rem" strokeWidth={1.7} />}>Download PDF</ActionButton>
                </Box>
              </Box>
              {generated && (
                <Box role="status" sx={{ mt: rem(10), fontSize: rem(10), color: colors.status.positiveText }}>{generated.message}</Box>
              )}
            </SectionCard>
          </Box>
        )}
      </Box>

      {/* Mock API responses */}
      <Box sx={{ mt: rem(40) }}>
        <ButtonBase
          role="switch"
          aria-checked={showResponses}
          onClick={() => setShowResponses((v) => !v)}
          sx={{ gap: rem(8), height: rem(30), px: rem(10), borderRadius: rem(15), border: `${rem(1)} solid ${colors.border.input}`, bgcolor: colors.base.white, fontFamily: 'inherit', fontSize: rem(10.5), fontWeight: 600, color: colors.text.secondary }}
        >
          <Box sx={{ position: 'relative', width: rem(26), height: rem(14), borderRadius: rem(7), bgcolor: showResponses ? colors.brand.primary : colors.sand[820], transition: 'background-color .2s' }}>
            <Box sx={{ position: 'absolute', top: rem(2), left: rem(2), width: rem(10), height: rem(10), borderRadius: '50%', bgcolor: colors.base.white, transform: showResponses ? 'translateX(0.75rem)' : 'none', transition: 'transform .2s' }} />
          </Box>
          API responses
        </ButtonBase>
        {showResponses && (
          <Box sx={{ mt: rem(12), display: 'grid', gap: rem(10), gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 26rem), 1fr))' }}>
            <ApiResponsePanel endpoint={`GET /api/reports/holders?product=${product}`} data={holdersRes ?? undefined} maxHeight={rem(340)} />
            {holderId && <ApiResponsePanel endpoint={`GET /api/reports/holders/${holderId}/di-codes?product=${product}`} data={diRes ?? undefined} maxHeight={rem(340)} />}
            <ApiResponsePanel endpoint={`GET /api/reports/catalog?product=${product}`} data={catalogRes ?? undefined} maxHeight={rem(340)} />
            {advRes && reportId && advRes.data.report_id === reportId && (
              <ApiResponsePanel endpoint={`GET /api/reports/${reportId}/advanced-options`} data={advRes} maxHeight={rem(340)} />
            )}
            {diCode && report && criteria && (
              <ApiResponsePanel
                label="Request body"
                endpoint="POST /api/reports/generate"
                data={{ ...request('download'), delivery: 'download | email | download_email' }}
                maxHeight={rem(340)}
              />
            )}
            {generated && <ApiResponsePanel label="Response" endpoint="POST /api/reports/generate" data={generated} maxHeight={rem(340)} />}
          </Box>
        )}
      </Box>
        </>
      )}
      <AdvancedOptionsDialog
        open={advOpen}
        reportId={reportId}
        applied={reportId ? advanced[reportId] : undefined}
        onClose={() => setAdvOpen(false)}
        onLoaded={setAdvRes}
        onApply={(v) => {
          if (reportId) setAdvanced((a) => ({ ...a, [reportId]: v }))
          setAdvOpen(false)
        }}
      />
      <ConfirmDialog
        open={confirmOpen}
        title="Start a new report?"
        message="Your selected report, client and date criteria will be cleared. You’ll return to Step 1 to start again."
        cancelLabel="Keep report"
        confirmLabel="Reset report"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={resetFlow}
      />
    </Box>
  )
}
