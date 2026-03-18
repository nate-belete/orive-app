/**
 * Colour matching utility — compares wardrobe item colours against
 * the user's seasonal colour palette.
 */

import type { ColourPalette, ColourSwatch } from './api/types'

/**
 * Colour keywords mapped from common colour names to broad hue families.
 * This allows fuzzy matching between item colour strings and palette swatches.
 */
const COLOUR_FAMILIES: Record<string, string[]> = {
  red: ['red', 'crimson', 'scarlet', 'ruby', 'cherry', 'burgundy', 'wine', 'maroon', 'berry', 'brick', 'rust', 'oxblood'],
  orange: ['orange', 'tangerine', 'peach', 'coral', 'terracotta', 'amber', 'rust', 'burnt sienna', 'apricot'],
  yellow: ['yellow', 'gold', 'mustard', 'lemon', 'saffron', 'honey', 'maize', 'buttercup'],
  green: ['green', 'olive', 'sage', 'emerald', 'forest', 'moss', 'mint', 'lime', 'chartreuse', 'teal', 'hunter', 'khaki', 'jade', 'pine'],
  blue: ['blue', 'navy', 'cobalt', 'sky', 'royal', 'baby blue', 'denim', 'indigo', 'cerulean', 'sapphire', 'steel', 'powder'],
  purple: ['purple', 'violet', 'lavender', 'plum', 'lilac', 'mauve', 'amethyst', 'eggplant', 'grape', 'fuchsia', 'magenta'],
  pink: ['pink', 'rose', 'blush', 'salmon', 'coral', 'fuchsia', 'magenta', 'hot pink', 'dusty pink', 'mauve'],
  brown: ['brown', 'tan', 'camel', 'chocolate', 'coffee', 'mocha', 'espresso', 'chestnut', 'sienna', 'umber', 'hazel', 'taupe', 'cognac'],
  white: ['white', 'cream', 'ivory', 'off-white', 'ecru', 'vanilla', 'snow', 'pearl', 'alabaster'],
  black: ['black', 'charcoal', 'onyx', 'jet', 'ebony'],
  grey: ['grey', 'gray', 'silver', 'slate', 'ash', 'pewter', 'steel', 'graphite', 'smoke'],
  beige: ['beige', 'sand', 'khaki', 'oatmeal', 'fawn', 'buff', 'biscuit', 'nude'],
}

/**
 * Get the colour family(ies) a colour name belongs to.
 */
function getColourFamilies(colourName: string): string[] {
  const lower = colourName.toLowerCase().trim()
  const families: string[] = []
  for (const [family, keywords] of Object.entries(COLOUR_FAMILIES)) {
    if (keywords.some((kw) => lower.includes(kw) || kw.includes(lower))) {
      families.push(family)
    }
  }
  return families
}

/**
 * Check if two colour strings are in the same colour family.
 */
function coloursRelated(a: string, b: string): boolean {
  const familiesA = getColourFamilies(a)
  const familiesB = getColourFamilies(b)
  return familiesA.some((f) => familiesB.includes(f))
}

export type ColourMatch = 'great' | 'neutral' | 'avoid' | 'unknown'

/**
 * Match a wardrobe item's colour against a palette.
 * Returns 'great' if it matches best colours/neutrals,
 * 'avoid' if it matches avoid colours,
 * 'neutral' for basic neutrals (black, white, grey),
 * 'unknown' if no match found.
 */
export function matchColourToPalette(
  itemColour: string,
  palette: ColourPalette | null | undefined
): ColourMatch {
  if (!palette || !itemColour) return 'unknown'

  const lower = itemColour.toLowerCase().trim()

  // Universal neutrals are always safe
  const universalNeutrals = ['black', 'white', 'grey', 'gray', 'denim']
  if (universalNeutrals.some((n) => lower.includes(n))) return 'neutral'

  // Check against avoid colours first
  const avoidMatch = palette.avoid_colours?.some((swatch: ColourSwatch) =>
    coloursRelated(itemColour, swatch.name)
  )
  if (avoidMatch) return 'avoid'

  // Check against best colours
  const bestMatch = palette.best_colours?.some((swatch: ColourSwatch) =>
    coloursRelated(itemColour, swatch.name)
  )
  if (bestMatch) return 'great'

  // Check against best neutrals
  const neutralMatch = palette.best_neutrals?.some((swatch: ColourSwatch) =>
    coloursRelated(itemColour, swatch.name)
  )
  if (neutralMatch) return 'great'

  return 'unknown'
}

/**
 * Get display properties for a colour match result.
 */
export function getMatchDisplay(match: ColourMatch) {
  switch (match) {
    case 'great':
      return {
        label: 'In Palette',
        dotClass: 'bg-emerald-400',
        textClass: 'text-emerald-600',
        bgClass: 'bg-emerald-50',
      }
    case 'avoid':
      return {
        label: 'Off Palette',
        dotClass: 'bg-red-400',
        textClass: 'text-red-600',
        bgClass: 'bg-red-50',
      }
    case 'neutral':
      return {
        label: 'Universal Neutral',
        dotClass: 'bg-gray-400',
        textClass: 'text-gray-500',
        bgClass: 'bg-gray-50',
      }
    case 'unknown':
    default:
      return {
        label: '',
        dotClass: '',
        textClass: '',
        bgClass: '',
      }
  }
}
