import { describe, expect, it } from 'vitest'
import {
  MAX_ACTIVE_ORDERS,
  cancelBrew,
  canServe,
  canStartBrew,
  createInitialState,
  discardShot,
  pourShot,
  serveCup,
  startBrew,
  tick,
} from './game'
import { BREW_DURATION_MS } from './machine'
import { requiredShots } from './recipe'
import type { Cup, DrinkType, GameState, Size, Temp } from './types'

const T0 = 1_000_000

/** マシンを1回動かしてトレイにショットを出す */
function brew(state: GameState, mode: 'single' | 'double', at = T0): GameState {
  const brewing = startBrew(state, mode, at)
  return tick(brewing, at + BREW_DURATION_MS[mode])
}

/**
 * 注文の中身を指定して初期状態を作る。
 * 乱数シードに依存させるとテストが偶然の注文列に左右されるため、
 * 特定のレシピを前提にする検証ではこちらを使う。
 */
function stateWithOrders(specs: Array<[DrinkType, Size, Temp]>): GameState {
  const cups: Cup[] = specs.map(([drink, size, temp], index) => ({
    id: `cup-fixed-${index + 1}`,
    order: {
      id: `order-fixed-${index + 1}`,
      drink,
      size,
      temp,
      requiredShots: requiredShots(drink, size),
    },
    pouredShots: 0,
  }))
  return { ...createInitialState(1), cups }
}

/** 先頭3件が1ショットで済む注文、4件目だけ3ショット必要な状態 */
function fourSingleShotOrders(): GameState {
  return stateWithOrders([
    ['latte', 'M', 'hot'],
    ['latte', 'M', 'ice'],
    ['vanilla-latte', 'M', 'hot'],
    ['americano', 'L', 'ice'],
  ])
}

describe('初期状態', () => {
  it('注文がキューの上限まで並び、それぞれにカップが用意される', () => {
    const s = createInitialState(42)
    expect(s.cups).toHaveLength(MAX_ACTIVE_ORDERS)
    expect(s.cups.every((c) => c.pouredShots === 0)).toBe(true)
  })

  it('同じシードなら同じ注文列になる', () => {
    const a = createInitialState(7)
    const b = createInitialState(7)
    expect(a.cups.map((c) => c.order.drink)).toEqual(b.cups.map((c) => c.order.drink))
    expect(a.cups.map((c) => c.order.size)).toEqual(b.cups.map((c) => c.order.size))
  })

  it('カップの必要ショット数はレシピ表と一致する', () => {
    const s = createInitialState(3)
    for (const cup of s.cups) {
      const base = cup.order.size === 'L' ? 2 : 1
      const expected = cup.order.drink === 'americano' ? base + 1 : base
      expect(cup.order.requiredShots).toBe(expected)
    }
  })
})

describe('抽出', () => {
  it('シングルは25秒、ダブルは30秒かかる', () => {
    expect(BREW_DURATION_MS.single).toBe(25_000)
    expect(BREW_DURATION_MS.double).toBe(30_000)
  })

  it('抽出中は次の抽出を開始できない', () => {
    const s = startBrew(createInitialState(1), 'single', T0)
    expect(canStartBrew(s)).toBe(false)

    const retried = startBrew(s, 'double', T0 + 1_000)
    expect(retried.machine).toEqual(s.machine)
    expect(retried.stats.brews).toBe(1)
  })

  it('抽出時間が経過するまでショットは出てこない', () => {
    const s = startBrew(createInitialState(1), 'single', T0)
    const early = tick(s, T0 + BREW_DURATION_MS.single - 1)
    expect(early.trayShots).toHaveLength(0)
    expect(early.machine.status).toBe('brewing')
  })

  it('シングル抽出でショットが1個出る', () => {
    const s = brew(createInitialState(1), 'single')
    expect(s.trayShots).toHaveLength(1)
    expect(s.machine.status).toBe('idle')
  })

  it('ダブル抽出でショットが2個出る', () => {
    const s = brew(createInitialState(1), 'double')
    expect(s.trayShots).toHaveLength(2)
    expect(s.trayShots[0].id).not.toBe(s.trayShots[1].id)
  })

  it('ショットはスパウトごとの置き場所を持ち、1つ取り出しても残りは動かない', () => {
    let s = brew(createInitialState(1), 'double')
    expect(s.trayShots.map((shot) => shot.slot)).toEqual([0, 1])

    const secondShot = s.trayShots[1]
    s = discardShot(s, s.trayShots[0].id)
    expect(s.trayShots).toEqual([secondShot])
    expect(s.trayShots[0].slot).toBe(1)
  })

  it('トレイにショットが残っている間は次の抽出を開始できない', () => {
    const s = brew(createInitialState(1), 'double')
    expect(canStartBrew(s)).toBe(false)

    const blocked = startBrew(s, 'single', T0 + 60_000)
    expect(blocked.machine.status).toBe('idle')
    expect(blocked.stats.brews).toBe(1)
  })

  it('トレイを空にすれば次の抽出を開始できる', () => {
    let s = brew(createInitialState(1), 'double')
    s = discardShot(s, s.trayShots[0].id)
    s = discardShot(s, s.trayShots[0].id)
    expect(canStartBrew(s)).toBe(true)
  })
})

