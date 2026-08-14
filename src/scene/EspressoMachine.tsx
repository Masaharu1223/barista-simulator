import { COUNTER_TOP_Y, GROUP_HEAD, MACHINE_BODY, MACHINE_X, MACHINE_Z, SPOUT_OFFSET_X, TRAY_Z } from './layout'

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
        画面台は固定サイズの筐体だけを担当し、実際に状態が変わる操作パネル（MachineControls）は
        その正面に HTML オーバーレイとして重ねる。3D側の静的メッシュとHTMLの動的な内容・サイズを
        競合させないため。
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

      {/* 圧力計（装飾） */}
      <group
        position={[
          MACHINE_X + MACHINE_BODY.width / 2 - 0.08,
          COUNTER_TOP_Y + 0.32,
          MACHINE_Z + MACHINE_BODY.depth / 2 + 0.005,
        ]}
      >
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.045, 0.012, 24]} />
          <meshStandardMaterial color={COLORS.gaugeRim} roughness={0.4} metalness={0.5} />
        </mesh>
        <mesh position={[0, 0, 0.007]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.036, 0.036, 0.004, 24]} />
          <meshStandardMaterial color={COLORS.gaugeFace} roughness={0.5} />
        </mesh>
      </group>

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
