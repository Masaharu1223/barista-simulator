import { BrewingShots, TrayShots } from './Brewing'
import { Cafe } from './Cafe'
import { CameraRig } from './CameraRig'
import { DragLayer } from './DragLayer'
import { EspressoMachine } from './EspressoMachine'
import { MachineControls } from './MachineControls'
import { ServedCups, Workbench } from './Workbench'
import type { StationId } from './stations'

type Props = {
  station: StationId
  onFocusStation: (station: StationId) => void
}

export function Scene({ station, onFocusStation }: Props) {
  return (
    <group>
      <CameraRig station={station} />

      {/* カフェの照明。暖色のスポットで手元を照らす */}
      <ambientLight intensity={0.75} />
      <directionalLight
        position={[2.2, 4.2, 3.2]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-2}
      />
      <pointLight position={[-1.4, 2.1, 0.9]} intensity={6} color="#ffd39b" distance={5} decay={2} />
      <pointLight position={[1.3, 2.1, 0.9]} intensity={5} color="#ffd39b" distance={5} decay={2} />
      {/* 奥の壁を照らして、カウンターだけが浮いて見えないようにする */}
      <pointLight position={[0, 2.4, -1.2]} intensity={8} color="#e8b87d" distance={7} decay={2} />

      <Cafe />
      <EspressoMachine onSelect={() => onFocusStation('machine')} />
      <MachineControls />
      <BrewingShots />
      <TrayShots />
      <Workbench />
      <ServedCups />
      <DragLayer />
    </group>
  )
}
