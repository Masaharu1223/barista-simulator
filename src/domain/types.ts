export type Size = 'M' | 'L'
export type Temp = 'hot' | 'ice'
export type DrinkType = 'latte' | 'vanilla-latte' | 'americano'
export type BrewMode = 'single' | 'double'

export type Order = {
  id: string
  drink: DrinkType
  size: Size
  temp: Temp
  /** このドリンクを完成させるのに必要なエスプレッソのショット数 */
  requiredShots: number
}

/**
 * 抽出済みのエスプレッソ1杯分。
 * ダブル抽出はこれを2個生成する（実機のダブルスパウトと同じ）ため、
 * 「ダブルを2つに分割する」という操作は存在しない。
 */
export type Shot = {
  id: string
  /** どちらのスパウトから出たか。トレイ上の置き場所がこれで決まる */
  slot: number
}

/** 注文に紐づいた作業中のカップ。注文が入った時点で1個作られる。 */
export type Cup = {
  id: string
  order: Order
  pouredShots: number
}

export type Machine =
  | { status: 'idle' }
  | { status: 'brewing'; mode: BrewMode; startedAt: number; endsAt: number }

export type Stats = {
  /** 提供したドリンクの数 */
  served: number
  /** 抽出ボタンを押した回数。少ないほど段取りが良い */
  brews: number
  /** 捨てたショットの数。少ないほど段取りが良い */
  wasted: number
}

export type GameState = {
  /** 作業台にある未提供のカップ。アクティブな注文と1:1で対応する */
  cups: Cup[]
  /** 提供台に置かれたカップ（直近のぶんだけ保持） */
  served: Cup[]
  machine: Machine
  /** マシンのトレイに残っているショット */
  trayShots: Shot[]
  stats: Stats
  /** ID採番用の連番 */
  seq: number
  /** 注文生成用の乱数シード。同じシードなら同じ注文列になる */
  rngSeed: number
}
