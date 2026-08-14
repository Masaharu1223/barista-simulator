import {
  COUNTER_TOP_Y,
  MACHINE_BODY,
  MACHINE_SCREEN_Y,
  MACHINE_X,
  MACHINE_Z,
  SPOUT_OFFSET_X,
  TRAY_Z,
} from './layout'

const COLORS = {
  shell: '#c3c7cb',
  top: '#22252a',
  panel: '#1b1e22',
  group: '#8d9196',
  portafilter: '#141518',
}

/**
 * エスプレッソマシン。プリミティブの組み合わせで、
 * 本体・カップウォーマー・グループヘッド・ポルタフィルターを表現する。
 */
export function EspressoMachine({ onSelect }: { onSelect?: () => void }) {
  const bodyCenterY = COUNTER_TOP_Y + MACHINE_BODY.height / 2

  return (
    <group
      onClick={(event) => {
        if (!onSelect) return
        event.stopPropagation()
        onSelect()
      }}
    >
      {/* 本体 */}
      <mesh position={[MACHINE_X, bodyCenterY, MACHINE_Z]} castShadow>
        <boxGeometry args={[MACHINE_BODY.width, MACHINE_BODY.height, MACHINE_BODY.depth]} />
        <meshStandardMaterial color={COLORS.shell} roughness={0.35} metalness={0.65} />
      </mesh>

      {/* 上面のカップウォーマー */}
      <mesh position={[MACHINE_X, COUNTER_TOP_Y + MACHINE_BODY.height + 0.015, MACHINE_Z]} castShadow>
        <boxGeometry args={[MACHINE_BODY.width + 0.04, 0.03, MACHINE_BODY.depth + 0.03]} />
        <meshStandardMaterial color={COLORS.top} roughness={0.5} metalness={0.4} />
      </mesh>

      {/* 前面の黒いパネル。操作パネル（MachineControls）が重なる場所なので、高さは MACHINE_SCREEN_Y に揃えてある */}
      <mesh position={[MACHINE_X, MACHINE_SCREEN_Y, MACHINE_Z + MACHINE_BODY.depth / 2]}>
        <boxGeometry args={[MACHINE_BODY.width - 0.06, 0.2, 0.01]} />
        <meshStandardMaterial color={COLORS.panel} roughness={0.4} />
      </mesh>

      {/* グループヘッド。本体から前へ突き出し、真下にグラスが置けるようにする */}
      <mesh position={[MACHINE_X, COUNTER_TOP_Y + 0.19, TRAY_Z - 0.02]} castShadow>
        <cylinderGeometry args={[0.062, 0.062, 0.09, 20]} />
        <meshStandardMaterial color={COLORS.group} roughness={0.3} metalness={0.75} />
      </mesh>

      {/* ポルタフィルター（グループヘッドに刺さったハンドル） */}
      <group position={[MACHINE_X, COUNTER_TOP_Y + 0.135, TRAY_Z]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.058, 0.052, 0.04, 20]} />
          <meshStandardMaterial color={COLORS.group} roughness={0.3} metalness={0.75} />
        </mesh>
        <mesh position={[0, 0.012, 0.13]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.014, 0.014, 0.17, 12]} />
          <meshStandardMaterial color={COLORS.portafilter} roughness={0.6} />
        </mesh>
        {/* ダブルスパウト：2口あるので1回の抽出で2杯ぶん取れる */}
        {[-SPOUT_OFFSET_X, SPOUT_OFFSET_X].map((offsetX) => (
          <mesh key={offsetX} position={[offsetX, -0.035, 0]} castShadow>
            <cylinderGeometry args={[0.008, 0.006, 0.035, 10]} />
            <meshStandardMaterial color={COLORS.group} metalness={0.8} roughness={0.25} />
          </mesh>
        ))}
      </group>

      {/* ドリップトレイ（受け皿）。抽出したショットはこの上、スパウトの真下に出る */}
      <mesh position={[MACHINE_X, COUNTER_TOP_Y + 0.008, TRAY_Z]}>
        <boxGeometry args={[0.28, 0.016, 0.2]} />
        <meshStandardMaterial color={COLORS.group} metalness={0.7} roughness={0.35} />
      </mesh>
    </group>
  )
}
