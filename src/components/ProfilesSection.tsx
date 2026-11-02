import { Box, useMediaQuery } from '@mui/material'
import { useEffect, useState } from 'react'
import { fetchProfiles } from '../api/profiles'
import { DEFAULT_LIMIT, query, type Paged } from '../api/pagination'
import type { ProfilesResponse } from '../api/profiles'
import { ProfileCard, ProfileCardSkeleton, type Profile } from './cards/ProfileCard'
import CardCarousel from './common/CardCarousel'
import PageSection from './common/PageSection'
import { rem } from '../utils/format'
import { colors } from '../theme'

const MOBILE_QUERY = '(max-width:48rem)'

type Result = Paged<Profile, ProfilesResponse>

/** "My Profile" cards with the account-number filter; refetches when the filter changes. */
export default function ProfilesSection({ index }: { index: number }) {
  const isMobile = useMediaQuery(MOBILE_QUERY)
  /** Single selection: clicking the selected card again clears it */
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [data, setData] = useState<Result | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchProfiles()
      .then((r) => {
        if (cancelled) return
        setData(r)
        setLoading(false)
      })
      .catch((e: Error) => !cancelled && (setError(e.message), setLoading(false)))
    return () => {
      cancelled = true
    }
  }, [])

  if (error) return <Box sx={{ p: rem(24), color: colors.status.error }}>{error}</Box>

  const ready = !loading && data
  const cards = ready
    ? data.items.map((p) => <ProfileCard key={p.id} profile={p} compact={isMobile} selected={selectedId === p.id} onSelect={(x) => setSelectedId((cur) => (cur === x.id ? null : x.id))} />)
    : Array.from({ length: isMobile ? 2 : 4 }, (_, k) => <ProfileCardSkeleton key={k} compact={isMobile} />)

  return (
    <PageSection
      index={index}
      title="My Profile"
      subtitle="Investor profiles with contact, bank, nominee and broker details"
      responses={[{ endpoint: `GET /api/profiles${query(data?.page ?? 1, data?.limit ?? DEFAULT_LIMIT)}`, data: ready ? data.response : undefined }]}
    >
      <Box sx={{ pb: rem(16) }}>
        {isMobile ? (
          <CardCarousel slideWidth={`min(calc(100vw - ${rem(56)}), ${rem(512)})`} dotsMargin={20} dotsGap={9}>
            {cards}
          </CardCarousel>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 30rem), 1fr))', gap: rem(16), px: rem(14) }}>{cards}</Box>
        )}
      </Box>
    </PageSection>
  )
}
