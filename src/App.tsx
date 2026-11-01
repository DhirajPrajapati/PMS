import { Box, ButtonBase } from '@mui/material'
import { useState } from 'react'
import { fetchAifRedemption } from './api/aifRedemption'
import { fetchAifTopup } from './api/aifTopup'
import { fetchMyStrategies } from './api/myStrategies'
import { DEFAULT_LIMIT, query, type Paged } from './api/pagination'
import { pendingRedemptionsResponse } from './api/redemptions'
import { mockRdFileResponses } from './api/rdFile'
import { fetchAdditionalPurchase, fetchRedemption, fetchSummary } from './api/strategies'
import { AifRedemptionCard, AifRedemptionCardSkeleton } from './components/cards/AifRedemptionCard'
import { AifTopupCard, AifTopupCardSkeleton } from './components/cards/AifTopupCard'
import { PmsCardSkeleton, PmsCard, type CardVariant, type PmsStrategy } from './components/cards/PmsCard'
import CardCarousel from './components/common/CardCarousel'
import PageSection, { ResponsesVisibleContext } from './components/common/PageSection'
import MyStrategiesSection, { MyStrategiesSkeleton } from './components/MyStrategiesSection'
import PendingRedemptionsDialog from './components/PendingRedemptionsDialog'
import RdFileDialog from './components/RdFileDialog'
import { useApiResource } from './hooks/useApiResource'
import { rem } from './utils/format'
import { colors } from './theme'

const stack = (children: React.ReactNode) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: rem(12), p: rem(14) }}>{children}</Box>
)

const ErrorNote = ({ message }: { message: string }) => <Box sx={{ p: rem(24), color: colors.status.error }}>{message}</Box>

interface PmsSectionProps {
  index: number
  variant: CardVariant
  title: string
  subtitle: string
  path: string
  fetchPage: () => Promise<Paged<PmsStrategy>>
  onViewPending: (s: PmsStrategy) => void
  onViewRdFile: (s: PmsStrategy) => void
}

/** One PMS card family (purchase / summary / redemption) with its own paginated API. */
function PmsSection({ index, variant, title, subtitle, path, fetchPage, onViewPending, onViewRdFile }: PmsSectionProps) {
  const { data, loading, error } = useApiResource(fetchPage)
  if (error) return <ErrorNote message={error} />
  return (
    <PageSection
      index={index}
      title={title}
      subtitle={subtitle}
      responses={[{ endpoint: `GET ${path}${query(data?.page ?? 1, data?.limit ?? DEFAULT_LIMIT)}`, data: loading ? undefined : data?.response }]}
    >
      <CardCarousel>
        {!loading && data
          ? data.items.map((s) => <PmsCard key={s.id} strategy={s} onViewPending={onViewPending} onViewRdFile={onViewRdFile} />)
          : Array.from({ length: 2 }, (_, k) => <PmsCardSkeleton key={k} variant={variant} />)}
      </CardCarousel>
    </PageSection>
  )
}

