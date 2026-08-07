import { COUNTER, COUNTER_TOP_Y, KNOCK_BOX, SERVE_COUNTER } from './layout'

const COLORS = {
  floor: '#241f1c',
  wall: '#4d3d33',
  counterTop: '#6b4a2f',
  counterBody: '#412c1c',
  serveTop: '#8a6b45',
  knockBox: '#5c5f66',
}

/** 床と壁。カウンターの奥に立って見える背景 */
function Room() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color={COLORS.floor} roughness={0.95} />
      </mesh>
      <mesh position={[0, 1.6, -1.9]} receiveShadow>
        <planeGeometry args={[9, 3.6]} />
        <meshStandardMaterial color={COLORS.wall} roughness={0.9} />
      </mesh>
    </group>
  )
}

/** バーカウンター本体 */
function Counter() {
  const bodyHeight = COUNTER_TOP_Y - COUNTER.topThickness

  return (
    <group>
      <mesh position={[0, bodyHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[COUNTER.width, bodyHeight, COUNTER.depth]} />
        <meshStandardMaterial color={COLORS.counterBody} roughness={0.85} />
      </mesh>
      <mesh
        position={[0, COUNTER_TOP_Y - COUNTER.topThickness / 2, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[COUNTER.width + 0.08, COUNTER.topThickness, COUNTER.depth + 0.06]} />
        <meshStandardMaterial color={COLORS.counterTop} roughness={0.6} metalness={0.05} />
      </mesh>
    </group>
  )
}

/** 余ったショットを捨てるノックボックス */
export function KnockBox() {
  return (
    <group position={[KNOCK_BOX.x, COUNTER_TOP_Y, KNOCK_BOX.z]}>
      <mesh position={[0, KNOCK_BOX.height / 2, 0]} castShadow>
        <cylinderGeometry
          args={[KNOCK_BOX.radius, KNOCK_BOX.radius * 0.88, KNOCK_BOX.height, 24]}
        />
        <meshStandardMaterial color={COLORS.knockBox} roughness={0.5} metalness={0.3} />
      </mesh>
      {/* 内側が空洞に見えるように、少し沈んだ暗い面を置く */}
      <mesh position={[0, KNOCK_BOX.height - 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[KNOCK_BOX.radius * 0.82, 24]} />
        <meshStandardMaterial color="#0d0c0c" roughness={1} />
      </mesh>
    </group>
  )
}

/** 完成したドリンクを置く提供台 */
export function ServeCounter() {
  return (
    <group position={[SERVE_COUNTER.x, COUNTER_TOP_Y, SERVE_COUNTER.z]}>
      <mesh position={[0, SERVE_COUNTER.height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[SERVE_COUNTER.width, SERVE_COUNTER.height, SERVE_COUNTER.depth]} />
        <meshStandardMaterial color={COLORS.serveTop} roughness={0.55} />
      </mesh>
    </group>
  )
}

export function Cafe() {
  return (
    <group>
      <Room />
      <Counter />
      <KnockBox />
      <ServeCounter />
    </group>
  )
}
