/**
 * シーン内の座標を1か所に集めたもの。
 * 3Dの見た目とドラッグの当たり判定が同じ数値を参照するようにして、
 * 「見えている場所」と「掴める場所」がずれないようにする。
 */

/** カウンター天板の高さ。物を置く面はすべてこの高さになる */
export const COUNTER_TOP_Y = 0.95

export const COUNTER = {
  width: 3.6,
  depth: 0.9,
  topThickness: 0.06,
}

/** エスプレッソマシン */
export const MACHINE_X = -1.05
export const MACHINE_Z = -0.14
export const MACHINE_BODY = { width: 0.85, height: 0.52, depth: 0.46 }

/** ポルタフィルターのスパウトの位置。抽出したショットはこの真下に出る */
export const SPOUT_OFFSET_X = 0.045
export const TRAY_Z = MACHINE_Z + MACHINE_BODY.depth / 2 + 0.07
export const TRAY_SLOT_X = [MACHINE_X - SPOUT_OFFSET_X, MACHINE_X + SPOUT_OFFSET_X]

/**
 * グループヘッド。本体前面から突き出す、抽出部一式。
 * ポルタフィルターの位置（COUNTER_TOP_Y+0.135, TRAY_Z）は変えず、そこから
 * 上へ「クロムの下部 → 黒い画面部分 → 赤いリング → クロムの上部」と積む。
 * 画面部分は固定サイズの筐体で、実際に状態が変わる操作パネル（MachineControls）は
 * その正面に HTML オーバーレイとして重ねるだけにする
 * （3D側の静的メッシュとHTMLの動的な内容・サイズを競合させない）。
 */
const GROUP_HEAD_Z = TRAY_Z - 0.02

export const GROUP_HEAD = {
  z: GROUP_HEAD_Z,
  lower: { radius: 0.06, height: 0.1, y: COUNTER_TOP_Y + 0.205 },
  screen: { radius: 0.07, height: 0.06, y: COUNTER_TOP_Y + 0.285 },
  band: { radius: 0.072, height: 0.012, y: COUNTER_TOP_Y + 0.322 },
  top: { radius: 0.075, height: 0.1, y: COUNTER_TOP_Y + 0.377 },
}

/** 操作パネル（MachineControls）を貼り付ける位置。グループヘッドの「画面」部分の正面 */
export const MACHINE_PANEL = {
  y: GROUP_HEAD.screen.y,
  z: GROUP_HEAD.z + GROUP_HEAD.screen.radius,
}

/** 余ったショットを捨てるノックボックス */
export const KNOCK_BOX = { x: -0.5, z: 0.26, radius: 0.1, height: 0.16 }

/** 作業台のカップが並ぶ位置。注文キューの上限と同じ数だけある */
export const CUP_SLOT_X = [-0.2, 0.13, 0.46, 0.79]
export const CUP_Z = 0.02

/** 提供台。天板の上に一段高い台がある */
export const SERVE_COUNTER = { x: 1.32, z: 0.0, width: 0.6, depth: 0.5, height: 0.09 }
export const SERVE_SLOT_X = [1.14, 1.32, 1.5]

/** カップの寸法。L は M より一回り大きい */
export const CUP_SIZE = {
  M: { radius: 0.041, height: 0.112 },
  L: { radius: 0.047, height: 0.142 },
} as const

/** ショットグラスの寸法。掴める大きさに見えるよう実寸よりやや大きめ */
export const SHOT_GLASS = { radius: 0.032, height: 0.072 }
