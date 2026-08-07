import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import { Vector3 } from 'three'
import { STATIONS, type StationId } from './stations'

const desiredPosition = new Vector3()
const desiredTarget = new Vector3()

/**
 * ステーション間をカメラを滑らかに動かす。
 * 注視点も一緒に補間しないと、切り替えの途中で視線が飛んで酔いやすくなる。
 */
export function CameraRig({ station }: { station: StationId }) {
  const camera = useThree((state) => state.camera)
  const lookAt = useRef(new Vector3(...STATIONS.overview.target))

  useFrame((_, delta) => {
    const preset = STATIONS[station]
    // フレームレートに依存しない指数補間
    const k = 1 - Math.exp(-delta * 6)

    desiredPosition.set(...preset.position)
    desiredTarget.set(...preset.target)

    camera.position.lerp(desiredPosition, k)
    lookAt.current.lerp(desiredTarget, k)
    camera.lookAt(lookAt.current)
  })

  return null
}
