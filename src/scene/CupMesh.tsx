import type { ThreeEvent } from '@react-three/fiber'
import { DoubleSide } from 'three'
import type { Cup } from '../domain/types'
import { CUP_SIZE } from './layout'

const ESPRESSO_COLOR = '#3c1c0c'
const CREMA_COLOR = '#a8703a'

type Props = {
  cup: Cup
  position: [number, number, number]
  /** ドラッグ中に、注げる相手かどうかを足元のリングで示す */
  highlight?: 'none' | 'valid' | 'invalid'
  onPointerUp?: (event: ThreeEvent<PointerEvent>) => void
  onClick?: (event: ThreeEvent<MouseEvent>) => void
}

/**
 * 作業中のカップ。
 * HOT は白い紙カップ、ICE は中が透けるプラカップとして描き分ける。
 * 注いだショットの量は液面の高さで見えるようにしている。
 */
export function CupMesh({ cup, position, highlight = 'none', onPointerUp, onClick }: Props) {
  const { radius, height } = CUP_SIZE[cup.order.size]
  const isIce = cup.order.temp === 'ice'
  const bottomRadius = radius * 0.82

  const ratio = Math.min(1, cup.pouredShots / cup.order.requiredShots)
  const liquidHeight = Math.max(0.001, ratio * height * 0.78)
  const liquidRadius = bottomRadius + (radius - bottomRadius) * (liquidHeight / height) - 0.002

  // 捨て先（ノックボックス）の印と紛れないよう、注げない印ははっきりした赤にする
  const ringColor =
    highlight === 'valid' ? '#6ee7a0' : highlight === 'invalid' ? '#e03434' : null

  return (
    <group position={position} onPointerUp={onPointerUp} onClick={onClick}>
      {/* カップの側面。openEnded にして中の液体が見えるようにする */}
      <mesh position={[0, height / 2, 0]} castShadow>
        <cylinderGeometry args={[radius, bottomRadius, height, 28, 1, true]} />
        <meshStandardMaterial
          color={isIce ? '#dbe7ee' : '#f4f1e9'}
          roughness={isIce ? 0.15 : 0.75}
          transparent={isIce}
          opacity={isIce ? 0.45 : 1}
          side={DoubleSide}
        />
      </mesh>

      {/* 底 */}
      <mesh position={[0, 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[bottomRadius, 28]} />
        <meshStandardMaterial color={isIce ? '#c8d8e2' : '#e6e1d6'} side={DoubleSide} />
      </mesh>

      {/* 注がれたエスプレッソ */}
      {cup.pouredShots > 0 && (
        <group>
          <mesh position={[0, liquidHeight / 2 + 0.004, 0]}>
            <cylinderGeometry args={[liquidRadius, bottomRadius - 0.002, liquidHeight, 28]} />
            <meshStandardMaterial color={ESPRESSO_COLOR} roughness={0.25} />
          </mesh>
          {/* 表面のクレマ */}
          <mesh position={[0, liquidHeight + 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[liquidRadius, 28]} />
            <meshStandardMaterial color={CREMA_COLOR} roughness={0.5} />
          </mesh>
        </group>
      )}

      {/* ドロップ可否のハイライト */}
      {ringColor && (
        <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius + 0.012, radius + 0.03, 32]} />
          <meshBasicMaterial color={ringColor} transparent opacity={0.85} side={DoubleSide} />
        </mesh>
      )}
    </group>
  )
}
