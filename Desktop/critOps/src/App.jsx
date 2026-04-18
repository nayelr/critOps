import React from 'react'
import { useSimulation } from './hooks/useSimulation'
import TopBar        from './components/TopBar'
import MapPanel      from './components/MapPanel'
import HydrophonePanel from './components/HydrophonePanel'
import AIPanel       from './components/AIPanel'
import SensorStrip   from './components/SensorStrip'
import EventLog      from './components/EventLog'

export default function App() {
  const sim = useSimulation()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#040912', overflow: 'hidden' }}>

      {/* ── Top Bar ─────────────────────────────────────── */}
      <TopBar
        utcTime={sim.utcTime}
        sensors={sim.sensors}
        confidence={sim.confidence}
      />

      {/* ── Main body ───────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, padding: 8, minHeight: 0 }}>

        {/* Row 1: Map (left, 57%) | Hydrophone (right, 43%) */}
        <div style={{ display: 'flex', gap: 8, flex: '0 0 auto', height: 420 }}>
          <div style={{ flex: '0 0 57%' }}>
            <MapPanel
              sensors={sim.sensors}
              vessels={sim.vessels}
              threatLat={sim.threatLat}
              threatLon={sim.threatLon}
              confidence={sim.confidence}
            />
          </div>
          <div style={{ flex: 1 }}>
            <HydrophonePanel
              confidence={sim.confidence}
              threatRange={sim.threatRange}
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
