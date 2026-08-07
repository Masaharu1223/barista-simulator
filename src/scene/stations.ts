import { MACHINE_X, SERVE_COUNTER } from './layout'

export type StationId = 'overview' | 'machine' | 'workbench' | 'serve'

type CameraPreset = {
  label: string
  position: [number, number, number]
  target: [number, number, number]
}

/**
 * カメラのプリセット。
 * overview はマシン・作業台・提供台がすべて画角に入る「バー視点」で、
 * ショットのドラッグはこの視点だけで完結する。他はそこから寄っただけの視点。
 */
export const STATIONS: Record<StationId, CameraPreset> = {
  overview: {
    label: 'バー全体',
    position: [0, 2.45, 2.42],
    target: [0, 1.02, -0.2],
  },
  machine: {
    label: 'エスプレッソマシン',
    position: [MACHINE_X, 1.62, 1.12],
    target: [MACHINE_X, 1.08, -0.1],
  },
  workbench: {
    label: '作業台',
    position: [0.4, 1.58, 1.0],
    target: [0.4, 0.97, -0.05],
  },
  serve: {
    label: '提供台',
    position: [SERVE_COUNTER.x, 1.6, 1.1],
    target: [SERVE_COUNTER.x, 1.03, -0.05],
  },
}

/** Q / E で左右に移動する順序。overview はスペースキーで戻る */
export const STATION_ORDER: StationId[] = ['machine', 'workbench', 'serve']
