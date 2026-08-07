import { Html } from '@react-three/drei'
import { useState } from 'react'
import { canStartBrew, remainingBrewMs } from '../domain/game'
import { BREW_DURATION_MS, BREW_MODE_LABELS } from '../domain/machine'
import { useGameStore } from '../store/useGameStore'
import type { BrewMode } from '../domain/types'
import { MACHINE_PANEL } from './EspressoMachine'
import { MACHINE_X } from './layout'

/** パネルの表示倍率。マシンの幅にちょうど収まるよう実画面で合わせた値 */
const PANEL_SCALE = 0.1

export function MachineControls() {
  const game = useGameStore((state) => state.game)
  const now = useGameStore((state) => state.now)
  const startBrew = useGameStore((state) => state.startBrew)
  const [mode, setMode] = useState<BrewMode>('single')

  const brewing = game.machine.status === 'brewing'
  const ready = canStartBrew(game)
  const remaining = remainingBrewMs(game, now)
  const progress =
    game.machine.status === 'brewing'
      ? 1 - remaining / BREW_DURATION_MS[game.machine.mode]
      : 0

  const blockedReason = brewing
    ? null
    : game.trayShots.length > 0
      ? 'トレイのショットを片付けてください'
      : null

  return (
    <Html
      transform
      position={[MACHINE_X, MACHINE_PANEL.y, MACHINE_PANEL.z]}
      scale={PANEL_SCALE}
      zIndexRange={[20, 0]}
    >
      <div className="machine-panel">
        <div className="machine-panel__modes">
          {(['single', 'double'] as const).map((candidate) => (
            <button
              key={candidate}
              type="button"
              className={`mode-button${mode === candidate ? ' mode-button--active' : ''}`}
              onClick={() => setMode(candidate)}
              disabled={brewing}
            >
              <span className="mode-button__label">{BREW_MODE_LABELS[candidate]}</span>
              <span className="mode-button__meta">
                {BREW_DURATION_MS[candidate] / 1000}秒 / {candidate === 'double' ? '2' : '1'}ショット
              </span>
            </button>
          ))}
        </div>

        {brewing ? (
          <div className="machine-panel__status">
            <div className="brew-progress">
              <div className="brew-progress__bar" style={{ width: `${progress * 100}%` }} />
            </div>
            <div className="brew-progress__text">
              抽出中 残り {(remaining / 1000).toFixed(1)} 秒
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="brew-button"
            onClick={() => startBrew(mode)}
            disabled={!ready}
          >
            抽出する
          </button>
        )}

        {blockedReason && <div className="machine-panel__blocked">{blockedReason}</div>}
      </div>
    </Html>
  )
}
