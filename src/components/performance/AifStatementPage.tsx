import { Box, ButtonBase, Menu, MenuItem, useMediaQuery } from '@mui/material'
import { Activity, ArrowUp, Layers } from 'lucide-react'
import { useRef, useState } from 'react'
import { nextSort } from '../../hooks/useSort'
import { useServerList } from '../../hooks/useServerList'
import { useToggleSet } from '../../hooks/useToggleSet'
import { fetchAifStatement, fetchAifStatementTransactions, type AifStatementResponse, type StatementFilter, type StatementSortKey, type StatementTransaction } from '../../api/aifStatement'
import type { LabelValue } from '../../api/performanceSummary'
import { useApiResource } from '../../hooks/useApiResource'
import { rem } from '../../utils/format'
import { fadeUp } from '../../theme/motion'
import { colors } from '../../theme'
import { perfPalette as P } from '../../theme/pms'
import { tagStyle } from '../../utils/tags'
import BusyRegion from '../common/BusyRegion'
import ExpandableItem from '../common/ExpandableItem'
import FieldGrid from '../common/FieldGrid'
import IconChip from '../common/IconChip'
import Logo from '../common/Logo'
import ChipGroup from '../common/ChipGroup'
import EmptyState from '../common/EmptyState'
import LabelValueList from '../common/LabelValueList'
import Breadcrumb from '../common/Breadcrumb'
import PageShell from '../common/PageShell'
import Panel from '../common/Panel'
import SortHeader, { type SortColumn } from '../common/SortHeader'
import Pill from '../common/Pill'
import { Bone } from '../common/Skeleton'
import { KpiRow, MOBILE_Q, r, reset, TabFrame } from './shared'

type Data = AifStatementResponse['data']
const KPI_STYLES = [0, 2, 3]
const card = { boxSizing: 'border-box', borderRadius: rem(20), bgcolor: colors.base.white, border: `${rem(1)} solid ${colors.border.default}`, overflow: 'hidden' } as const
const COLS: SortColumn<StatementSortKey>[] = [
  { key: 'date', label: 'Transaction Date' }, { key: 'description', label: 'Description' },
  { key: 'nav', label: 'NAV(₹)', align: 'right' }, { key: 'units', label: 'Units', align: 'right' }, { key: 'amount', label: 'Amount(₹)', align: 'right', pr: 11 },
]
const GRID = '15.1% 30.9% 12% 26.5% 1fr'

function Header({ d }: { d: Data | null }) {
  const cat = tagStyle('AIF')
  const muted = { ...reset, color: colors.text.mutedWarm } as const
  const asOn = d && <Box component="span" sx={{ fontWeight: 700, color: colors.text.strong }}>{d.asOn}</Box>
  return (
    <Box sx={{ flexShrink: 0, bgcolor: colors.base.white }}>
      <Box sx={{ px: r(21, 17), pt: r(23, 18), pb: r(22, 23), borderBottom: `${rem(1)} solid ${colors.border.default}` }}>
        <Breadcrumb current="View Statement" />
        <Box sx={{ mt: rem(14), display: 'flex', alignItems: 'center', gap: rem(8), height: rem(20), ...muted, fontSize: r(12.3, 11.5) }}>
          <IconChip tint={colors.rose[949]} size={20}><Logo size={rem(12)} /></IconChip>
          {d ? d.provider : <Bone w={110} h={11} />}
        </Box>
        <Box component="h1" sx={{ ...reset, mt: rem(2), fontSize: r(16.4, 15.1), fontWeight: 700, lineHeight: rem(24), color: colors.text.ink }}>{d ? d.fundName : <Bone w={320} h={16} sx={{ mt: rem(4) }} />}</Box>
        {d ? (
          <>
            {/* desktop: one line */}
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: rem(7), mt: rem(2), height: rem(22), ...muted, fontSize: rem(12.3) }}>
              Statement of Account
              <Box component="span" sx={{ height: rem(21), px: rem(11), display: 'inline-flex', alignItems: 'center', borderRadius: rem(11), bgcolor: cat.bg, border: `${rem(1)} solid ${colors.sand[812]}`, color: cat.fg, fontWeight: 800, fontSize: rem(11.5) }}>{d.category}</Box>
              · Folio {d.folio} · As on {asOn}
            </Box>
            {/* phone: stacked */}
            <Box sx={{ display: { xs: 'block', sm: 'none' }, ...muted, fontSize: rem(10.5) }}>
              <Box sx={{ mt: rem(7), lineHeight: rem(18) }}>Folio: {d.folio}</Box>
              <Box sx={{ mt: rem(3), display: 'flex', alignItems: 'center', gap: rem(7), lineHeight: rem(20), fontSize: rem(11) }}>
                Statement of Account
                <Box component="span" sx={{ height: rem(20), px: rem(10), display: 'inline-flex', alignItems: 'center', borderRadius: rem(10), bgcolor: cat.bg, border: `${rem(1)} solid ${colors.sand[812]}`, color: cat.fg, fontWeight: 800, fontSize: rem(10.5) }}>{d.category}</Box>
              </Box>
              <Box sx={{ mt: rem(4), lineHeight: rem(20), fontSize: rem(11), color: colors.text.ink }}>As on {d.asOn}</Box>
            </Box>
          </>
        ) : (
          <Bone w={300} h={12} sx={{ mt: rem(9) }} />
        )}
      </Box>
    </Box>
  )
}

