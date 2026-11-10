/** Shared easing and entry animations. Every animation here is switched off under prefers-reduced-motion. */
export const EASE = 'cubic-bezier(.2,.7,.2,1)'
const NO_MOTION = { '@media (prefers-reduced-motion: reduce)': { animation: 'none' } } as const

/** Fade + rise; `i` staggers list items (capped so long lists don't lag). */
export const fadeUp = (i = 0) => ({
  animation: `fade-up .45s ${EASE} ${Math.min(i, 8) * 0.06}s both`,
  '@keyframes fade-up': { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'none' } },
  ...NO_MOTION,
})

/** Plain fade. */
export const fadeIn = {
  animation: `fade-in .35s ease both`,
  '@keyframes fade-in': { from: { opacity: 0 }, to: { opacity: 1 } },
  ...NO_MOTION,
} as const
