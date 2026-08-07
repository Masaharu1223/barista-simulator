import type { DrinkType, Size, Temp } from './types'

export const DRINK_TYPES: readonly DrinkType[] = ['latte', 'vanilla-latte', 'americano']
export const SIZES: readonly Size[] = ['M', 'L']
export const TEMPS: readonly Temp[] = ['hot', 'ice']

export const DRINK_LABELS: Record<DrinkType, string> = {
  latte: 'カフェラテ',
  'vanilla-latte': 'バニララテ',
  americano: 'アメリカーノ',
}

export const TEMP_LABELS: Record<Temp, string> = {
  hot: 'HOT',
  ice: 'ICE',
}

/** ラテ系の基準ショット数。アメリカーノはここに1足す */
const BASE_SHOTS: Record<Size, number> = { M: 1, L: 2 }

/**
 * 注文を完成させるのに必要なショット数。
 * HOT / ICE は見た目だけの違いなので、ここには影響しない。
 */
export function requiredShots(drink: DrinkType, size: Size): number {
  return BASE_SHOTS[size] + (drink === 'americano' ? 1 : 0)
}
