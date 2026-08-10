import { forwardRef } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import type { Group, Mesh } from 'three'
import { DoubleSide } from 'three'
import { SHOT_GLASS } from './layout'

const GLASS_COLOR = '#cfd8de'
const ESPRESSO_COLOR = '#3a1a0a'

/** レイキャストの対象から外すためのダミー。掴んでいるグラスに使う */
const NO_RAYCAST = () => null

type Props = {
  position?: [number, number, number]
  /** 中身の量（0〜1）。抽出中は下から上がっていく */
  fill?: number
  highlight?: boolean
  liquidRef?: React.Ref<Mesh>
  /**
   * false にするとポインタ判定から外れる。
   * 掴んでいるグラスがドロップ先へのレイを遮らないようにするために使う。
   */
  interactive?: boolean
  onPointerDown?: (event: ThreeEvent<PointerEvent>) => void
}

/**
 * 抽出したエスプレッソが入るショットグラス。
 * 液体は高さ1の円柱を scale.y で伸ばす作りにして、
 * 抽出中に毎フレーム滑らかに増やせるようにしている。
 */
export const ShotGlassMesh = forwardRef<Group, Props>(function ShotGlassMesh(
  { position = [0, 0, 0], fill = 1, highlight = false, liquidRef, interactive = true, onPointerDown },
  ref,
) {
  const { radius, height } = SHOT_GLASS
  const liquidHeight = Math.max(0.0001, fill * height * 0.8)
  const raycast = interactive ? undefined : NO_RAYCAST

  return (
    <group ref={ref} position={position} onPointerDown={onPointerDown}>
      <mesh position={[0, height / 2, 0]} castShadow raycast={raycast}>
        <cylinderGeometry args={[radius, radius * 0.78, height, 20, 1, true]} />
        <meshStandardMaterial
          color={GLASS_COLOR}
          roughness={0.1}
          metalness={0.1}
          transparent
          opacity={0.58}
          side={DoubleSide}
        />
      </mesh>
      <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]} raycast={raycast}>
        <circleGeometry args={[radius * 0.78, 20]} />
        <meshStandardMaterial color="#b9c4cc" side={DoubleSide} />
      </mesh>

      {/* 中身。高さ1のジオメトリを scale.y で伸ばす */}
      <mesh
        ref={liquidRef}
        position={[0, liquidHeight / 2 + 0.003, 0]}
        scale={[1, liquidHeight, 1]}
        raycast={raycast}
      >
        <cylinderGeometry args={[radius * 0.86, radius * 0.74, 1, 20]} />
        <meshStandardMaterial color={ESPRESSO_COLOR} roughness={0.25} />
      </mesh>

      {highlight && (
        <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]} raycast={NO_RAYCAST}>
          <ringGeometry args={[radius + 0.008, radius + 0.022, 24]} />
          <meshBasicMaterial color="#ffd18a" transparent opacity={0.9} side={DoubleSide} />
        </mesh>
      )}
    </group>
  )
})
