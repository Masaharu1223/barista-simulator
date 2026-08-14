import { BREW_DURATION_MS, SHOTS_PER_BREW } from './machine'
import { DRINK_TYPES, SIZES, TEMPS, requiredShots } from './recipe'
import { nextInt } from './rng'
import type { BrewMode, Cup, GameState, Order, Shot } from './types'

/** 同時に抱える注文の数 */
export const MAX_ACTIVE_ORDERS = 4

/** 提供台に見えているカップの数 */
export const SERVED_DISPLAY_LIMIT = 3

export function createInitialState(seed = Date.now()): GameState {
  return fillOrders({
    cups: [],
    served: [],
    machine: { status: 'idle' },
    trayShots: [],
    stats: { served: 0, brews: 0, wasted: 0 },
    seq: 0,
    rngSeed: seed | 0,
  })
}

/** 注文キューが上限に達するまで注文を補充する */
function fillOrders(state: GameState): GameState {
  let next = state
  while (next.cups.length < MAX_ACTIVE_ORDERS) {
    next = addOrder(next)
  }
  return next
}

function addOrder(state: GameState): GameState {
  let seed = state.rngSeed
  const pick = <T,>(items: readonly T[]): T => {
    const [index, nextSeed] = nextInt(seed, items.length)
    seed = nextSeed
    return items[index]
  }

  const drink = pick(DRINK_TYPES)
  const size = pick(SIZES)
  const temp = pick(TEMPS)
  const seq = state.seq + 1

  const order: Order = {
    id: `order-${seq}`,
    drink,
    size,
    temp,
    requiredShots: requiredShots(drink, size),
  }
  const cup: Cup = { id: `cup-${seq}`, order, pouredShots: 0 }

  return { ...state, cups: [...state.cups, cup], seq, rngSeed: seed }
}

/**
 * 抽出を開始できるか。
 * 抽出中でないことに加えて、トレイが空であることを求める。
 * 出したショットを片付けてから次を引く、というバリスタのリズムを強制する。
 */
export function canStartBrew(state: GameState): boolean {
  return state.machine.status === 'idle' && state.trayShots.length === 0
}

export function startBrew(state: GameState, mode: BrewMode, now: number): GameState {
  if (!canStartBrew(state)) return state
  return {
    ...state,
    machine: { status: 'brewing', mode, startedAt: now, endsAt: now + BREW_DURATION_MS[mode] },
    stats: { ...state.stats, brews: state.stats.brews + 1 },
  }
}

/**
 * 抽出中に「もう一度ボタンを押す」で呼ばれる中止処理。
 * 待った分だけ得をする抜け道にならないよう、ショットは一切出さずにマシンを
 * idle へ戻すだけにする。完了間際に中止しても満タンのショットが出てしまうと、
 * 実時間で待つという核心のルールをすり抜けられてしまうため。
 */
export function cancelBrew(state: GameState): GameState {
  if (state.machine.status !== 'brewing') return state
  return { ...state, machine: { status: 'idle' } }
}

/**
 * 時間の経過を状態に反映する。抽出が終わっていればトレイにショットを出す。
 * 時刻を引数で受け取ることで、テストから任意の時刻を与えられる。
 */
export function tick(state: GameState, now: number): GameState {
  const machine = state.machine
  if (machine.status !== 'brewing' || now < machine.endsAt) return state

  const shots: Shot[] = []
  let seq = state.seq
  for (let i = 0; i < SHOTS_PER_BREW[machine.mode]; i += 1) {
    seq += 1
    // slot はスパウトの位置。1つ取り出しても残りが動かないよう、
    // 並び順ではなくショット自身が置き場所を持つ
    shots.push({ id: `shot-${seq}`, slot: i })
  }

  return {
    ...state,
    machine: { status: 'idle' },
    trayShots: [...state.trayShots, ...shots],
    seq,
  }
}

/** 抽出中に残り何ミリ秒かを返す。抽出していなければ0 */
export function remainingBrewMs(state: GameState, now: number): number {
  if (state.machine.status !== 'brewing') return 0
  return Math.max(0, state.machine.endsAt - now)
}

export function findCup(state: GameState, cupId: string): Cup | undefined {
  return state.cups.find((cup) => cup.id === cupId)
}

/** そのカップがまだショットを受け取れるか */
export function canPour(state: GameState, cupId: string): boolean {
  const cup = findCup(state, cupId)
  return cup !== undefined && cup.pouredShots < cup.order.requiredShots
}

/**
 * トレイのショットをカップに注ぐ。
 * 満杯のカップに落とした場合は何も起きない＝ショットはトレイに残ったままになる。
 */
export function pourShot(state: GameState, shotId: string, cupId: string): GameState {
  if (!state.trayShots.some((shot) => shot.id === shotId)) return state
  if (!canPour(state, cupId)) return state

  return {
    ...state,
    trayShots: state.trayShots.filter((shot) => shot.id !== shotId),
    cups: state.cups.map((cup) =>
      cup.id === cupId ? { ...cup, pouredShots: cup.pouredShots + 1 } : cup,
    ),
  }
}

/**
 * 余ったショットを捨てる。
 * トレイが空でないと次の抽出ができないため、これがないと詰む場面が出る。
 */
export function discardShot(state: GameState, shotId: string): GameState {
  if (!state.trayShots.some((shot) => shot.id === shotId)) return state
  return {
    ...state,
    trayShots: state.trayShots.filter((shot) => shot.id !== shotId),
    stats: { ...state.stats, wasted: state.stats.wasted + 1 },
  }
}

export function canServe(state: GameState, cupId: string): boolean {
  const cup = findCup(state, cupId)
  return cup !== undefined && cup.pouredShots >= cup.order.requiredShots
}

/**
 * カップを提供台に出し、空いた枠に新しい注文を入れる。
 * 提供の入口はこの関数ひとつに集約してあるので、
 * 将来カップのドラッグ&ドロップで提供する場合もここを呼ぶだけで済む。
 */
export function serveCup(state: GameState, cupId: string): GameState {
  const cup = findCup(state, cupId)
  if (cup === undefined || !canServe(state, cupId)) return state

  return fillOrders({
    ...state,
    cups: state.cups.filter((c) => c.id !== cupId),
    served: [cup, ...state.served].slice(0, SERVED_DISPLAY_LIMIT),
    stats: { ...state.stats, served: state.stats.served + 1 },
  })
}