describe('抽出の中止', () => {
  it('シングル抽出中に中止すると、即座にショットが1個トレイに出てマシンが idle になる', () => {
    const s = startBrew(createInitialState(1), 'single', T0)
    const canceled = cancelBrew(s)

    expect(canceled.machine.status).toBe('idle')
    expect(canceled.trayShots).toHaveLength(1)
  })

  it('ダブル抽出中に中止すると、ショットが2個(slot 0,1)出る', () => {
    const s = startBrew(createInitialState(1), 'double', T0)
    const canceled = cancelBrew(s)

    expect(canceled.trayShots.map((shot) => shot.slot)).toEqual([0, 1])
  })

  it('抽出中でない(idle)ときは何も変わらない', () => {
    const s = createInitialState(1)
    expect(cancelBrew(s)).toEqual(s)
  })

  it('中止しても抽出回数は変わらない(startBrew 時点で加算済み)', () => {
    const s = startBrew(createInitialState(1), 'double', T0)
    const canceled = cancelBrew(s)
    expect(canceled.stats.brews).toBe(1)
  })

  it('中止しても廃棄数は変わらない(discardShot 経由でのみ増える)', () => {
    const s = startBrew(createInitialState(1), 'single', T0)
    const canceled = cancelBrew(s)
    expect(canceled.stats.wasted).toBe(0)
  })

  it('中止後はトレイが埋まっているので次の抽出を開始できない', () => {
    const s = startBrew(createInitialState(1), 'single', T0)
    const canceled = cancelBrew(s)
    expect(canStartBrew(canceled)).toBe(false)
  })

  it('中止後に元の終了時刻で tick を呼んでも追加のショットは生成されない', () => {
    const s = startBrew(createInitialState(1), 'single', T0)
    const canceled = cancelBrew(s)
    const ticked = tick(canceled, T0 + BREW_DURATION_MS.single)
    expect(ticked.trayShots).toHaveLength(1)
  })
})

describe('ショットを注ぐ', () => {
  it('注ぐとカップのショット数が増え、トレイからショットが消える', () => {
    const s = brew(createInitialState(1), 'single')
    const cup = s.cups[0]
    const poured = pourShot(s, s.trayShots[0].id, cup.id)

    expect(poured.trayShots).toHaveLength(0)
    expect(poured.cups[0].pouredShots).toBe(1)
  })

  it('必要数を満たしたカップには注げず、ショットはトレイに残る', () => {
    let s = fourSingleShotOrders()
    const target = s.cups[0] // M ラテ＝1ショットで満杯になる

    s = brew(s, 'double')
    s = pourShot(s, s.trayShots[0].id, target.id)
    expect(s.cups.find((c) => c.id === target.id)!.pouredShots).toBe(1)

    const rejected = pourShot(s, s.trayShots[0].id, target.id)
    expect(rejected.trayShots).toHaveLength(1)
    expect(rejected.cups.find((c) => c.id === target.id)!.pouredShots).toBe(1)
  })

  it('存在しないショットやカップを指定しても状態は変わらない', () => {
    const s = brew(createInitialState(1), 'single')
    expect(pourShot(s, 'shot-does-not-exist', s.cups[0].id)).toEqual(s)
    expect(pourShot(s, s.trayShots[0].id, 'cup-does-not-exist')).toEqual(s)
  })
})

describe('ショットの廃棄', () => {
  it('捨てたショットは廃棄カウンタに計上される', () => {
    const s = brew(createInitialState(1), 'single')
    const discarded = discardShot(s, s.trayShots[0].id)

    expect(discarded.trayShots).toHaveLength(0)
    expect(discarded.stats.wasted).toBe(1)
  })
})

describe('提供', () => {
  it('必要数に満たないカップは提供できない', () => {
    const s = createInitialState(1)
    expect(canServe(s, s.cups[0].id)).toBe(false)
    expect(serveCup(s, s.cups[0].id)).toEqual(s)
  })

  it('必要数を満たすと提供でき、新しい注文が補充される', () => {
    let s = fourSingleShotOrders()
    const target = s.cups[0]

    s = brew(s, 'single')
    s = pourShot(s, s.trayShots[0].id, target.id)
    expect(canServe(s, target.id)).toBe(true)

    const servedState = serveCup(s, target.id)
    expect(servedState.cups.some((c) => c.id === target.id)).toBe(false)
    expect(servedState.cups).toHaveLength(MAX_ACTIVE_ORDERS)
    expect(servedState.stats.served).toBe(1)
    expect(servedState.served[0].id).toBe(target.id)
  })
})

describe('段取りの評価', () => {
  it('Mサイズのラテ2杯はダブル1回で無駄なく作れる', () => {
    // レシピ上 M ラテ = 1ショット。ダブル1回＝ショット2個で2杯ぶんになる
    let s = fourSingleShotOrders()
    const targets = s.cups.slice(0, 2)

    s = brew(s, 'double')
    s = pourShot(s, s.trayShots[0].id, targets[0].id)
    s = pourShot(s, s.trayShots[0].id, targets[1].id)

    expect(s.trayShots).toHaveLength(0)
    expect(s.stats.brews).toBe(1)
    expect(s.stats.wasted).toBe(0)
    for (const t of targets) {
      expect(canServe(s, t.id)).toBe(true)
    }
  })
})
