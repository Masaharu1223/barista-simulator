import { Canvas } from '@react-three/fiber'
import { useCallback, useEffect, useState } from 'react'
import { ReadySignal } from './scene/ReadySignal'
import { Scene } from './scene/Scene'
import { STATIONS, STATION_ORDER, type StationId } from './scene/stations'
import { Hud } from './ui/Hud'
import { useGameStore } from './store/useGameStore'
import './App.css'

/** 抽出の進行を状態に反映する。残り秒数の表示に足りる粒度で十分 */
function useGameClock() {
  const advanceTime = useGameStore((state) => state.advanceTime)

  useEffect(() => {
    const id = window.setInterval(() => advanceTime(Date.now()), 100)
    return () => window.clearInterval(id)
  }, [advanceTime])
}

function useStationKeys(setStation: (updater: (current: StationId) => StationId) => void) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      if (key === 'q' || key === 'e') {
        const direction = key === 'q' ? -1 : 1
        setStation((current) => {
          const index = STATION_ORDER.indexOf(current)
          if (index === -1) {
            // バー全体から寄るときは、押した方向の端のステーションへ
            return direction === -1 ? STATION_ORDER[0] : STATION_ORDER[STATION_ORDER.length - 1]
          }
          const next = Math.min(Math.max(index + direction, 0), STATION_ORDER.length - 1)
          return STATION_ORDER[next]
        })
      }
      if (key === ' ' || key === 'escape') {
        event.preventDefault()
        setStation(() => 'overview')
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [setStation])
}

export default function App() {
  const [station, setStation] = useState<StationId>('overview')
  const [ready, setReady] = useState(false)
  useGameClock()
  useStationKeys(setStation)

  const focusStation = useCallback((next: StationId) => setStation(next), [])

  return (
    <div className="app">
      <Canvas
        shadows
        camera={{ fov: 50, position: STATIONS.overview.position, near: 0.1, far: 50 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={['#181310']} />
        <Scene station={station} onFocusStation={focusStation} />
        <ReadySignal onReady={() => setReady(true)} />
      </Canvas>

      {/*
        3Dシーンの初回描画には数秒かかる。それまでは真っ黒な画面の上に
        マシン操作パネル（HTML部分）だけが先に存在し、カーソルを合わせると
        反応してしまい紛らわしいため、描画が終わるまでこのオーバーレイで覆う。
      */}
      {!ready && (
        <div className="loading-overlay">
          <div className="loading-overlay__spinner" />
          <div className="loading-overlay__text">バーを準備しています…</div>
        </div>
      )}

      <Hud />

      <div className="station-bar">
        <div className="station-bar__name">{STATIONS[station].label}</div>
        <div className="station-bar__hint">
          <kbd>Q</kbd> <kbd>E</kbd> ステーション移動 / <kbd>Space</kbd> バー全体
        </div>
      </div>
    </div>
  )
}
