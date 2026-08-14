import { Html } from '@react-three/drei'
import type { CSSProperties } from 'react'
import { canStartBrew, remainingBrewMs } from '../domain/game'
import { BREW_DURATION_MS, BREW_MODE_LABELS } from '../domain/machine'
import type { BrewMode } from '../domain/types'
import { useGameStore } from '../store/useGameStore'
import { MACHINE_PANEL } from './layout'

/**
 * マシン本体右側の操作パネル（CONTROL_PANEL）に付いている円ボタン。
 * 押すとそのモードで抽出が始まり、抽出中に同じボタンをもう一度押すと中止できる。
 * 中止するとその時点までの進捗の量でショットがトレイに残るが、満タンにはならないため
 * カップへは注げない（＝待たずに済ませるズルにはならない）。ノックボックスへ捨ててから
 * 改めて正しいボタンで抽出をやり直す。
 *
 * グループヘッドの円柱の上にこのボタンを直接乗せると、ボタンの方が幅広く左右に
 * はみ出してしまい「宙に浮いている」ように見えてしまったため、本体右側の平らな面
 * （固定サイズの取り付け板 CONTROL_PANEL）にまとめて配置している。
 *
 * `transform` モードは画面のズーム率/表示倍率によって位置計算が崩れることがあるため、
 * カップラベル（Workbench.tsx）と同じ `center` + `distanceFactor` 方式にしている。
 */
export function MachineControls() {
  const game = useGameStore((state) => state.game)
  const now = useGameStore((state) => state.now)
  const startBrew = useGameStore((state) => state.startBrew)
  const cancelBrew = useGameStore((state) => state.cancelBrew)

  const brewing = game.machine.status === 'brewing'
  const activeMode = game.machine.status === 'brewing' ? game.machine.mode : null
  const ready = canStartBrew(game)
  const remaining = remainingBrewMs(game, now)
  const progress =
    game.machine.status === 'brewing'
      ? 1 - remaining / BREW_DURATION_MS[game.machine.mode]
      : 0

  const blockedReason = !brewing && game.trayShots.length > 0 ? 'トレイのショットを片付けてください' : null

  function handlePress(mode: BrewMode) {
    if (game.machine.status === 'brewing' && game.machine.mode === mode) {
      cancelBrew()
      return
    }
    if (!brewing) startBrew(mode)
  }

  return (
    <Html
      center
      distanceFactor={1.8}
      position={[MACHINE_PANEL.x, MACHINE_PANEL.y, MACHINE_PANEL.z]}
      zIndexRange={[20, 0]}
    >
      <div className="machine-buttons">
        {(['single', 'double'] as const).map((mode) => {
          const isActive = activeMode === mode
          const disabled = (brewing && !isActive) || (!brewing && !ready)
          const ringStyle: CSSProperties | undefined = isActive
            ? ({ '--progress': `${progress * 360}deg` } as CSSProperties)
            : undefined

          return (
            <div key={mode} className={`brew-mode-ring${isActive ? ' brew-mode-ring--active' : ''}`} style={ringStyle}>
              <button type="button" className="brew-select-button" onClick={() => handlePress(mode)} disabled={disabled}>
                {BREW_MODE_LABELS[mode]}
              </button>
              {isActive && <div className="brew-remaining">{(remaining / 1000).toFixed(1)}s</div>}
            </div>
          )
        })}
      </div>

      {blockedReason && <div className="machine-blocked">{blockedReason}</div>}
    </Html>
  )
}
