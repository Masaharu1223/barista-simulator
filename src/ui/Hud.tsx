import { DRINK_LABELS, TEMP_LABELS } from '../domain/recipe'
import { useGameStore } from '../store/useGameStore'
import { orderNumber } from './format'

/**
 * 画面右上の注文一覧。
 * 3D側のカップには番号と残りショット数しか出していないので、
 * 何を作るのかはここで確認する。
 */
function OrderQueue() {
  const cups = useGameStore((state) => state.game.cups)

  return (
    <div className="order-queue">
      <div className="order-queue__title">オーダー</div>
      <ul className="order-queue__list">
        {cups.map((cup) => {
          const done = cup.pouredShots >= cup.order.requiredShots
          return (
            <li key={cup.id} className={`order-row${done ? ' order-row--done' : ''}`}>
              <span className="order-row__no">{orderNumber(cup)}</span>
              <span className="order-row__drink">{DRINK_LABELS[cup.order.drink]}</span>
              <span className="order-row__size">{cup.order.size}</span>
              <span className={`order-row__temp order-row__temp--${cup.order.temp}`}>
                {TEMP_LABELS[cup.order.temp]}
              </span>
              <span className="order-row__shots">
                {cup.pouredShots}/{cup.order.requiredShots}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/**
 * 画面左上の成績。
 * 抽出回数と廃棄数が「無駄なく段取りできたか」を表す指標になる。
 */
function Stats() {
  const stats = useGameStore((state) => state.game.stats)
  const reset = useGameStore((state) => state.reset)

  return (
    <div className="stats">
      <div className="stats__row">
        <span className="stats__label">提供</span>
        <span className="stats__value">{stats.served}</span>
      </div>
      <div className="stats__row">
        <span className="stats__label">抽出</span>
        <span className="stats__value">{stats.brews}</span>
      </div>
      <div className="stats__row stats__row--warn">
        <span className="stats__label">廃棄</span>
        <span className="stats__value">{stats.wasted}</span>
      </div>
      <button type="button" className="stats__reset" onClick={reset}>
        やり直す
      </button>
    </div>
  )
}

export function Hud() {
  return (
    <>
      <Stats />
      <OrderQueue />
    </>
  )
}
