import AifStrategyCard from './AifStrategyCard'
import PmsStrategyCard from './PmsStrategyCard'
import type { MyStrategy } from './types'

interface Props {
  strategy: MyStrategy
  onPerformance?: (s: MyStrategy) => void
  onInvestMore?: (s: MyStrategy) => void
  onTopUp?: (s: MyStrategy) => void
  onStatement?: (s: MyStrategy) => void
}

/** Picks the PMS or AIF card for a strategy row. */
export default function MyStrategyCard({ strategy, onPerformance, onInvestMore, onTopUp, onStatement }: Props) {
  return strategy.aif ? (
    <AifStrategyCard strategy={strategy} onTopUp={onTopUp} onStatement={onStatement} />
  ) : (
    <PmsStrategyCard strategy={strategy} onPerformance={onPerformance} onInvestMore={onInvestMore} />
  )
}
