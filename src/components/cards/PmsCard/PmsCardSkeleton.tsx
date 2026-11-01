import { Bone, SkeletonCard } from '../../common/Skeleton'
import type { CardVariant } from './PmsCard'

// Card heights and element positions (px) measured from the rendered PmsCard.
const HEIGHT: Record<CardVariant, number> = { purchase: 388, summary: 242, redemption: 325 }
const PAD = 19

/** Loading placeholder laid out exactly like a PmsCard of the given variant. */
export default function PmsCardSkeleton({ variant = 'purchase' }: { variant?: CardVariant }) {
  const body = { x: PAD, right: PAD } as const
  return (
    <SkeletonCard height={HEIGHT[variant]}>
      {/* header: logo + provider, code chip, tick */}
      <Bone x={PAD} y={24} w={14} h={14} r="round" />
      <Bone x={37} y={26} w={90} h={10} />
      <Bone right={55} y={22} w={76} h={18} r={5} />
      <Bone right={19} y={20} w={24} h={24} r="round" />
      <Bone x={PAD} y={52} w={190} h={16} />
      <Bone x={PAD} y={93} w={170} h={10} />

      <Bone {...body} y={128} h={1} r={0} />
      {/* AUM | XIRR | sparkline */}
      <Bone x={PAD} y={157} w={2} h={46} r={0} />
      <Bone x={37} y={160} w={90} h={10} />
      <Bone x={37} y={181} w={96} h={18} />
      <Bone x={200} y={161} w={36} h={10} />
      <Bone x={200} y={187} w={46} h={12} />
      <Bone right={PAD} y={158} w={90} h={38} r={4} />

      {variant !== 'summary' && <Bone {...body} y={229} h={1} r={0} />}

      {variant === 'purchase' && (
        <>
          <Bone x={PAD} y={247} w={150} h={10} />
          <Bone right={PAD} y={247} w={80} h={10} />
          <Bone {...body} y={274} h={35} r={8} />
          <Bone x={PAD} y={321} w={45} h={32} r={16} />
          <Bone x={72} y={321} w={52} h={32} r={16} />
          <Bone x={132} y={321} w={52} h={32} r={16} />
        </>
      )}
      {variant === 'redemption' && (
        <>
          <Bone x={PAD} y={246} w={110} h={10} />
          <Bone right={PAD} y={246} w={150} h={10} />
          <Bone x={PAD} y={272} w="calc(50% - 25px)" h={34} r={10} />
          <Bone right={PAD} y={272} w="calc(50% - 25px)" h={34} r={10} />
        </>
      )}
    </SkeletonCard>
  )
}
