import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import type { Group } from 'three'
import { useGameStore } from '../store/useGameStore'
import { ShotGlassMesh } from './ShotGlassMesh'
import { COUNTER, COUNTER_TOP_Y } from './layout'
import { DRAG_LIFT_Y, clampToCounter, dragPoint } from './dragState'

/**
 * ポインタの位置を拾うための面。
 * 天板の少し上に水平に置き、掴んだグラスはこの面の上を滑る。
 * 透明なマテリアルにしているのは、visible={false} のメッシュが
 * ポインタイベントを受け取らないため。
 */
function DragSurface() {
  return (
    <mesh
      position={[0, COUNTER_TOP_Y + DRAG_LIFT_Y, 0.1]}
      rotation={[-Math.PI / 2, 0, 0]}
      onPointerMove={(event) => {
        dragPoint.copy(event.point)
        clampToCounter(dragPoint)
      }}
    >
      <planeGeometry args={[COUNTER.width + 2, COUNTER.depth + 2]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  )
}

/** 掴んでいるショット。ポインタに追従する */
function HeldShot() {
  const ref = useRef<Group>(null)
  const volume = useGameStore(
    (state) => state.game.trayShots.find((shot) => shot.id === state.heldShotId)?.volume ?? 1,
  )

  useFrame(() => {
    if (ref.current) ref.current.position.copy(dragPoint)
  })

  return <ShotGlassMesh ref={ref} fill={volume} interactive={false} highlight />
}

/**
 * ドラッグ中だけ有効になる層。
 * ドロップ先（カップ・ノックボックス）は自分の onPointerUp で処理するので、
 * ここでは「どこにも落とさなかった場合に手放す」後始末だけを見る。
 */
export function DragLayer() {
  const heldShotId = useGameStore((state) => state.heldShotId)
  const holdShot = useGameStore((state) => state.holdShot)

  useEffect(() => {
    if (heldShotId === null) return

    // ドロップ先のハンドラ（React のイベント）が先に走るので、
    // ここに来た時点でまだ掴んだままなら「空振り」だったということ
    const release = () => holdShot(null)
    window.addEventListener('pointerup', release)
    return () => window.removeEventListener('pointerup', release)
  }, [heldShotId, holdShot])

  if (heldShotId === null) return null

  return (
    <group>
      <DragSurface />
      <HeldShot />
    </group>
  )
}
