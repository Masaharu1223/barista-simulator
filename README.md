![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![React](https://img.shields.io/badge/-ReactJs-61DAFB?logo=react&logoColor=white&style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=threedotjs&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-433E38?style=for-the-badge&logo=react&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)

# バリスタシミュレーター

カフェのバリスタ業務を1人称視点(3D)で体験する Web アプリ。中心にあるのは「入ってきた複数の注文を見て、エスプレッソの抽出回数を最小にする段取りを組む」というパズル性です。マシンは1回にシングルかダブルのどちらかしか抽出できず、抽出には実時間で25〜30秒かかります。ダブル抽出では1ショット×2個が出るので、それをどの注文にどう振り分けるかがプレイの核になります。

## 使用技術一覧

| 分類 | 技術 | バージョン |
|---|---|---|
| ビルドツール | Vite | ^8.2.0 |
| フレームワーク | React | ^19.2.8 |
| 言語 | TypeScript | ~6.0.2 |
| 3D描画 | three.js | ^0.185.1 |
| Reactバインディング | @react-three/fiber | ^9.7.0 |
| 3Dヘルパー | @react-three/drei | ^10.7.8 |
| 状態管理 | Zustand | ^5.0.14 |
| テスト | Vitest | ^4.1.10 |
| Lint | oxlint | ^1.75.0 |
| E2E/撮影確認 | Playwright | ^1.62.1 |

> `@react-three/fiber` は **v9 系**を使用しています。v8 系は React 19 と組み合わせて動作しないため、依存関係を更新する際は互換性を確認してください。

## プロジェクト概要

1人称視点で、エスプレッソマシン・作業台・提供台が並ぶバーカウンターに立ち、ドリンクを作成するシミュレーターです。抽出したショットをドラッグしてカップへ注ぎ、必要数を満たしたら提供します。抽出回数と廃棄ショット数が少ないほど、段取りが良いという評価になります。

### 遊び方

1. 画面右上のオーダーを見て、必要なショット数を数える
2. マシンでシングル（25秒／1ショット）かダブル（30秒／2ショット）を選び、抽出する
3. 抽出が終わったらショットグラスを掴んで、カップにドラッグして注ぐ
4. 必要数が揃うと「提供する」ボタンが出るので、押して提供台へ出す
5. 余ったショットはノックボックスに捨てる（廃棄数に計上される）

### 操作

| 操作 | 内容 |
|---|---|
| ドラッグ | ショットグラスを掴んでカップやノックボックスへ運ぶ |
| <kbd>Q</kbd> <kbd>E</kbd> | ステーション間を移動（マシン ⇄ 作業台 ⇄ 提供台） |
| <kbd>Space</kbd> | バー全体を見渡す視点に戻る |

### ドリンクのレシピ

| ドリンク | M | L |
|---|---|---|
| カフェラテ | 1 shot | 2 shot |
| バニララテ | 1 shot | 2 shot |
| アメリカーノ | 2 shot | 3 shot |

- HOT / ICE は見た目だけの違いで、必要ショット数は変わらない
- マシンは1回に1抽出だけ。抽出中は次を始められない
- トレイにショットが残っている間は次の抽出を始められない（片付けてから次を引く）
- 必要数を満たしたカップには注げない

## 必要な環境変数・コマンドの一覧

### 環境変数

このプロジェクトは環境変数を使用しません（バックエンド・外部APIなし、クライアント完結の構成です）。

### コマンド

`package.json` の `scripts` に定義されているもののみです。

| コマンド | 内容 |
|---|---|
| `npm run dev` | 開発サーバーを起動 |
| `npm run build` | 型チェック（`tsc -b`）＋本番ビルド |
| `npm run preview` | ビルド成果物をローカルでプレビュー |
| `npm test` | ドメインロジックのユニットテストを実行（Vitest） |
| `npm run test:watch` | テストをウォッチモードで実行 |
| `npm run lint` | oxlint による静的解析 |

### 動作確認用の補助機能

- URL に `?seed=7` のようにクエリを付けると、注文列を固定して再現できます（動作確認や、同じ条件での段取り比較に利用）
- WebGL の描画は型チェックでもユニットテストでも検証できないため、画面確認用に `scripts/screenshot.mjs`（Playwright）を用意しています

  ```bash
  # 開発サーバーを起動した状態で
  APP_URL="http://localhost:5173/?seed=7" node scripts/screenshot.mjs out.png

  # 操作を与えてから撮る（click / drag / hold / key / wait をカンマ区切りで）
  APP_URL="http://localhost:5173/?seed=7" \
    ACTIONS="click:337x455,wait:26000,drag:325x505>650x480" \
    node scripts/screenshot.mjs out.png
  ```

## ディレクトリ構成

```
.
├── index.html          エントリーHTML
├── public/              静的ファイル（favicon 等）
├── scripts/
│   └── screenshot.mjs   画面確認用のPlaywright撮影スクリプト
├── src/
│   ├── domain/          ゲームのルール。純粋TSで、Three.js に依存しない
│   ├── store/           Zustand ストア。domain の関数を束ねる
│   ├── scene/           3D シーン（React Three Fiber）
│   ├── ui/              画面端の HUD（注文一覧・成績）
│   ├── App.tsx          ルートコンポーネント
│   └── main.tsx         エントリーポイント
└── tasks/
    └── todo.md          実装計画・進捗・レビュー記録
```

ルールはすべて `src/domain/` に閉じていて、`npm test` はこの層だけを対象にしています。3D 側はそれを表示して操作を渡すだけの役割です。状態管理に Zustand を使っているのは、`<Canvas>` が独立した React ルートになり React Context が境界を越えないためです。

## 開発環境の構築手順

### 前提条件

- Node.js `^20.19.0` または `>=22.12.0`（Vite 8 の要求バージョン。`node_modules/vite/package.json` の `engines` で確認）
- npm（`package-lock.json` を使用）

### セットアップ

1. リポジトリをクローン

   ```bash
   git clone git@github.com:Masaharu1223/barista-simulator.git
   cd barista-simulator
   ```

2. 依存パッケージをインストール

   ```bash
   npm install
   ```

3. 開発サーバーを起動

   ```bash
   npm run dev
   ```

   表示された URL（既定は `http://localhost:5173/`）をブラウザで開きます。

4. （任意）テストと Lint

   ```bash
   npm test
   npm run lint
   ```

## トラブルシューティング

- **依存関係を更新したら 3D 画面が真っ白になった / エラーが出る**
  `@react-three/fiber` は v9 系を使用しています。React 19 環境で v8 系を入れると動作しないため、`package.json` のバージョン整合性を確認してください。

- **ドラッグ操作を自作コンポーネントに追加したのに反応しない**
  three.js のメッシュは `visible={false}` にするとポインタイベントを受け取りません（`src/scene/DragLayer.tsx` 参照）。判定用の透明な面が必要な場合は `visible` ではなく、`meshBasicMaterial` に `transparent opacity={0}` を指定してください。

- **抽出やドラッグの動作を画面で確認したいが、テストでは見えない**
  WebGL の描画結果は型チェック・ユニットテストの対象外です。上記「動作確認用の補助機能」の `scripts/screenshot.mjs` で実際の描画を撮影して確認してください。

<!-- TODO: 今後 Issue や PR で新たに判明したハマりどころがあれば、ここに追記する -->
