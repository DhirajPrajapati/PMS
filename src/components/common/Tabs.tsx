import { Box, ButtonBase } from '@mui/material'
import { useEffect, useRef } from 'react'
import { rem } from '../../utils/format'
import { colors } from '../../theme'

interface Props<T extends string> {
  items: readonly T[]
  value: T
  onChange: (tab: T) => void
  /** Horizontal padding of the strip, px */
  px?: number
  ariaLabel?: string
}

/** Underlined tab strip. Scrolls sideways (scrollbar hidden) when the tabs don't fit. */
export default function Tabs<T extends string>({ items, value, onChange, px = 21, ariaLabel }: Props<T>) {
  const strip = useRef<HTMLDivElement>(null)
  // Keep the selected tab visible on narrow screens, with a smooth scroll.
  useEffect(() => {
    const el = strip.current?.querySelector<HTMLElement>('[aria-selected="true"]')
    const box = strip.current
    if (!el || !box || box.scrollWidth <= box.clientWidth) return
    const left = el.offsetLeft - (box.clientWidth - el.offsetWidth) / 2
    box.scrollTo({ left: Math.max(0, left), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }, [value])
  return (
    <Box
      ref={strip}
      role="tablist"
      aria-label={ariaLabel}
      sx={{
        display: 'flex', gap: rem(25), px: rem(px), overflowX: 'auto', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
        bgcolor: colors.base.white, borderBottom: `${rem(1)} solid ${colors.border.default}`,
      }}
    >
      {items.map((t) => {
        const on = t === value
        return (
          <ButtonBase
            key={t}
            role="tab"
            aria-selected={on}
            onClick={() => onChange(t)}
            sx={{
              flexShrink: 0, height: rem(44), position: 'relative', fontFamily: 'inherit',
              fontSize: { xs: rem(12.4), sm: rem(13.3) }, fontWeight: on ? 700 : 500,
              color: on ? colors.brand.accent : colors.text.mutedWarm, transition: 'color .15s',
              '&::after': {
                content: '""', position: 'absolute', left: 0, right: 0, bottom: 0, height: rem(3), borderRadius: `${rem(3)} ${rem(3)} 0 0`,
                bgcolor: colors.brand.accent, transform: on ? 'scaleX(1)' : 'scaleX(0)', transition: 'transform .2s',
              },
            }}
          >
            {t}
          </ButtonBase>
        )
      })}
    </Box>
  )
}
