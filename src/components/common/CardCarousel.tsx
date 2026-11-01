import { Box, useMediaQuery } from '@mui/material'
import { useRef, useState, type PointerEvent, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { rem } from '../../utils/format'
import { colors, overlays, shadows } from '../../theme'

const MOBILE_QUERY = '(max-width:48rem)'
const DEFAULT_W = `min(82vw, ${rem(370)})`
const SWIPE_THRESHOLD = 60
const BACK_SCALE = 0.94

/**
 * Desktop: wrapping row of cards.
 * Mobile (<= 48rem): a stack of cards. The front card is full size, the next
 * one sits behind it (slightly smaller, edge peeking out) and so does the previous one on the
 * other side. Swipe/drag, tap a peeking edge, or tap a dot to change card.
 */
interface Props {
  children: ReactNode[]
  /** Show prev/next arrows on the edges (disabled at the ends) */
  arrows?: boolean
  /** CSS width of each card in the stack */
  slideWidth?: string
  /** Space between the cards and the dots, in px */
  dotsMargin?: number
  /** Space between the dots, in px */
  dotsGap?: number
}

export default function CardCarousel({ children, arrows = false, slideWidth = DEFAULT_W, dotsMargin = 14, dotsGap = 6 }: Props) {
  const W = slideWidth
  // How far the card behind is pushed sideways so its edge peeks out of the front card.
  const PEEK = `calc((100vw - ${W}) / 2 + ${W} * 0.03 - ${rem(4)})`
  const isMobile = useMediaQuery(MOBILE_QUERY)
  const [active, setActive] = useState(0)
  const [dragX, setDragX] = useState(0)
  const [dragging, setDragging] = useState(false)
  const start = useRef<{ x: number; id: number } | null>(null)
  const moved = useRef(false)
  const count = children.length

  const go = (i: number) => setActive(Math.max(0, Math.min(count - 1, i)))

  if (!isMobile) {
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: rem(16), p: `${rem(12)} ${rem(14)} ${rem(8)}` }}>
        {children.map((child, i) => (
          <Box key={i} sx={{ flex: 'none', width: rem(370), maxWidth: '100%' }}>
            {child}
          </Box>
        ))}
      </Box>
    )
  }

  const onDown = (e: PointerEvent) => {
    start.current = { x: e.clientX, id: e.pointerId }
    moved.current = false
  }
  const onMove = (e: PointerEvent) => {
    if (!start.current) return
    const dx = e.clientX - start.current.x
    if (!moved.current && Math.abs(dx) > 8) {
      moved.current = true
      setDragging(true)
      try {
        ;(e.currentTarget as HTMLElement).setPointerCapture(start.current.id)
      } catch {
        /* pointer no longer active; dragging still works without capture */
      }
    }
    if (moved.current) {
      // Resist dragging past the first / last card.
      const blocked = (dx > 0 && active === 0) || (dx < 0 && active === count - 1)
      setDragX(blocked ? dx / 4 : dx)
    }
  }
  const onUp = () => {
    if (!start.current) return
    if (moved.current) {
      if (dragX < -SWIPE_THRESHOLD) go(active + 1)
      else if (dragX > SWIPE_THRESHOLD) go(active - 1)
    }
    start.current = null
    setDragging(false)
    setDragX(0)
  }

  const styleFor = (d: number) => {
    if (d === 0) {
      return { transform: `translateX(${dragX}px)`, opacity: 1, zIndex: 3, pointerEvents: 'auto' as const }
    }
    const side = d > 0 ? 1 : -1
    // Neighbours sit behind the front card, peeking out on their own side.
    if (Math.abs(d) === 1) {
      return {
        transform: `translateX(calc(${PEEK} * ${side})) scale(${BACK_SCALE})`,
        opacity: 1,
        zIndex: 2,
        pointerEvents: 'auto' as const,
      }
    }
    // Further away: tucked fully behind, invisible.
    return {
      transform: `translateX(calc(${PEEK} * ${side})) scale(${BACK_SCALE})`,
      opacity: 0,
      zIndex: 1,
      pointerEvents: 'none' as const,
    }
  }

  const arrow = (side: 'left' | 'right') => {
    const enabled = side === 'left' ? active > 0 : active < count - 1
    return (
      <Box
        component="button"
        type="button"
        aria-label={side === 'left' ? 'Previous card' : 'Next card'}
        disabled={!enabled}
        onClick={() => go(active + (side === 'left' ? -1 : 1))}
        sx={{
          position: 'absolute', top: '50%', [side]: 0, transform: 'translateY(-50%)', zIndex: 5,
          width: rem(26), height: rem(26), p: 0, borderRadius: '50%', display: 'grid', placeItems: 'center',
          cursor: enabled ? 'pointer' : 'default', transition: 'background-color .15s',
          border: enabled ? `${rem(1)} solid ${colors.sand[835]}` : 0,
          bgcolor: enabled ? colors.base.white : overlays.arrowDisabled, color: enabled ? colors.brown[180] : colors.sand[686],
          boxShadow: enabled ? shadows.arrow : 'none',
        }}
      >
        {side === 'left' ? <ChevronLeft size="0.875rem" strokeWidth={2.5} /> : <ChevronRight size="0.875rem" strokeWidth={2.5} />}
      </Box>
    )
  }

  return (
    <Box sx={{ position: 'relative' }}>
      {arrows && arrow('left')}
      {arrows && arrow('right')}
      <Box
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        // Swallow the click that ends a drag so it doesn't toggle a card.
        onClickCapture={(e) => {
          if (moved.current) {
            e.stopPropagation()
            moved.current = false
          }
        }}
        sx={{
          display: 'grid',
          justifyItems: 'center',
          alignItems: 'start',
          overflowX: 'clip',
          pt: rem(12),
          pb: rem(4),
          touchAction: 'pan-y',
          userSelect: dragging ? 'none' : 'auto',
        }}
      >
        {children.map((child, i) => {
          const d = i - active
          return (
            <Box
              key={i}
              // Tapping the edge of a card behind brings it to the front.
              onClickCapture={Math.abs(d) === 1 ? (e) => { e.stopPropagation(); go(i) } : undefined}
              sx={{
                gridArea: '1 / 1',
                width: W,
                transformOrigin: 'center',
                transition: dragging ? 'none' : 'transform .25s ease, opacity .25s ease',
                ...styleFor(d),
              }}
            >
              {child}
            </Box>
          )
        })}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: rem(dotsGap), mt: rem(dotsMargin) }}>
        {children.map((_, i) => (
          <Box
            key={i}
            component="button"
            type="button"
            aria-label={`Go to card ${i + 1}`}
            onClick={() => go(i)}
            sx={{
              p: 0, border: 0, cursor: 'pointer', height: rem(5),
              width: i === active ? rem(14) : rem(5),
              borderRadius: rem(3),
              bgcolor: i === active ? colors.brand.primary : colors.sand[843],
              transition: 'width .2s, background-color .2s',
            }}
          />
        ))}
      </Box>
    </Box>
  )
}
