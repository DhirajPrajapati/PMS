import { Box } from '@mui/material'
import { Bone, SkeletonCard } from '../../common/Skeleton'
import { rem } from '../../../utils/format'
import { colors } from '../../../theme'

// Positions (px) measured from the rendered MyStrategyCard (236 x 415).
/** Loading placeholder laid out exactly like MyStrategyCard. */
export default function MyStrategyCardSkeleton() {
  return (
    <SkeletonCard height={415}>
      <Bone right={0} y={0} w={78} h={31} r={0} sx={{ borderTopRightRadius: rem(20), borderBottomLeftRadius: rem(16), opacity: 0.8 }} />
      <Bone x={18} y={18} w={14} h={14} r="round" />
      <Bone x={41} y={20} w={86} h={10} />
      <Bone x={15} y={46} w={150} h={14} />

      {/* Invested | AUM | XIRR tiles */}
      <Box sx={{ position: 'absolute', top: rem(73), left: rem(14), right: rem(13), height: rem(74), display: 'grid', gridTemplateColumns: '79fr 58fr 58fr', gap: rem(6) }}>
        {[0, 1, 2].map((i) => (
          <Bone key={i} h={74} r={12} />
        ))}
      </Box>

      {/* Performance box */}
      <Box sx={{ position: 'absolute', top: rem(160), left: rem(14), right: rem(13), height: rem(192), boxSizing: 'border-box', border: `${rem(1)} solid ${colors.border.default}`, borderRadius: rem(12) }} />
      <Bone x={24} y={172} w={90} h={10} />
      <Bone x={36} y={238} w={80} h={72} r={8} />
      <Bone x={124} y={262} w={80} h={48} r={8} />
      <Bone x={26} y={325} w={34} h={25} r={13} />
      <Bone x={65} y={325} w={34} h={25} r={13} />
      <Bone x={104} y={325} w={34} h={25} r={13} />
      <Bone x={143} y={325} w={31} h={25} r={13} />
      <Bone x={178} y={325} w={31} h={25} r={13} />

      <Bone x={15} y={366} w="calc(50% - 17px)" h={36} r={10} />
      <Bone right={14} y={366} w="calc(50% - 17px)" h={36} r={10} />
    </SkeletonCard>
  )
}
