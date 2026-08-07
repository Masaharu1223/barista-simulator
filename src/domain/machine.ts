import type { BrewMode } from './types'

/**
 * 抽出にかかる時間。実時間で待つ仕様なので短縮しない。
 * 乱数にせず固定値にしているのは、プレイヤーが段取りを計算できるようにするため。
 */
export const BREW_DURATION_MS: Record<BrewMode, number> = {
  single: 25_000,
  double: 30_000,
}

/**
 * 1回の抽出で出てくるショットの数。
 * ダブルは2個出る＝別々のカップに注げる。これが段取りを考える余地を生む。
 */
export const SHOTS_PER_BREW: Record<BrewMode, number> = {
  single: 1,
  double: 2,
}

export const BREW_MODE_LABELS: Record<BrewMode, string> = {
  single: 'シングル',
  double: 'ダブル',
}
