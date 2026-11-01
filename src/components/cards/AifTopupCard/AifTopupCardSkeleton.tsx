import { Box } from '@mui/material'
import { Bone, SkeletonCard } from '../../common/Skeleton'
import { rem } from '../../../utils/format'
import { colors } from '../../../theme'

/** Collapsed-state placeholder for the AIF cards: header row plus the six-column summary. */
export default function AifTopupCardSkeleton() {
  return (
    <SkeletonCard>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: rem(30), p: `${rem(17)} ${rem(22.5)} ${rem(10)} ${rem(19.5)}`, minHeight: rem(73), boxSizing: 'border-box', borderBottom: `${rem(1)} solid ${colors.border.default}` }}>
        <Bone w={20.5} h={20.5} r="round" />
        <Box sx={{ flex: 1, display: 'grid', gap: rem(8) }}>
          <Bone w={110} h={10} />
          <Bone w="min(18rem, 60%)" h={16} />
        </Box>
        <Bone w={54} h={20} r={5} />
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', minHeight: rem(64), '@media (max-width:48rem)': { gridTemplateColumns: 'repeat(2, 1fr)', rowGap: rem(12), py: rem(12) } }}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Box key={i} sx={{ pl: rem(19.5), pt: rem(14), display: 'grid', gap: rem(8), alignContent: 'start' }}>
            <Bone w="55%" h={10} />
            <Bone w="70%" h={12} />
          </Box>
        ))}
      </Box>
    </SkeletonCard>
  )
}
