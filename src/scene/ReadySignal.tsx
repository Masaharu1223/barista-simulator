import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'

/**
 * シーンの初回フレームが描画された瞬間に一度だけ onReady を呼ぶ。
 * ロード中オーバーレイを消すタイミングに使う。
 */
export function ReadySignal({ onReady }: { onReady: () => void }) {
  const fired = useRef(false)

  useFrame(() => {
    if (fired.current) return
    fired.current = true
    onReady()
  })

  return null
}
