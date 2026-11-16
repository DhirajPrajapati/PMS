import { Box, ButtonBase, useMediaQuery } from '@mui/material'
import { Layers } from 'lucide-react'
import { useMemo, useState } from 'react'
import { nextSort, type Dir } from '../../hooks/useSort'
import { useServerList } from '../../hooks/useServerList'
import { useToggleSet } from '../../hooks/useToggleSet'
import { fetchPerformanceTransactions, type LabelValue, type TransactionSortKey } from '../../api/performanceSummary'
import { transactionRows, type TransactionRow } from './adapters'
import { rem } from '../../utils/format'
import { fadeUp } from '../../theme/motion'
import { colors } from '../../theme'
import { perfPalette as P } from '../../theme/pms'
import BusyRegion from '../common/BusyRegion'
import Collapse, { COLLAPSE_MS, EASE } from '../common/Collapse'
import ExpandableItem from '../common/ExpandableItem'
import FieldGrid from '../common/FieldGrid'
import RotatingChevron from '../common/RotatingChevron'
import DownloadButton from '../common/DownloadButton'
import Pagination from '../common/Pagination'
import Panel from '../common/Panel'
import SortHeader, { type SortColumn } from '../common/SortHeader'
import Pill from '../common/Pill'
import { Bone } from '../common/Skeleton'
import { MOBILE_Q, reset, TabFrame } from './shared'


const LIMIT = 10
const COLUMNS: SortColumn<TransactionSortKey>[] = [
  { key: 'account', label: 'Account' },
  { key: 'date', label: 'Date' },
  { key: 'type', label: 'Trans Type' },
  { key: 'security', label: 'Security' },
  { key: 'amount', label: 'Amount' },
  { key: null, label: 'Details', align: 'right', pr: 14 },
]
// 17.1% | 9.8% | 15.3% | 15.2% | rest | details
const GRID = '17.1% 9.8% 15.3% 15.2% 1fr 5.5rem'
/** Order of the detail cells in the phone layout (label lookup across the three columns) */
const MOBILE_ORDER = ['Date', 'Amount', 'Security', 'Units', 'Tran Type', 'Price', 'Trading A/c', 'DP', 'Exchange']


const detailText = { ...reset, fontSize: rem(12.3), lineHeight: rem(22.7), color: P.chartAxis } as const

/** One desktop row: summary line + animated detail block. */
function DesktopRow({ x, open, onToggle, index }: { x: TransactionRow; open: boolean; onToggle: () => void; index: number }) {
  const cells = { ...reset, fontSize: rem(12.8) } as const
  return (
    <Box role="row" sx={{ borderBottom: `${rem(1)} solid ${colors.border.default}`, ...fadeUp(index), transition: 'background-color .25s', '&:hover': { bgcolor: colors.cream[975] } }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: GRID, alignItems: 'center', pt: rem(13), pb: open ? rem(6) : rem(13), transition: `padding-bottom ${COLLAPSE_MS}s ${EASE}` }}>
        <Box role="cell" sx={{ ...cells, pl: rem(14.5), color: P.slate, minWidth: 0 }}>{x.account}</Box>
        <Box role="cell" sx={{ ...cells, fontWeight: 500, color: colors.text.strong }}>{x.date.d}</Box>
        <Box role="cell"><Pill tone={x.type.includes('+') ? 'maroon' : 'slate'}>{x.type}</Pill></Box>
        <Box role="cell" sx={{ ...cells, fontWeight: 500, color: colors.text.strong }}>{x.security}</Box>
        <Box role="cell" sx={{ ...cells, fontWeight: 700, color: colors.text.ink }}>{x.amount.d}</Box>
        <Box role="cell" sx={{ display: 'flex', justifyContent: 'flex-end', pr: rem(14) }}>
          <ButtonBase aria-expanded={open} aria-label={`${open ? 'Hide' : 'Show'} details for ${x.date.d}`} onClick={onToggle} sx={{ width: rem(24), height: rem(24), borderRadius: rem(8), color: P.slate, '&:hover': { bgcolor: P.tableHead } }}><RotatingChevron open={open} /></ButtonBase>
        </Box>
      </Box>
      <Collapse open={open}>
        <Box sx={{ display: 'grid', gridTemplateColumns: GRID, pb: rem(11) }}>
          {[0, 1, 2].flatMap((c) => [
            <Box key={`d${c}`} sx={{ gridColumn: [1, 3, 5][c], pl: c === 0 ? rem(14.5) : 0 }}>
              {x.details[c].map((d) => <Box key={d.label} sx={detailText}>{d.label}: {d.value}</Box>)}
            </Box>,
          ])}
        </Box>
      </Collapse>
    </Box>
  )
}

