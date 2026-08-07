import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Mesh } from 'three'
import { BREW_DURATION_MS, SHOTS_PER_BREW } from '../domain/machine'
import { useGameStore } from '../store/useGameStore'
import { ShotGlassMesh } from './ShotGlassMesh'
import { COUNTER_TOP_Y, MACHINE_X, SHOT_GLASS, TRAY_SLOT_X, TRAY_Z } from './layout'

/** ドリップトレイの上面。ショットグラスはこの高さに置かれる */
export const TRAY_SURFACE_Y = COUNTER_TOP_Y + 0.016

/** スパウトの出口の高さ。ここからグラスへエスプレッソが落ちる */
const SPOUT_Y = COUNTER_TOP_Y + 0.1

/**
 * 抽出中のグラス1つ分。
 * 液面とエスプレッソの筋は useFrame で直接メッシュを動かす。
 * ストアを購読して再レンダリングすると 100ms 刻みのカクついた動きになるため。
 */
function BrewingGlass({ index }: { index: number }) {
  const liquidRef = useRef<Mesh>(null)
  const streamRef = useRef<Mesh>(null)
  const streamHeight = SPOUT_Y - (TRAY_SURFACE_Y + SHOT_GLASS.height * 0.5)

  useFrame(() => {
    const machine = useGameStore.getState().game.machine
    if (machine.status !== 'brewing') return

    const elapsed = Date.now() - machine.startedAt
    const progress = Math.min(1, Math.max(0, elapsed / BREW_DURATION_MS[machine.mode]))

    if (liquidRef.current) {
      const height = Math.max(0.0001, progress * SHOT_GLASS.height * 0.8)
      liquidRef.current.scale.y = height
      liquidRef.current.position.y = height / 2 + 0.003
    }
    if (streamRef.current) {
      // 抽出の終わり際は流量が落ちるので細く見せる
      streamRef.current.visible = progress < 0.99
      const thinning = 1 - Math.max(0, progress - 0.75) * 2.4
      const scale = Math.max(0.25, thinning)
      streamRef.current.scale.set(scale, 1, scale)
    }
  })

  return (
    <group>
      <ShotGlassMesh
        position={[TRAY_SLOT_X[index], TRAY_SURFACE_Y, TRAY_Z]}
        fill={0}
        liquidRef={liquidRef}
      />
      <mesh ref={streamRef} position={[TRAY_SLOT_X[index], SPOUT_Y - streamHeight / 2, TRAY_Z]}>
        <cylinderGeometry args={[0.0035, 0.003, streamHeight, 8]} />
        <meshStandardMaterial color="#5a2c12" roughness={0.2} transparent opacity={0.9} />
      </mesh>
    </group>
  )
}

/** 抽出中の演出。ダブルなら2口から同時に落ちる */
export function BrewingShots() {
  const machine = useGameStore((state) => state.game.machine)
  const glasses = machine.status === 'brewing' ? SHOTS_PER_BREW[machine.mode] : 0

  return (
    <group>
      {Array.from({ length: glasses }, (_, index) => (
        <BrewingGlass key={index} index={index} />
      ))}
    </group>
  )
}

/** 抽出が終わってトレイに残っているショット。掴んで運ぶ対象になる */
export function TrayShots() {
  const trayShots = useGameStore((state) => state.game.trayShots)
  const heldShotId = useGameStore((state) => state.heldShotId)
  const holdShot = useGameStore((state) => state.holdShot)

  return (
    <group>
      {trayShots.map((shot, index) =>
        shot.id === heldShotId ? null : (
          <ShotGlassMesh
            key={shot.id}
            position={[TRAY_SLOT_X[index] ?? MACHINE_X, TRAY_SURFACE_Y, TRAY_Z]}
            fill={1}
            onPointerDown={(event) => {
              event.stopPropagation()
              holdShot(shot.id)
            }}
          />
        ),
      )}
    </group>
  )
}
