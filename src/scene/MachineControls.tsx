import { Html } from '@react-three/drei'
import { canStartBrew, remainingBrewMs } from '../domain/game'
import { BREW_DURATION_MS, BREW_MODE_LABELS } from '../domain/machine'
import { useGameStore } from '../store/useGameStore'
import { MACHINE_PANEL, MACHINE_X } from './layout'

/** パネルの表示倍率。マシンの幅にちょうど収まるよう実画面で合わせた値 */
const PANEL_SCALE = 0.1

/**
 * マシン前面のボタン。選ぶ/押すの2段階にせず、
 * シングル・ダブルそれぞれのボタンを押した時点でそのまま抽出が始まる。
 * 大きな囲み（カード背景）は持たず、ボタン自体がマシンに直接ついている見た目にする。
 */
export function MachineControls() {
  const game = useGameStore((state) => state.game)
  const now = useGameStore((state) => state.now)
  const startBrew = useGameStore((state) => state.startBrew)

  const brewing = game.machine.status === 'brewing'
  const ready = canStartBrew(game)
  const remaining = remainingBrewMs(game, now)
  const progress =
    game.machine.status === 'brewing'
      ? 1 - remaining / BREW_DURATION_MS[game.machine.mode]
      : 0

  const blockedReason = !brewing && game.trayShots.length > 0 ? 'トレイのショットを片付けてください' : null

  return (
    <Html transform position={[MACHINE_X, MACHINE_PANEL.y, MACHINE_PANEL.z]} scale={PANEL_SCALE} zIndexRange={[20, 0]}>
      {brewing ? (
        <div className="brew-status">
          <div className="brew-progress">
            <div className="brew-progress__bar" style={{ width: `${progress * 100}%` }} />
          </div>
          <div className="brew-progress__text">抽出中 残り {(remaining / 1000).toFixed(1)} 秒</div>
        </div>
      ) : (
        <div className="machine-buttons">
          {(['single', 'double'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              className="brew-select-button"
              onClick={() => startBrew(mode)}
              disabled={!ready}
            >
              <span className="brew-select-button__label">{BREW_MODE_LABELS[mode]}</span>
              <span className="brew-select-button__meta">
                {BREW_DURATION_MS[mode] / 1000}秒 / {mode === 'double' ? '2' : '1'}ショット
              </span>
            </button>
          ))}
        </div>
      )}

      {blockedReason && <div className="machine-blocked">{blockedReason}</div>}
    </Html>
  )
}
