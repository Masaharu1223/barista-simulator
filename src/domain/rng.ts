/**
 * mulberry32 ベースの決定的な擬似乱数。
 * 注文の生成をテストで再現できるようにシードを状態として持ち回す。
 */
export function nextInt(seed: number, max: number): [value: number, nextSeed: number] {
  const nextSeed = (seed + 0x6d2b79f5) | 0
  let t = nextSeed
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  const unit = ((t ^ (t >>> 14)) >>> 0) / 4294967296
  return [Math.floor(unit * max), nextSeed]
}
