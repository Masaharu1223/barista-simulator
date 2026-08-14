import { Html } from '@react-three/drei'
import {
  CONTROL_PANEL,
  COUNTER_TOP_Y,
  GROUP_HEAD,
  MACHINE_BODY,
  MACHINE_X,
  MACHINE_Z,
  PRESSURE_GAUGE,
  SPOUT_OFFSET_X,
  TRAY_Z,
} from './layout'

const COLORS = {
  shell: '#d9dce0',
  shellTrim: '#22252a',
  chrome: '#e7e9ec',
  screen: '#16181c',
  band: '#c23b2a',
  portafilter: '#141518',
  gaugeFace: '#f2ede2',
  gaugeRim: '#1c1d1f',
  plate: '#5c1c18',
  rubber: '#1a1a1c',
}

/**
 * エスプレッソマシン。プリミティブの組み合わせで、
 * 本体・カップウォーマー・グループヘッド・ポルタフィルターを表現する。
 * 実機（ステンレス+クロムの業務用マシン）の質感・ディテールに寄せてあるが、
 * 「1回にシングル/ダブルのどちらかしか抽出できない」という1グループ構成は
 * ゲームの核心ルールなので変えていない。
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
      {/* 本体。ステンレスを意識して明るめ・光沢寄りの質感にする */}
      <mesh position={[MACHINE_X, bodyCenterY, MACHINE_Z]} castShadow>
        <boxGeometry args={[MACHINE_BODY.width, MACHINE_BODY.height, MACHINE_BODY.depth]} />
        <meshStandardMaterial color={COLORS.shell} roughness={0.22} metalness={0.85} />
      </mesh>

      {/* 上面のカップウォーマー */}
      <mesh position={[MACHINE_X, COUNTER_TOP_Y + MACHINE_BODY.height + 0.015, MACHINE_Z]} castShadow>
        <boxGeometry args={[MACHINE_BODY.width + 0.04, 0.03, MACHINE_BODY.depth + 0.03]} />
        <meshStandardMaterial color={COLORS.shellTrim} roughness={0.5} metalness={0.4} />
      </mesh>

      {/*
        グループヘッド。下から順に「クロムの下部 → 黒い画面台 → 赤いリング → クロムの上部」を積む。
        画面台にはLCD表示を模した演出（下の "94.0°C"）だけを乗せ、操作ボタンは置かない。
        円柱の上に円ボタンを2つ並べると左右にはみ出して宙に浮いて見えてしまうため、
        実際の操作パネルは本体右側の平らな面（CONTROL_PANEL）にまとめて配置する。
      */}
      <mesh position={[MACHINE_X, GROUP_HEAD.lower.y, GROUP_HEAD.z]} castShadow>
        <cylinderGeometry args={[GROUP_HEAD.lower.radius, GROUP_HEAD.lower.radius, GROUP_HEAD.lower.height, 24]} />
        <meshStandardMaterial color={COLORS.chrome} roughness={0.15} metalness={0.9} />
      </mesh>
      <mesh position={[MACHINE_X, GROUP_HEAD.screen.y, GROUP_HEAD.z]} castShadow>
        <cylinderGeometry args={[GROUP_HEAD.screen.radius, GROUP_HEAD.screen.radius, GROUP_HEAD.screen.height, 24]} />
        <meshStandardMaterial color={COLORS.screen} roughness={0.4} metalness={0.15} />
      </mesh>
      <mesh position={[MACHINE_X, GROUP_HEAD.band.y, GROUP_HEAD.z]} castShadow>
        <cylinderGeometry args={[GROUP_HEAD.band.radius, GROUP_HEAD.band.radius, GROUP_HEAD.band.height, 24]} />
        <meshStandardMaterial color={COLORS.band} roughness={0.35} metalness={0.2} />
      </mesh>
      <mesh position={[MACHINE_X, GROUP_HEAD.top.y, GROUP_HEAD.z]} castShadow>
        <cylinderGeometry args={[GROUP_HEAD.top.radius, GROUP_HEAD.top.radius, GROUP_HEAD.top.height, 24]} />
        <meshStandardMaterial color={COLORS.chrome} roughness={0.15} metalness={0.9} />
      </mesh>
      {/* LCD温度表示の演出。実際の温度ロジックは持たない固定表示 */}
      <Html
        center
        distanceFactor={1.8}
        position={[MACHINE_X, GROUP_HEAD.screen.y, GROUP_HEAD.z + GROUP_HEAD.screen.radius]}
        zIndexRange={[15, 0]}
      >
        <div className="machine-screen__temp">94.0°C</div>
      </Html>

      {/* ポルタフィルター（グループヘッドに刺さったハンドル） */}
      <group position={[MACHINE_X, COUNTER_TOP_Y + 0.135, TRAY_Z]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.058, 0.052, 0.04, 20]} />
          <meshStandardMaterial color={COLORS.chrome} roughness={0.2} metalness={0.85} />
        </mesh>
        <mesh position={[0, 0.012, 0.13]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.014, 0.014, 0.17, 12]} />
          <meshStandardMaterial color={COLORS.portafilter} roughness={0.6} />
        </mesh>
        {/* ダブルスパウト：2口あるので1回の抽出で2杯ぶん取れる */}
        {[-SPOUT_OFFSET_X, SPOUT_OFFSET_X].map((offsetX) => (
          <mesh key={offsetX} position={[offsetX, -0.035, 0]} castShadow>
            <cylinderGeometry args={[0.008, 0.006, 0.035, 10]} />
            <meshStandardMaterial color={COLORS.chrome} metalness={0.85} roughness={0.2} />
          </mesh>
        ))}
      </group>

      {/* 本体側面のレバー（装飾。クリック判定は持たない） */}
      {[-1, 1].map((side) => (
        <group
          key={side}
          position={[MACHINE_X + side * (MACHINE_BODY.width / 2 + 0.02), COUNTER_TOP_Y + 0.4, MACHINE_Z + 0.1]}
          rotation={[0.5, 0, side * 0.3]}
        >
          <mesh castShadow>
            <cylinderGeometry args={[0.016, 0.016, 0.16, 12]} />
            <meshStandardMaterial color={COLORS.rubber} roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.05, 0]} castShadow>
            <cylinderGeometry args={[0.017, 0.017, 0.012, 12]} />
            <meshStandardMaterial color={COLORS.band} roughness={0.4} />
          </mesh>
        </group>
      ))}

      {/* 圧力計（装飾）。操作パネルとぶつからないよう本体右端寄りに小さめに配置する */}
      <group position={[PRESSURE_GAUGE.x, PRESSURE_GAUGE.y, MACHINE_Z + MACHINE_BODY.depth / 2 + 0.005]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[PRESSURE_GAUGE.radius, PRESSURE_GAUGE.radius, 0.012, 24]} />
          <meshStandardMaterial color={COLORS.gaugeRim} roughness={0.4} metalness={0.5} />
        </mesh>
        <mesh position={[0, 0, 0.007]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[PRESSURE_GAUGE.radius * 0.8, PRESSURE_GAUGE.radius * 0.8, 0.004, 24]} />
          <meshStandardMaterial color={COLORS.gaugeFace} roughness={0.5} />
        </mesh>
      </group>

      {/*
        操作パネルの取り付け板（装飾）。実機の写真でも、各グループヘッドのLCD画面とは別に
        本体右側にまとまった操作ボタン一式がある。板は状態に関わらず常に同じサイズなので、
        中身（MachineControls の HTML）がボタンのみ/警告文つきなどに変化しても
        筐体側とズレることはない。
      */}
      <mesh
        position={[CONTROL_PANEL.x, CONTROL_PANEL.y, CONTROL_PANEL.z - CONTROL_PANEL.depth / 2]}
        castShadow
      >
        <boxGeometry args={[CONTROL_PANEL.width, CONTROL_PANEL.height, CONTROL_PANEL.depth]} />
        <meshStandardMaterial color={COLORS.screen} roughness={0.4} metalness={0.15} />
      </mesh>

      {/*
        ブランドプレート（装飾）。実機には実在ブランドのロゴが入っているが、
        商標をそのまま複製しないよう、位置・色味だけを再現した無地のプレートにしている。
      */}
      <mesh
        position={[
          MACHINE_X - MACHINE_BODY.width / 2 + 0.14,
          COUNTER_TOP_Y + 0.32,
          MACHINE_Z + MACHINE_BODY.depth / 2 + 0.003,
        ]}
        castShadow
      >
        <boxGeometry args={[0.14, 0.035, 0.004]} />
        <meshStandardMaterial color={COLORS.plate} roughness={0.3} metalness={0.4} />
      </mesh>

      {/* ドリップトレイ（受け皿）。細い筋を重ねて溝入りの見た目にする */}
      <mesh position={[MACHINE_X, COUNTER_TOP_Y + 0.008, TRAY_Z]}>
        <boxGeometry args={[0.28, 0.016, 0.2]} />
        <meshStandardMaterial color={COLORS.chrome} metalness={0.8} roughness={0.25} />
      </mesh>
      {[-0.08, -0.04, 0, 0.04, 0.08].map((offsetX) => (
        <mesh key={offsetX} position={[MACHINE_X + offsetX, COUNTER_TOP_Y + 0.0165, TRAY_Z]}>
          <boxGeometry args={[0.012, 0.002, 0.19]} />
          <meshStandardMaterial color={COLORS.screen} roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}
