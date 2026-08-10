import { Vector3 } from 'three'
import { COUNTER, COUNTER_TOP_Y } from './layout'

/**
 * ドラッグ中のポインタが指しているワールド座標。
 * 毎フレーム読むだけの値なので、ストアに入れて再レンダリングを起こすより
 * モジュール変数で共有するほうが素直で速い。
 */
export const dragPoint = new Vector3()

/** ドラッグ中のグラスを持ち上げる高さ */
export const DRAG_LIFT_Y = 0.09

const MAX_X = COUNTER.width / 2
const MIN_Z = -COUNTER.depth / 2
const MAX_Z = COUNTER.depth / 2 + 0.25

/**
 * カウンターの外へグラスが飛んでいかないように収める。
 * 俯瞰視点だと視線が水平に近く、遠くを指すと交点が何十メートル先になるため。
 */
export function clampToCounter(target: Vector3): Vector3 {
  target.x = Math.min(Math.max(target.x, -MAX_X), MAX_X)
  target.z = Math.min(Math.max(target.z, MIN_Z), MAX_Z)
  target.y = Math.max(target.y, COUNTER_TOP_Y)
  return target
}
