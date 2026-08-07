import { create } from 'zustand'
import {
  createInitialState,
  discardShot,
  pourShot,
  serveCup,
  startBrew,
  tick,
} from '../domain/game'
import type { BrewMode, GameState } from '../domain/types'

type GameStore = {
  game: GameState
  /** 100ms ごとに更新される現在時刻。残り秒数の表示にだけ使う */
  now: number
  /** 掴んでいるショットのID。3D側のドラッグ操作が設定する */
  heldShotId: string | null

  advanceTime: (now: number) => void
  startBrew: (mode: BrewMode) => void
  holdShot: (shotId: string | null) => void
  pourHeldShot: (cupId: string) => void
  discardHeldShot: () => void
  serve: (cupId: string) => void
  reset: () => void
}

export const useGameStore = create<GameStore>((set) => ({
  game: createInitialState(),
  now: Date.now(),
  heldShotId: null,

  // game の参照は抽出が完了した瞬間だけ変わるので、
  // now だけを購読していないコンポーネントは100msごとの再描画を免れる
  advanceTime: (now) => set((s) => ({ now, game: tick(s.game, now) })),

  startBrew: (mode) => set((s) => ({ game: startBrew(s.game, mode, Date.now()) })),

  holdShot: (shotId) => set({ heldShotId: shotId }),

  pourHeldShot: (cupId) =>
    set((s) => {
      if (s.heldShotId === null) return s
      return { game: pourShot(s.game, s.heldShotId, cupId), heldShotId: null }
    }),

  discardHeldShot: () =>
    set((s) => {
      if (s.heldShotId === null) return s
      return { game: discardShot(s.game, s.heldShotId), heldShotId: null }
    }),

  serve: (cupId) => set((s) => ({ game: serveCup(s.game, cupId) })),

  reset: () => set({ game: createInitialState(), heldShotId: null, now: Date.now() }),
}))
