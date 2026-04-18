import React, { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Circle, Polyline, Polygon, Tooltip, useMap } from 'react-leaflet'
import { BASE_LAT, BASE_LON, DRIFT_TRAIL, RESTRICTED_ZONES, NEIGHBOR_BUOYS } from '../data/mockData'

// Layer toggle button
const LayerBtn = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-2 py-1 font-mono text-[9px] font-bold tracking-wider rounded border transition-colors ${
      active
        ? 'bg-[#00f5ff22] text-[#00f5ff] border-[#00f5ff44]'
        : 'bg-[#0a1628] text-[#475569] border-[#1a3354] hover:border-[#1e4070]'
    }`}
  >
    {label}
  </button>
)

// Animated buoy marker using SVG overlay
function BuoyMarker({ lat, lon }) {
  const map = useMap()
  const ref = useRef(null)

  return (
    <CircleMarker
      center={[lat, lon]}
      radius={8}
      pathOptions={{
        color: '#00f5ff',
        fillColor: '#00f5ff',
        fillOpacity: 0.9,
        weight: 2,
      }}
    >
      <Tooltip permanent direction="top" offset={[0, -12]} className="leaflet-tooltip-dark">
        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '9px', color: '#00f5ff', background: 'transparent', border: 'none' }}>
          SENTINEL-7
        </span>
      </Tooltip>
    </CircleMarker>
  )
}

export default function MapPanel({ sensors, vessels, contacts }) {
  const [layers, setLayers] = useState({
    patrol: true,
    vessels: true,
    contacts: true,
    restricted: true,
    detection: true,
    mesh: true,
    bathymetry: false,
    currents: false,
    ais: true,
    acoustic: true,
  })

  const toggle = k => setLayers(l => ({ ...l, [k]: !l[k] }))

  const lat = sensors?.gps_lat ?? BASE_LAT
  const lon = sensors?.gps_lon ?? BASE_LON

  const vesselColors = {
    cargo: '#f59e0b',
    fishing: '#22d3ee',
    unknown: '#ef4444',
    patrol: '#10b981',
  }

  return (
    <div className="tac-card flex flex-col h-full">
      <div className="section-header justify-between">
        <div className="flex items-center gap-2">
          <div className="dot" />
          <span>GEOSPATIAL / TACTICAL DISPLAY</span>
        </div>
        <div className="flex items-center gap-1 font-mono text-[9px] text-[#475569]">
          <span className="blink-dot w-1.5 h-1.5 rounded-full bg-[#10b981] inline-block" />
          LIVE
        </div>
      </div>

      {/* Layer toggles */}
      <div className="flex flex-wrap gap-1 px-3 py-2 border-b border-[#1a3354]">
        {[
          ['patrol', 'PATROL ZONE'],
          ['vessels', 'VESSELS'],
          ['contacts', 'UW CONTACTS'],
          ['restricted', 'RESTRICTED'],
          ['detection', 'DETECTION R.'],
          ['mesh', 'MESH NODES'],
          ['ais', 'AIS'],
          ['acoustic', 'ACOUSTIC'],
          ['bathymetry', 'BATHY'],
          ['currents', 'CURRENTS'],
        ].map(([k, l]) => (
          <LayerBtn key={k} label={l} active={layers[k]} onClick={() => toggle(k)} />
        ))}
      </div>

      {/* Map */}
      <div className="flex-1 relative min-h-0">
        <MapContainer
          center={[BASE_LAT, BASE_LON]}
          zoom={11}
          style={{ height: '100%', width: '100%', background: '#04091a' }}
          zoomControl={true}
          attributionControl={true}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            subdomains="abcd"
            maxZoom={19}
          />

          {/* Drift trail */}
          <Polyline
            positions={[...DRIFT_TRAIL, [lat, lon]]}
            pathOptions={{ color: '#00f5ff', weight: 1.5, opacity: 0.5, dashArray: '4 4' }}
          />

          {/* Patrol radius */}
          {layers.patrol && (
            <Circle
              center={[BASE_LAT, BASE_LON]}
              radius={8000}
              pathOptions={{ color: '#22d3ee', fillColor: '#22d3ee', fillOpacity: 0.04, weight: 1, dashArray: '6 6' }}
            />
          )}

          {/* Acoustic detection radius */}
          {layers.acoustic && (
            <Circle
              center={[lat, lon]}
              radius={4000}
              pathOptions={{ color: '#a78bfa', fillColor: '#a78bfa', fillOpacity: 0.03, weight: 1, dashArray: '3 6' }}
            />
          )}

          {/* Detection cone (sonar) */}
          {layers.detection && (
            <Circle
              center={[lat, lon]}
              radius={1500}
              pathOptions={{ color: '#00f5ff', fillColor: '#00f5ff', fillOpacity: 0.05, weight: 1 }}
            />
          )}

          {/* Restricted zones */}
          {layers.restricted && RESTRICTED_ZONES.map(z => (
            <Polygon
              key={z.id}
              positions={z.coords}
              pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.08, weight: 1.5, dashArray: '8 4' }}
            >
              <Tooltip sticky>
                <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '9px', color: '#ef4444' }}>
                  {z.name}
                </span>
              </Tooltip>
            </Polygon>
          ))}

          {/* Vessels */}
          {layers.vessels && vessels?.map(v => (
            <CircleMarker
              key={v.id}
              center={[v.lat, v.lon]}
              radius={5}
              pathOptions={{
                color: vesselColors[v.type] ?? '#94a3b8',
                fillColor: vesselColors[v.type] ?? '#94a3b8',
                fillOpacity: 0.8,
                weight: 1.5,
              }}
            >
              <Tooltip>
                <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '9px', color: vesselColors[v.type] }}>
                  {v.name} {!v.ais && '⚠ AIS OFF'}<br/>
                  HDG {Math.round(v.heading)}° · {v.speed.toFixed(1)} kts
                </span>
              </Tooltip>
            </CircleMarker>
          ))}

          {/* Underwater contacts */}
          {layers.contacts && contacts?.map(c => (
            <React.Fragment key={c.id}>
              <CircleMarker
                center={[c.lat, c.lon]}
                radius={6}
                pathOptions={{
                  color: c.classification === 'probable_submersible' ? '#ff3b3b' : '#f59e0b',
                  fillColor: c.classification === 'probable_submersible' ? '#ff3b3b' : '#f59e0b',
                  fillOpacity: 0.7,
                  weight: 1.5,
                  dashArray: c.classification === 'probable_submersible' ? undefined : '4 4',
                }}
              >
                <Tooltip>
                  <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '9px', color: '#ff3b3b' }}>
                    {c.id} · {(c.confidence * 100).toFixed(0)}% conf<br/>
                    BRG {c.bearing}° · {c.range_m}m
                  </span>
                </Tooltip>
              </CircleMarker>
              {/* Uncertainty circle */}
              <Circle
                center={[c.lat, c.lon]}
                radius={300}
                pathOptions={{
                  color: c.classification === 'probable_submersible' ? '#ff3b3b' : '#f59e0b',
                  fillColor: c.classification === 'probable_submersible' ? '#ff3b3b' : '#f59e0b',
                  fillOpacity: 0.05,
                  weight: 0.8,
                  dashArray: '3 6',
                }}
              />
            </React.Fragment>
          ))}

          {/* Neighbor buoys */}
          {layers.mesh && NEIGHBOR_BUOYS.filter(b => b.status !== 'offline').map(b => (
            <CircleMarker
              key={b.id}
              center={[b.lat, b.lon]}
              radius={4}
              pathOptions={{
                color: b.status === 'online' ? '#10b981' : '#f59e0b',
                fillColor: b.status === 'online' ? '#10b981' : '#f59e0b',
                fillOpacity: 0.6,
                weight: 1,
              }}
            >
              <Tooltip>
                <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '9px' }}>
                  {b.id} · {b.signal ? `${b.signal} dBm` : 'N/A'}
                </span>
              </Tooltip>
            </CircleMarker>
          ))}

          {/* Buoy (own ship) */}
          <BuoyMarker lat={lat} lon={lon} />
        </MapContainer>

        {/* Overlay legend */}
        <div className="absolute bottom-2 left-2 bg-[#04091acc] border border-[#1a3354] rounded p-2 text-[8px] font-mono space-y-0.5 z-[1000]">
          {[
            { color: '#00f5ff', label: 'SENTINEL-7 (OWN SHIP)' },
            { color: '#ef4444', label: 'PROB SUBMERSIBLE' },
            { color: '#f59e0b', label: 'UNK CONTACT / VESSEL' },
            { color: '#10b981', label: 'PATROL VESSEL' },
            { color: '#22d3ee', label: 'FISHING' },
            { color: '#a78bfa', label: 'ACOUSTIC ZONE' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
              <span style={{ color: '#94a3b8' }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Coord readout */}
        <div className="absolute top-2 right-2 bg-[#04091acc] border border-[#1a3354] rounded px-2 py-1 z-[1000]">
          <div className="font-mono text-[9px] text-[#00f5ff]">
            {(sensors?.gps_lat ?? BASE_LAT).toFixed(5)}°N
          </div>
          <div className="font-mono text-[9px] text-[#00f5ff]">
            {Math.abs(sensors?.gps_lon ?? BASE_LON).toFixed(5)}°W
          </div>
          <div className="font-mono text-[8px] text-[#475569] mt-0.5">MGRS: 10SEG1127</div>
        </div>
      </div>
    </div>
  )
}
