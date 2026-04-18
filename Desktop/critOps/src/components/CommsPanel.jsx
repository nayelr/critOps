import React from 'react'
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip } from 'recharts'
import { LINK_STATUS, NEIGHBOR_BUOYS } from '../data/mockData'

function LinkRow({ name, status, quality, bandwidth }) {
  const color = status === 'online' ? '#10b981' : status === 'warning' ? '#f59e0b' : '#ef4444'
  return (
    <div className="flex items-center gap-2 py-1.5 border-b border-[#0a1628]">
      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color, boxShadow: `0 0 4px ${color}` }} />
      <div className="flex-1 min-w-0">
        <div className="font-mono text-[9px] font-bold text-[#94a3b8] truncate">{name}</div>
        <div className="font-mono text-[8px] text-[#475569]">{bandwidth}</div>
      </div>
      <div className="w-20 h-1.5 bg-[#060d1a] rounded-full overflow-hidden flex-shrink-0">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${quality}%`, background: color }}
        />
      </div>
      <div className="font-mono text-[8px] font-bold w-7 text-right flex-shrink-0" style={{ color }}>
        {quality > 0 ? `${quality}%` : '—'}
      </div>
    </div>
  )
}

function BuoyMeshRow({ buoy }) {
  const color = buoy.status === 'online' ? '#10b981' : buoy.status === 'warning' ? '#f59e0b' : '#ef4444'
  return (
    <div className="flex items-center gap-2 py-1 border-b border-[#0a1628]">
      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
      <div className="font-mono text-[9px] font-bold text-[#94a3b8] flex-1">{buoy.id}</div>
      <div className="font-mono text-[8px] text-[#475569]">
        {buoy.signal ? `${buoy.signal} dBm` : '—'}
      </div>
      <div className="font-mono text-[8px] text-[#475569] w-14 text-right">{buoy.lastSeen}</div>
      <div
        className="pill text-[7px]"
        style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}
      >
        {buoy.status.toUpperCase()}
      </div>
    </div>
  )
}

export default function CommsPanel({ sensors, connectionQuality, history }) {
  // Build bandwidth sparkline data
  const bwData = Array.from({ length: 30 }, (_, i) => ({
    i,
    up: Math.floor(8 + Math.random() * 6),
    down: Math.floor(12 + Math.random() * 8),
  }))

  return (
    <div className="tac-card flex flex-col h-full">
      <div className="section-header justify-between">
        <div className="flex items-center gap-2">
          <div className="dot" />
          <span>COMMUNICATIONS / NETWORKING</span>
        </div>
        <div className="font-mono text-[9px]">
          <span className="text-[#10b981] font-bold">{Math.round(connectionQuality)}%</span>
          <span className="text-[#475569]"> LINK QUALITY</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">

        {/* Link status */}
        <div>
          <div className="font-mono text-[8px] font-bold tracking-widest text-[#475569] mb-1">LINK STATUS</div>
          {Object.values(LINK_STATUS).map(link => (
            <LinkRow key={link.name} {...link} />
          ))}
        </div>

        {/* Bandwidth chart */}
        <div className="bg-[#060d1a] rounded border border-[#1a3354] p-2">
          <div className="font-mono text-[8px] font-bold tracking-widest text-[#475569] mb-1">BANDWIDTH USAGE</div>
          <ResponsiveContainer width="100%" height={50}>
            <AreaChart data={bwData}>
              <defs>
                <linearGradient id="upGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="downGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="up"   stroke="#22d3ee" fill="url(#upGrad)"   strokeWidth={1.5} dot={false} />
              <Area type="monotone" dataKey="down" stroke="#10b981" fill="url(#downGrad)" strokeWidth={1.5} dot={false} />
              <Tooltip
                contentStyle={{ background: '#0a1628', border: '1px solid #1a3354', borderRadius: 4 }}
                itemStyle={{ fontSize: 9, fontFamily: 'Space Mono' }}
                labelStyle={{ display: 'none' }}
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-1">
            <div className="flex items-center gap-1">
              <div className="w-2 h-0.5 bg-[#22d3ee]" />
              <span className="font-mono text-[7px] text-[#475569]">UPLINK</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-0.5 bg-[#10b981]" />
              <span className="font-mono text-[7px] text-[#475569]">DOWNLINK</span>
            </div>
          </div>
        </div>

        {/* Comms metrics */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { l: 'LAST UPLINK', v: '00:00:04', c: '#10b981' },
            { l: 'LAST DOWNLINK', v: '00:00:11', c: '#10b981' },
            { l: 'PKT RETRY', v: '3', c: '#f59e0b' },
            { l: 'RELAY QUEUE', v: '2.1 kB', c: '#22d3ee' },
            { l: 'TX RATE', v: '9.8 kbps', c: '#22d3ee' },
            { l: 'RX RATE', v: '14.2 kbps', c: '#22d3ee' },
            { l: 'COMMS LATENCY', v: `${Math.round(sensors?.comms_latency ?? 148)}ms`, c: '#94a3b8' },
            { l: 'PKT LOSS', v: `${(sensors?.packet_loss ?? 0.8).toFixed(1)}%`, c: '#94a3b8' },
          ].map(({ l, v, c }) => (
            <div key={l} className="bg-[#060d1a] border border-[#1a3354] rounded p-1.5">
              <div className="font-mono text-[7px] text-[#475569]">{l}</div>
              <div className="font-mono text-[10px] font-bold" style={{ color: c }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Shore station */}
        <div className="bg-[#060d1a] border border-[#1e4070] rounded p-2">
          <div className="font-mono text-[8px] font-bold tracking-widest text-[#475569] mb-1.5">SHORE STATION</div>
          <div className="flex items-center gap-2 mb-1">
            <div className="blink-dot w-2 h-2 rounded-full bg-[#10b981]" />
            <div className="font-mono text-[10px] font-bold text-[#10b981]">SHORE-01 — CONNECTED</div>
          </div>
          <div className="font-mono text-[8px] text-[#475569]">
            USCG Pacific Fleet Maritime Surveillance — Monterey Bay Station
          </div>
          <div className="font-mono text-[8px] text-[#475569] mt-0.5">
            IP: 10.88.42.1 · Port: 8443 · TLS 1.3 encrypted
          </div>
        </div>

        {/* Mesh neighbor buoys */}
        <div>
          <div className="font-mono text-[8px] font-bold tracking-widest text-[#475569] mb-1">MESH NETWORK — NEIGHBOR BUOYS</div>
          {NEIGHBOR_BUOYS.map(b => (
            <BuoyMeshRow key={b.id} buoy={b} />
          ))}
        </div>

      </div>
    </div>
  )
}