/** One transaction as a list item (phone). */
function MobileItem({ x, open, onToggle, index }: { x: TransactionRow; open: boolean; onToggle: () => void; index: number }) {
  const byLabel = new Map<string, LabelValue>(x.details.flat().map((d) => [d.label, d]))
  const ordered = MOBILE_ORDER.map((l) => byLabel.get(l)).filter((d): d is LabelValue => !!d)
  return (
    <ExpandableItem index={index} open={open} onToggle={onToggle} badge={<Pill tone={x.type.includes('+') ? 'maroon' : 'slate'}>{x.type}</Pill>} meta={x.date.d} title={x.security} value={x.amount.d} valueWeight={500}>
      <Box sx={{ display: 'flex', gap: rem(7), pb: rem(8), mb: rem(11), borderBottom: `${rem(1)} solid ${colors.border.default}`, flexWrap: 'wrap', alignItems: 'baseline' }}>
        <Box component="span" sx={{ ...reset, fontSize: rem(9.4), fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: P.slate }}>Account</Box>
        <Box component="span" sx={{ ...reset, fontSize: rem(10), color: P.slate }}>{x.account}</Box>
      </Box>
      <FieldGrid items={ordered} />
    </ExpandableItem>
  )
}

function Skeleton({ isMobile }: { isMobile: boolean }) {
  return isMobile ? (
    <>{[0, 1, 2].map((i) => <Box key={i} sx={{ px: rem(17), py: rem(12), borderBottom: `${rem(1)} solid ${colors.border.default}` }}><Bone w={120} h={20} r={10} /><Bone w={60} h={13} sx={{ mt: rem(10) }} /><Bone w={80} h={13} sx={{ mt: rem(6) }} /></Box>)}</>
  ) : (
    <>{[0, 1, 2].map((i) => (
      <Box key={i} sx={{ display: 'grid', gridTemplateColumns: GRID, alignItems: 'center', height: rem(48), borderBottom: `${rem(1)} solid ${colors.border.default}` }}>
        <Box sx={{ pl: rem(14.5) }}><Bone w={190} h={12} /></Box><Bone w={74} h={12} /><Bone w={36} h={21} r={11} /><Bone w={40} h={12} /><Bone w={60} h={12} /><Bone w={14} h={14} r={4} sx={{ justifySelf: 'end', mr: rem(18) }} />
      </Box>
    ))}</>
  )
}

export default function TransactionTab({ clientCode, strategy }: { clientCode: string; strategy: string }) {
  const isMobile = useMediaQuery(MOBILE_Q)
  const [query, setQuery] = useState<{ page: number; sort: TransactionSortKey; dir: Dir }>({ page: 1, sort: 'date', dir: 'desc' })
  const { data: res, error, busy, gen } = useServerList((q: typeof query) => fetchPerformanceTransactions(clientCode, { page: q.page, limit: LIMIT, sort: q.sort, dir: q.dir }), query)
  const data = res?.data ?? null
  const rows = useMemo(() => (data ? transactionRows(data.transactions) : []), [data])
  const { toggle, isOpen } = useToggleSet()

  const sortBy = (key: TransactionSortKey) => setQuery((q) => {
    const n = nextSort({ key: q.sort, dir: q.dir }, key, (k) => (k === 'date' || k === 'amount' ? 'desc' : 'asc'))
    return { page: 1, sort: n.key, dir: n.dir }
  })

  return (
    <TabFrame error={error}>
      <Panel icon={<Layers size={rem(16)} color={colors.brand.accent} />} tint={colors.rose[949]} title="Transactions" subtitle={strategy} action={<DownloadButton />}>
        {!isMobile && (
          <SortHeader columns={COLUMNS} grid={GRID} sort={{ key: query.sort, dir: query.dir }} onSort={sortBy} />
        )}
        <BusyRegion busy={busy} hasData={!!data} role={isMobile ? 'list' : 'table'} label="Transactions">
          {!data ? (
            <Skeleton isMobile={isMobile} />
          ) : (
            <Box key={gen}>
              {rows.map((x, i) => isMobile
                ? <MobileItem key={x.id} x={x} open={isOpen(x.id)} onToggle={() => toggle(x.id)} index={i} />
                : <DesktopRow key={x.id} x={x} open={isOpen(x.id)} onToggle={() => toggle(x.id)} index={i} />)}
            </Box>
          )}
        </BusyRegion>
        {data && <Pagination ariaLabel="Transactions pages" page={data.page} totalPages={data.total_pages} onChange={(p) => setQuery((q) => ({ ...q, page: p }))} />}
      </Panel>
    </TabFrame>
  )
}
