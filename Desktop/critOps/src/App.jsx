import React, { Suspense } from 'react'
import { useSimulation } from './hooks/useSimulation'
import TopBar from './components/TopBar'
import SensorGrid from './components/SensorGrid'
import MapPanel from './components/MapPanel'
import HydrophonePanel from './components/HydrophonePanel'
import AIPanel from './components/AIPanel'
import CameraPanel from './components/CameraPanel'
import CybersecPanel from './components/CybersecPanel'
import CommsPanel from './components/CommsPanel'
import DigitalTwinPanel from './components/DigitalTwinPanel'
import AlertsPanel from './components/AlertsPanel'
import { BUOY_CONFIG } from './data/mockData'

// Classification banner at very top
function ClassificationBanner() {
  return (
    <div className="bg-[#0a1628] border-b border-[#1a3354] text-center py-0.5">
      <span className="font-mono text-[8px] font-bold tracking-[0.3em] text-[#475569]">
        {BUOY_CONFIG.classification}
      </span>
    </div>
  )
}

export default function App() {
  const sim = useSimulation()

  return (
    <div className="flex flex-col h-screen bg-[#04091a] cyber-grid overflow-hidden">
      <ClassificationBanner />
      <TopBar
        utcTime={sim.utcTime}
        sensors={sim.sensors}
        threatLevel={sim.threatLevel}
        lastSync={sim.lastSync}
        autonomyMode={sim.autonomyMode}
        connectionQuality={sim.connectionQuality}
      />

      {/* Main scrollable area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="p-2 space-y-2 min-w-[1200px]">

          {/* ── Row 1: Sensors | Map | Alerts ──────────────────── */}
          <div className="grid gap-2" style={{ gridTemplateColumns: '300px 1fr 280px', height: '520px' }}>
            <SensorGrid
              sensors={sim.sensors}
              history={sim.history}
            />
            <MapPanel
              sensors={sim.sensors}
              vessels={sim.vessels}
              contacts={sim.contacts}
            />
            <AlertsPanel alertLog={sim.alertLog} />
          </div>

          {/* ── Row 2: Hydrophone (full width, prominent) ───────── */}
          <div style={{ height: '480px' }}>
            <HydrophonePanel
              acousticLog={sim.acousticLog}
              activeContact={sim.activeContact}
            />
          </div>

          {/* ── Row 3: AI | Camera | Cybersec | Comms ──────────── */}
          <div className="grid grid-cols-4 gap-2" style={{ height: '620px' }}>
            <AIPanel
              aiScenario={sim.aiScenario}
              threatLevel={sim.threatLevel}
              inferenceLatency={sim.inferenceLatency}
              inferenceConfidence={sim.inferenceConfidence}
              history={sim.history}
              sensors={sim.sensors}
            />
            <CameraPanel />
            <CybersecPanel />
            <CommsPanel
              sensors={sim.sensors}
              connectionQuality={sim.connectionQuality}
              history={sim.history}
            />
          </div>

          {/* ── Row 4: Digital Twin ─────────────────────────────── */}
          <div style={{ height: '420px' }}>
            <DigitalTwinPanel
              sensors={sim.sensors}
              threatLevel={sim.threatLevel}
            />
          </div>

          {/* Footer */}
          <div className="text-center py-3">
            <div className="font-mono text-[8px] text-[#1a3354] tracking-[0.4em]">
              TRITON WATCH COMMAND INTERFACE · {BUOY_CONFIG.missionId} · {BUOY_CONFIG.firmwareVersion}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
