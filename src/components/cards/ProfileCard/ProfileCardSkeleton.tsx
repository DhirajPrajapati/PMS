import { Box } from '@mui/material'
import { Bone, SkeletonCard } from '../../common/Skeleton'
import { rem } from '../../../utils/format'
import { colors } from '../../../theme'

/** Loading placeholder laid out like ProfileCard. */
export default function ProfileCardSkeleton({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <SkeletonCard height={440} radius={18}>
        <Bone x={15} y={20} w={130} h={16} />
        <Bone right={50} y={20} w={72} h={24} r={7} />
        <Bone right={14} y={17} w={28} h={28} r="round" />
        <Box sx={{ position: 'absolute', top: rem(58), left: rem(14), right: rem(14), borderTop: `${rem(1)} solid ${colors.border.default}` }} />
        {[78, 140, 202, 284, 330].map((y) => (
          <Box key={y}>
            <Bone x={15} y={y} w={70} h={10} />
            <Bone x={15} y={y + 20} w={170} h={12} />
          </Box>
        ))}
      </SkeletonCard>
    )
  }
  return (
    <SkeletonCard height={231} radius={20}>
      <Bone x={21} y={21} w={150} h={20} />
      <Bone right={52} y={20} w={84} h={24} r={7} />
      <Bone right={20} y={17} w={28} h={28} r="round" />
      <Bone x={21} y={66} w="62%" h={12} />
      <Bone x={21} y={104} w="80%" h={12} />
      <Box sx={{ position: 'absolute', top: rem(140), left: rem(20), right: rem(20), borderTop: `${rem(1)} solid ${colors.border.default}` }} />
      {[0, 1, 2].map((i) => (
        <Box key={i}>
          <Bone x={27 + i * 150} y={160} w={70} h={10} />
          <Bone x={27 + i * 150} y={182} w={90} h={14} />
        </Box>
      ))}
    </SkeletonCard>
  )
}
