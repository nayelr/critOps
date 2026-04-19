import React from 'react'
import { useSimulation } from './hooks/useSimulation'
import { useCameraStreamUrl } from './hooks/useCameraStreamUrl'
import { useYoloWsUrl } from './hooks/useYoloWsUrl'
import TopBar        from './components/TopBar'
import MapPanel      from './components/MapPanel'
import HydrophonePanel from './components/HydrophonePanel'
import CameraPanel   from './components/CameraPanel'
import AIPanel       from './components/AIPanel'
import SensorStrip   from './components/SensorStrip'
import EventLog      from './components/EventLog'

export default function App() {
  const sim = useSimulation()
  const cameraStreamUrl = useCameraStreamUrl()
  const yoloWsUrl = useYoloWsUrl()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#040912', overflow: 'hidden' }}>

      {/* ── Top Bar ─────────────────────────────────────── */}
      <TopBar
        utcTime={sim.utcTime}
        sensors={sim.sensors}
        confidence={sim.confidence}
        submersibleDetected={sim.submersibleDetected}
      />

      {/* ── Main body ───────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, padding: 8, minHeight: 0 }}>

        {/* Row 1: Map | Camera (Pi USB MJPEG) | Hydrophone */}
        <div style={{ display: 'flex', gap: 8, flex: '0 0 auto', height: 520, minHeight: 0 }}>
          <div style={{ flex: '1 1 0', minWidth: 0 }}>
            <MapPanel
              sensors={sim.sensors}
              vessels={sim.vessels}
              threatLat={sim.threatLat}
              threatLon={sim.threatLon}
              submersibleDetected={sim.submersibleDetected}
            />
          </div>
          <div style={{ flex: '0 0 460px', minWidth: 0 }}>
            <CameraPanel streamUrl={cameraStreamUrl} yoloWsUrl={yoloWsUrl} />
          </div>
          <div style={{ flex: '1 1 0', minWidth: 0 }}>
            <HydrophonePanel
              confidence={sim.confidence}
              threatRange={sim.threatRange}
              submersibleDetected={sim.submersibleDetected}
              waterTemp={sim.sensors?.waterTemp ?? 21}
            />
          </div>
        </div>

        {/* Row 2: AI Panel (left, 38%) | Sensor strip + Event log (right, 62%) */}
        <div style={{ display: 'flex', gap: 8, flex: 1, minHeight: 0 }}>
          <div style={{ flex: '0 0 38%' }}>
            <AIPanel
              aiAssessment={sim.aiAssessment}
              recommendedAction={sim.recommendedAction}
              confidence={sim.confidence}
            />
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Sensor cards */}
            <div style={{ flex: '0 0 auto', height: 104 }}>
              <SensorStrip sensors={sim.sensors} />
            </div>
            {/* Event log */}
            <div style={{ flex: 1, minHeight: 0 }}>
              <EventLog events={sim.events} />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
