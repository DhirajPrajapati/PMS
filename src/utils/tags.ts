import { colors } from '../theme'
export interface TagStyle {
  /** Solid pill background (list view) */
  bg: string
  /** Text colour */
  fg: string
  /** Gradient for the card's corner tab */
  from: string
  to: string
}

const TAGS: Record<string, TagStyle> = {
  PMS: { bg: colors.rose[949], fg: colors.red[301], from: colors.rose[935], to: colors.rose[863] },
  AIF: { bg: colors.cream[941], fg: colors.brown[325], from: colors.cream[928], to: colors.sand[818] },
}

/** Colours for a product-type tag ("PMS", "AIF", ...). Unknown types use the PMS look. */
export const tagStyle = (tag: string): TagStyle => TAGS[tag.toUpperCase()] ?? TAGS.PMS