export default function App() {
  const [showResponses, setShowResponses] = useState(true)
  const [pendingFor, setPendingFor] = useState<PmsStrategy | null>(null)
  const [rdFor, setRdFor] = useState<PmsStrategy | null>(null)

  const mine = useApiResource(() => fetchMyStrategies())
  const topup = useApiResource(() => fetchAifTopup())
  const redeem = useApiResource(() => fetchAifRedemption())

  const pmsProps = { onViewPending: setPendingFor, onViewRdFile: setRdFor }
  const firstError = mine.error ?? topup.error ?? redeem.error
  if (firstError) return <ErrorNote message={firstError} />

  return (
    <ResponsesVisibleContext.Provider value={showResponses}>
      <Box sx={{ maxWidth: rem(1680), mx: 'auto', pb: rem(40) }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: rem(14), pt: rem(14) }}>
          <ButtonBase
            role="switch"
            aria-checked={showResponses}
            onClick={() => setShowResponses((v) => !v)}
            sx={{ gap: rem(8), height: rem(30), px: rem(10), borderRadius: rem(15), border: `${rem(1)} solid ${colors.border.input}`, bgcolor: colors.base.white, fontFamily: 'inherit', fontSize: rem(12), fontWeight: 600, color: colors.text.secondary }}
          >
            <Box sx={{ position: 'relative', width: rem(26), height: rem(14), borderRadius: rem(7), bgcolor: showResponses ? colors.brand.primary : colors.sand[820], transition: 'background-color .2s' }}>
              <Box sx={{ position: 'absolute', top: rem(2), left: rem(2), width: rem(10), height: rem(10), borderRadius: '50%', bgcolor: colors.base.white, transform: showResponses ? 'translateX(0.75rem)' : 'none', transition: 'transform .2s' }} />
            </Box>
            API responses
          </ButtonBase>
        </Box>

        <PmsSection
          {...pmsProps}
          index={1}
          variant="purchase"
          title="PMS Additional Purchase"
          subtitle="Pick strategies and enter the top-up amount"
          path="/api/pms/additional-purchase"
          fetchPage={() => fetchAdditionalPurchase()}
        />
        <PmsSection
          {...pmsProps}
          index={2}
          variant="summary"
          title="PMS Summary"
          subtitle="Read-only view of AUM and XIRR"
          path="/api/pms/summary"
          fetchPage={() => fetchSummary()}
        />
        <PmsSection
          {...pmsProps}
          index={3}
          variant="redemption"
          title="PMS Redemption"
          subtitle="Choose partial or full redemption"
          path="/api/pms/redemption"
          fetchPage={() => fetchRedemption()}
        />

        <PageSection
          index={4}
          title="Invested Strategies"
          subtitle="Grid or list view with performance by range"
          responses={[{ endpoint: `GET /api/pms/my-strategies${query(mine.data?.page ?? 1, mine.data?.limit ?? DEFAULT_LIMIT)}`, data: mine.loading ? undefined : mine.data?.response }]}
        >
          {!mine.loading && mine.data ? (
            <MyStrategiesSection total={mine.data.total} asOnDate={mine.data.response.data.asOnDate} strategies={mine.data.items} />
          ) : (
            <MyStrategiesSkeleton />
          )}
        </PageSection>

        <PageSection
          index={5}
          title="AIF Top-up"
          subtitle="Expand a fund to pick unit classes and make a payment"
          responses={[{ endpoint: `GET /api/aif/topup${query(topup.data?.page ?? 1, topup.data?.limit ?? DEFAULT_LIMIT)}`, data: topup.loading ? undefined : topup.data?.response }]}
        >
          {!topup.loading && topup.data ? (
            stack(topup.data.items.map((f) => <AifTopupCard key={f.id} fund={f} />))
          ) : (
            stack(<AifTopupCardSkeleton />)
          )}
        </PageSection>

        <PageSection
          index={6}
          title="AIF Redemption"
          subtitle="Choose full or partial redemption per unit class"
          responses={[{ endpoint: `GET /api/aif/redemption${query(redeem.data?.page ?? 1, redeem.data?.limit ?? DEFAULT_LIMIT)}`, data: redeem.loading ? undefined : redeem.data?.response }]}
        >
          {!redeem.loading && redeem.data ? (
            stack(redeem.data.items.map((f) => <AifRedemptionCard key={f.id} fund={f} />))
          ) : (
            stack(<AifRedemptionCardSkeleton />)
          )}
        </PageSection>

        <PageSection
          index={7}
          title="Redemption Dialog APIs"
          subtitle="Opened from the redemption cards in section 3"
          responses={[
            { label: 'Pending partial redemptions', endpoint: `GET /api/pms/strategies/str_201/pending-partial-redemptions${query(1, DEFAULT_LIMIT)}`, data: pendingRedemptionsResponse('str_201') },
            { label: 'Tentative RD file', endpoint: 'GET /api/pms/strategies/str_201/rd-file', data: mockRdFileResponses.str_201 },
          ]}
        />

        <PendingRedemptionsDialog strategy={pendingFor} onClose={() => setPendingFor(null)} />
        <RdFileDialog strategy={rdFor} onClose={() => setRdFor(null)} />
      </Box>
    </ResponsesVisibleContext.Provider>
  )
}
