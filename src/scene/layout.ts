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

/**
 * マシン前面の黒い装飾パネル（ディスプレイ風の見た目）の中心高さ。
 * 操作パネル（MACHINE_PANEL）もここに揃えることで、
 * 「マシンの画面に操作パネルが表示されている」ように見せる。
 * 別々の式で計算すると、この2つが一致しているかを見た目でしか検証できず、
 * ずれに気づきにくいので1か所にまとめている。
 */
export const MACHINE_SCREEN_Y = COUNTER_TOP_Y + MACHINE_BODY.height - 0.11

/** 操作パネルを貼り付けるマシン前面の位置。装飾パネルと同じ高さに揃える */
export const MACHINE_PANEL = {
  y: MACHINE_SCREEN_Y,
  z: MACHINE_Z + MACHINE_BODY.depth / 2 + 0.02,
}

/** ポルタフィルターのスパウトの位置。抽出したショットはこの真下に出る */
export const SPOUT_OFFSET_X = 0.045
export const TRAY_Z = MACHINE_Z + MACHINE_BODY.depth / 2 + 0.07
export const TRAY_SLOT_X = [MACHINE_X - SPOUT_OFFSET_X, MACHINE_X + SPOUT_OFFSET_X]

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
