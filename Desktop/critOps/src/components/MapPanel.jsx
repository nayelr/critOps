import React from 'react'
import {
  MapContainer, TileLayer, CircleMarker, Circle,
  Polyline, Polygon, Tooltip,
} from 'react-leaflet'
import { BUOY } from '../data/mockData'

const DRIFT_TRAIL = [
  [38.85812, -77.05052],
  [38.85822, -77.05045],
  [38.85829, -77.05038],
  [BUOY.lat, BUOY.lon],
]

const RESTRICTED_ZONE = [
  [38.8593, -77.0516],
  [38.8593, -77.0490],
  [38.8574, -77.0490],
  [38.8574, -77.0516],
]

export default function MapPanel({ sensors, vessels, threatLat, threatLon, submersibleDetected = true }) {
  const lat = sensors?.lat ?? BUOY.lat
  const lon = sensors?.lon ?? BUOY.lon

  return (
    <div className="panel flex flex-col h-full">
      {/* Header */}
      <div className="panel-header">
        <div className="dot-online" />
        <span className="panel-label">Situation Awareness</span>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-[10px] font-mono text-[#334155]">ARLINGTON · VA 22202</span>
          {submersibleDetected ? (
            <div className="flex items-center gap-1.5 bg-[#1a0f0f] border border-[#ef444433] rounded px-2 py-0.5">
              <div className="dot-threat" style={{ width: 6, height: 6 }} />
              <span className="font-mono text-[9px] font-bold text-[#ef4444]">1 ACTIVE CONTACT</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-[#0f1a14] border border-[#22c55e44] rounded px-2 py-0.5">
              <div className="dot-online" style={{ width: 6, height: 6 }} />
              <span className="font-mono text-[9px] font-bold text-[#22c55e]">NO SUBMERSIBLE DETECTED</span>
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={[BUOY.lat, BUOY.lon]}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          attributionControl={true}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; CARTO'
            subdomains="abcd"
            maxZoom={19}
          />

          {submersibleDetected && (
            <Polygon
              positions={RESTRICTED_ZONE}
              pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.06, weight: 1, dashArray: '6 4' }}
            >
              <Tooltip sticky><span>RESTRICTED OPERATING AREA</span></Tooltip>
            </Polygon>
          )}

          {/* Drift trail */}
          <Polyline
            positions={[...DRIFT_TRAIL, [lat, lon]]}
            pathOptions={{ color: '#00d4ff', weight: 1.5, opacity: 0.4, dashArray: '4 6' }}
          />

          {/* Detection radius */}
          <Circle
            center={[lat, lon]}
            radius={3500}
            pathOptions={{ color: '#00d4ff', fillColor: '#00d4ff', fillOpacity: 0.03, weight: 1, dashArray: '5 8' }}
          />

          {/* Acoustic detection zone */}
          <Circle
            center={[lat, lon]}
            radius={6000}
            pathOptions={{ color: '#a78bfa', fillColor: '#a78bfa', fillOpacity: 0.02, weight: 0.8, dashArray: '3 8' }}
          />

          {/* Tank / rig position */}
          <CircleMarker
            center={[lat, lon]}
            radius={9}
            pathOptions={{ color: '#00d4ff', fillColor: '#00d4ff', fillOpacity: 1, weight: 2 }}
          >
            <Tooltip permanent direction="top" offset={[0, -14]}>
              {BUOY.name}
            </Tooltip>
          </CircleMarker>

          {submersibleDetected && (
            <>
              <Circle
                center={[threatLat, threatLon]}
                radius={800}
                pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.08, weight: 0.8 }}
              />
              <CircleMarker
                center={[threatLat, threatLon]}
                radius={7}
                pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.9, weight: 2 }}
              >
                <Tooltip permanent direction="top" offset={[0, -12]}>
                  UWC-01 · Prob. Submersible · {Math.round(confidence * 100)}%
                </Tooltip>
              </CircleMarker>
            </>
          )}

          {/* Surface vessels */}
          {vessels?.map(v => (
            <CircleMarker
              key={v.id}
              center={[v.lat, v.lon]}
              radius={5}
              pathOptions={{
                color: v.ais ? '#eab308' : '#ef4444',
                fillColor: v.ais ? '#eab308' : '#ef4444',
                fillOpacity: 0.8,
                weight: 1.5,
              }}
            >
              <Tooltip>
                {v.name}{!v.ais ? ' — AIS DARK' : ''} · {v.speed.toFixed(1)} kts
              </Tooltip>
            </CircleMarker>
          ))}
        </MapContainer>

        {/* Legend overlay */}
        <div className="absolute bottom-3 left-3 z-[1000] bg-[#04091acc] border border-[#1a3050] rounded-lg px-3 py-2 space-y-1.5">
          {(submersibleDetected
            ? [
                { color: '#00d4ff', label: 'Acorn-01 (buoy)' },
                { color: '#ef4444', label: 'UWC-01 (threat contact)' },
                { color: '#eab308', label: 'AIS vessel' },
                { color: '#ef4444', label: 'AIS-dark vessel' },
              ]
            : [
                { color: '#00d4ff', label: `${BUOY.name} (node)` },
                { color: '#22c55e', label: 'No submersible contact' },
                { color: '#475569', label: 'Ambient conditions' },
              ]
          ).map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: color }} />
              <span className="font-mono text-[9px] text-[#475569]">{label}</span>
            </div>
          ))}
        </div>

        <div className={`absolute top-3 right-3 z-[1000] rounded-lg px-3 py-2 border ${
          submersibleDetected ? 'bg-[#04091acc] border-[#ef444433]' : 'bg-[#04091acc] border-[#22c55e33]'
        }`}>
          <div className="font-mono text-[9px] text-[#475569] mb-1">
            {submersibleDetected ? 'THREAT BEARING' : 'SUBMERSIBLE TRACK'}
          </div>
          <div
            className="font-mono text-[18px] font-bold"
            style={{ color: submersibleDetected ? '#ef4444' : '#22c55e' }}
          >
            {submersibleDetected ? '312°' : '—'}
          </div>
          <div className="font-mono text-[9px] text-[#475569]">
            {submersibleDetected ? `NW · ${(1.84).toFixed(2)} km` : 'No contact'}
          </div>
        </div>
      </div>
    </div>
  )
}