const Rows = ({ rows }: { rows: LabelValue[] }) => <LabelValueList rows={rows} rowHeight={r(56.7, 42)} fontSize={r(12.8, 12.2)} sx={{ px: r(16.5, 15.5) }} />

const RowsSkeleton = ({ n }: { n: number }) => (
  <Box sx={{ px: r(16.5, 15.5) }}>
    {Array.from({ length: n }, (_, i) => <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: r(56.7, 42) }}><Bone w={150} h={12} /><Bone w={90} h={12} /></Box>)}
  </Box>
)

function Caret({ up }: { up?: boolean }) {
  return <Box component="span" aria-hidden sx={{ width: 0, height: 0, borderLeft: `${rem(4.5)} solid transparent`, borderRight: `${rem(4.5)} solid transparent`, [up ? 'borderBottom' : 'borderTop']: `${rem(5)} solid ${P.slate}`, transition: 'transform .25s' }} />
}

/** One transaction as a list item (phone). */
function MobileItem({ x, open, onToggle, index }: { x: StatementTransaction; open: boolean; onToggle: () => void; index: number }) {
  return (
    <ExpandableItem index={index} open={open} onToggle={onToggle} badge={<Pill tone={x.type === 'Contribution' ? 'maroon' : 'slate'} sx={{ height: rem(21), px: rem(9), fontSize: rem(10.8), fontWeight: 600 }}>{x.type}</Pill>} meta={x.date.d} title={x.description} value={`₹${x.amount.d}`}>
      <FieldGrid items={[{ label: 'NAV (₹)', value: x.nav.d }, { label: 'Units', value: x.units.d }]} />
    </ExpandableItem>
  )
}

