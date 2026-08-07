/**
 * 開発サーバーの画面を撮影して、実行時エラーの有無を確認するための道具。
 * WebGL の描画は型チェックやユニットテストでは検証できないため、
 * 見た目の確認はこのスクリプトで行う。
 *
 *   node scripts/screenshot.mjs [出力パス]
 *
 * 環境変数:
 *   APP_URL  開発サーバーのURL（既定: http://localhost:5173/）
 *   ACTIONS  操作スクリプト。カンマ区切りで click:x,y / key:e / wait:1000 を並べる
 */
import { chromium } from 'playwright'

const url = process.env.APP_URL ?? 'http://localhost:5173/'
const out = process.argv[2] ?? 'screenshot.png'
const actions = (process.env.ACTIONS ?? '')
  .split(',')
  .map((step) => step.trim())
  .filter(Boolean)

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

const logs = []
page.on('console', (msg) => logs.push(`[${msg.type()}] ${msg.text()}`))
page.on('pageerror', (error) => logs.push(`[pageerror] ${error.message}`))

await page.goto(url, { waitUntil: 'networkidle' })
// WebGL の初回描画とカメラ補間が落ち着くまで待つ
await page.waitForTimeout(2000)

for (const action of actions) {
  const [kind, value] = action.split(':')
  if (kind === 'click') {
    const [x, y] = value.split('x').map(Number)
    await page.mouse.click(x, y)
  } else if (kind === 'drag') {
    const [from, to] = value.split('>')
    const [x1, y1] = from.split('x').map(Number)
    const [x2, y2] = to.split('x').map(Number)
    await page.mouse.move(x1, y1)
    await page.mouse.down()
    await page.mouse.move(x2, y2, { steps: 20 })
    await page.mouse.up()
  } else if (kind === 'key') {
    await page.keyboard.press(value)
  } else if (kind === 'wait') {
    await page.waitForTimeout(Number(value))
  }
  await page.waitForTimeout(350)
}

await page.screenshot({ path: out })
console.log(logs.length ? logs.join('\n') : '(console clean)')

await browser.close()
