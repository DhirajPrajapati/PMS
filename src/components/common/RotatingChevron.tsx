import { ChevronDown } from 'lucide-react'
import { rem } from '../../utils/format'
import { COLLAPSE_MS, EASE } from './Collapse'

/** Down chevron that turns upside down when `open`, in step with Collapse. */
export default function RotatingChevron({ open, size = 14 }: { open: boolean; size?: number }) {
  return <ChevronDown size={rem(size)} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: `transform ${COLLAPSE_MS}s ${EASE}` }} />
}