function Transactions({ folio, meta, isMobile }: { folio: string; meta: Data['transactions']; isMobile: boolean }) {
  const [q, setQ] = useState<{ filter: StatementFilter; sort: StatementSortKey; dir: 'asc' | 'desc' }>({ filter: 'All', sort: 'date', dir: 'asc' })
  const { data: res, busy, gen } = useServerList((p: typeof q) => fetchAifStatementTransactions(folio, p), q)
  const rows = res?.data.rows ?? null
  const { toggle, isOpen } = useToggleSet()
  const [menu, setMenu] = useState<HTMLElement | null>(null)
  const selectRef = useRef<HTMLButtonElement>(null)

  const sortBy = (key: StatementSortKey) => setQ((p) => {
    const n = nextSort({ key: p.sort, dir: p.dir }, key)
    return { ...p, sort: n.key, dir: n.dir }
  })
  const sortLabel = meta.sortOptions.find((o) => o.key === q.sort)?.label ?? ''
  const cell = { ...reset, fontSize: rem(12.8) } as const

  return (
    <Box component="section" sx={card}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'center' }, justifyContent: 'space-between', gap: { xs: rem(14), sm: rem(12) }, px: { xs: rem(19), sm: rem(21) }, pt: { xs: rem(17), sm: 0 }, pb: { xs: rem(15), sm: 0 }, minHeight: { sm: rem(66) }, backgroundImage: `linear-gradient(90deg,${colors.cream[971]},${colors.base.white})`, borderBottom: `${rem(1)} solid ${colors.border.default}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: rem(12) }}>
          <IconChip tint={colors.cream[920]} size={30}><Layers size={rem(16)} color={colors.gold.base} /></IconChip>
          <Box>
            <Box component="h2" sx={{ ...reset, fontSize: r(12.9, 11.9), fontWeight: 700, lineHeight: rem(19), color: colors.text.ink }}>{meta.title}</Box>
            <Box sx={{ ...reset, fontSize: r(12.3, 10.5), lineHeight: rem(17), color: colors.text.mutedWarm }}>{meta.subtitle}</Box>
          </Box>
        </Box>
        <ChipGroup ariaLabel="Filter transactions" items={meta.filters} value={q.filter} onChange={(filter) => setQ((p) => ({ ...p, filter }))} />
      </Box>

      {isMobile && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: rem(17), height: rem(50), borderBottom: `${rem(1)} solid ${colors.border.default}` }}>
          <Box sx={{ ...reset, fontSize: rem(11), color: colors.text.mutedWarm }}>Sort transactions</Box>
          <Box sx={{ display: 'flex', gap: rem(8) }}>
            <ButtonBase ref={selectRef} aria-haspopup="listbox" aria-expanded={!!menu} onClick={(e) => setMenu(e.currentTarget)} sx={{ height: rem(32), px: rem(13), gap: rem(10), borderRadius: rem(10), border: `${rem(1)} solid ${menu ? colors.brand.accent : colors.border.input}`, fontFamily: 'inherit', fontSize: rem(11.6), color: colors.text.ink, transition: 'border-color .2s' }}>
              {sortLabel}<Caret up={!!menu} />
            </ButtonBase>
            <ButtonBase aria-label={q.dir === 'asc' ? 'Ascending, switch to descending' : 'Descending, switch to ascending'} onClick={() => setQ((p) => ({ ...p, dir: p.dir === 'asc' ? 'desc' : 'asc' }))} sx={{ width: rem(30), height: rem(32), borderRadius: rem(9), border: `${rem(1)} solid ${colors.border.default}`, color: colors.brand.accent }}>
              <ArrowUp size={rem(14)} style={{ transform: q.dir === 'desc' ? 'rotate(180deg)' : 'none', transition: 'transform .25s' }} />
            </ButtonBase>
          </Box>
          <Menu anchorEl={menu} open={!!menu} onClose={() => setMenu(null)} slotProps={{ paper: { sx: { mt: rem(4), minWidth: rem(133), borderRadius: rem(12), boxShadow: '0 .5rem 1.25rem rgba(60,40,30,.16)' } } }}>
            {meta.sortOptions.map((o) => (
              <MenuItem key={o.key} selected={o.key === q.sort} onClick={() => { setQ((p) => ({ ...p, sort: o.key, dir: 'asc' })); setMenu(null) }} sx={{ height: rem(46), fontFamily: 'inherit', fontSize: rem(13), color: o.key === q.sort ? colors.brand.accent : colors.text.ink, '&.Mui-selected': { bgcolor: colors.cream[971] } }}>{o.label}</MenuItem>
            ))}
          </Menu>
        </Box>
      )}

      {!isMobile && <SortHeader columns={COLS} grid={GRID} sort={{ key: q.sort, dir: q.dir }} onSort={sortBy} height={45} />}

      <BusyRegion busy={busy} hasData={!!rows} role={isMobile ? 'list' : 'table'} label="Transactions">
        {!rows ? (
          [0, 1, 2, 3].map((i) => <Box key={i} sx={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : GRID, alignItems: 'center', height: rem(isMobile ? 70 : 44.4), px: isMobile ? rem(17) : 0, borderBottom: `${rem(1)} solid ${colors.border.default}` }}><Box sx={{ pl: isMobile ? 0 : rem(14.5) }}><Bone w={isMobile ? 200 : 90} h={12} /></Box>{!isMobile && <><Bone w={200} h={12} /><Bone w={50} h={12} sx={{ justifySelf: 'end' }} /><Bone w={50} h={12} sx={{ justifySelf: 'end' }} /><Bone w={70} h={12} sx={{ justifySelf: 'end', mr: rem(11) }} /></>}</Box>)
        ) : rows.length === 0 ? (
          <EmptyState key={gen}>{`No ${q.filter.toLowerCase()} transactions for this statement period.`}</EmptyState>
        ) : (
          <Box key={gen}>
            {rows.map((x, i) => isMobile ? (
              <MobileItem key={x.id} x={x} open={isOpen(x.id)} onToggle={() => toggle(x.id)} index={i} />
            ) : (
              <Box role="row" key={x.id} sx={{ display: 'grid', gridTemplateColumns: GRID, alignItems: 'center', height: rem(44.4), borderBottom: `${rem(1)} solid ${colors.border.default}`, ...fadeUp(i), transition: 'background-color .25s', '&:hover': { bgcolor: colors.cream[975] } }}>
                <Box role="cell" sx={{ ...cell, pl: rem(14.5), fontWeight: 500, color: colors.text.strong }}>{x.date.d}</Box>
                <Box role="cell" sx={{ ...cell, color: colors.text.secondary, minWidth: 0 }}>{x.description}</Box>
                <Box role="cell" sx={{ ...cell, textAlign: 'right', color: colors.text.secondary }}>{x.nav.d}</Box>
                <Box role="cell" sx={{ ...cell, textAlign: 'right', color: colors.text.secondary }}>{x.units.d}</Box>
                <Box role="cell" sx={{ ...cell, textAlign: 'right', pr: rem(14.5), fontWeight: 700, color: colors.text.ink }}>{x.amount.d}</Box>
              </Box>
            ))}
          </Box>
        )}
      </BusyRegion>
    </Box>
  )
}

function Content({ folio, d, error }: { folio: string; d: Data | null; error: string | null }) {
  const isMobile = useMediaQuery(MOBILE_Q)
  return (
    <TabFrame error={error}>
      <KpiRow cards={d?.cards ?? null} styles={KPI_STYLES} compact />
      <Box sx={{ mt: r(17.5, 16), display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: { xs: rem(17.5), sm: rem(19) }, alignItems: 'stretch' }}>
        <Panel icon={<Activity size={rem(16)} color={colors.brand.accent} />} tint={colors.rose[949]} title={d?.capital.title ?? 'Capital Contribution'} subtitle={d?.capital.subtitle ?? ''}>
          {d ? <Rows rows={d.capital.rows} /> : <RowsSkeleton n={5} />}
        </Panel>
        <Panel icon={<Activity size={rem(16)} color={colors.brand.accent} />} tint={colors.rose[949]} title={d?.valuation.title ?? 'Valuation'} subtitle={d?.valuation.subtitle ?? ''}>
          {d ? <Rows rows={d.valuation.rows} /> : <RowsSkeleton n={6} />}
        </Panel>
      </Box>
      <Box sx={{ mt: r(17.5, 17.5) }}>
        {d ? <Transactions folio={folio} meta={d.transactions} isMobile={isMobile} /> : <Box sx={{ ...card, p: rem(21), height: rem(240) }}><Bone w={180} h={14} /><Bone w={260} h={11} sx={{ mt: rem(8) }} /><Bone h={120} r={12} sx={{ mt: rem(24) }} /></Box>}
      </Box>
    </TabFrame>
  )
}

/** AIF "View Statement" page (#/statement/<folio>), opened from the AIF My Strategies card. */
export default function AifStatementPage({ folio }: { folio: string }) {
  const { data, error } = useApiResource(() => fetchAifStatement(folio))
  const d = data?.data ?? null
  return (
    <PageShell embedded header={<Header d={d} />}>
      <Content folio={folio} d={d} error={error} />
    </PageShell>
  )
}
