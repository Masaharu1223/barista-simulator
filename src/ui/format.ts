import type { Cup } from '../domain/types'

/**
 * 注文の表示用の番号。
 * 3Dのカップの札と画面右上の一覧で同じ番号を使い、
 * どのカップがどの注文かを対応づける。
 */
export function orderNumber(cup: Cup): string {
  return `#${cup.order.id.replace('order-', '')}`
}
