import { Html } from '@react-three/drei'
import type { Cup } from '../domain/types'
import { DRINK_SHORT_LABELS } from '../domain/recipe'
import { useGameStore } from '../store/useGameStore'
import { orderNumber } from '../ui/format'
import { CupMesh } from './CupMesh'
import { COUNTER_TOP_Y, CUP_SLOT_X, CUP_Z, SERVE_COUNTER, SERVE_SLOT_X } from './layout'

/**
 * カップの手前に出す小さな札。
 * 何ショット必要かは操作に直結するので3Dの側に置き、
 * 注文の詳細は画面右上の一覧に任せて横幅を詰めている。
 * 完成したカップでは、そのまま提供ボタンに変わる。
 */
function CupLabel({ cup, onServe }: { cup: Cup; onServe: () => void }) {
  const done = cup.pouredShots >= cup.order.requiredShots

  return (
    <Html center distanceFactor={1.8} position={[0, -0.012, 0.085]} zIndexRange={[10, 0]}>
      {done ? (
        <button type="button" className="serve-button" onClick={onServe}>
          {orderNumber(cup)} 提供する
        </button>
      ) : (
        <div className={`cup-label cup-label--${cup.order.temp}`}>
          <span className="cup-label__no">{orderNumber(cup)}</span>
          <span className="cup-label__drink">
            {DRINK_SHORT_LABELS[cup.order.drink]}
            {cup.order.size}
          </span>
          <span className="cup-label__shots">
            {cup.pouredShots}/{cup.order.requiredShots}
          </span>
        </div>
      )}
    </Html>
  )
}

/** 作業台に並ぶ、注文ごとのカップ */
export function Workbench() {
  const cups = useGameStore((state) => state.game.cups)
  const heldShotId = useGameStore((state) => state.heldShotId)
  const pourHeldShot = useGameStore((state) => state.pourHeldShot)
  const serve = useGameStore((state) => state.serve)
  const dragging = heldShotId !== null

  return (
    <group>
      {cups.map((cup, index) => {
        const acceptsShot = cup.pouredShots < cup.order.requiredShots
        return (
          <group key={cup.id} position={[CUP_SLOT_X[index] ?? 0, COUNTER_TOP_Y, CUP_Z]}>
            <CupMesh
              cup={cup}
              position={[0, 0, 0]}
              // ドラッグ中は全カップに可否を出す。都度ホバーを見るより分かりやすい
              highlight={dragging ? (acceptsShot ? 'valid' : 'invalid') : 'none'}
              onPointerUp={(event) => {
                if (!dragging) return
                event.stopPropagation()
                pourHeldShot(cup.id)
              }}
            />
            <CupLabel cup={cup} onServe={() => serve(cup.id)} />
          </group>
        )
      })}
    </group>
  )
}

/** 提供台に置かれた完成済みのカップ */
export function ServedCups() {
  const served = useGameStore((state) => state.game.served)

  return (
    <group>
      {served.map((cup, index) => (
        <CupMesh
          key={cup.id}
          cup={cup}
          position={[SERVE_SLOT_X[index] ?? SERVE_COUNTER.x, COUNTER_TOP_Y + SERVE_COUNTER.height, SERVE_COUNTER.z]}
        />
      ))}
    </group>
  )
}
