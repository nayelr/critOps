import React from 'react'
import { BUOY_CONFIG, BASE_LAT, BASE_LON } from '../data/mockData'

const ThreatBadge = ({ level }) => {
  const pct = Math.round(level)
  const color = level > 70 ? '#ff3b3b' : level > 45 ? '#f59e0b' : '#10b981'
  const label = level > 70 ? 'HIGH' : level > 45 ? 'ELEVATED' : 'GUARDED'
  return (
    <div className="flex items-center gap-2">
      <div className="text-[9px] font-mono font-bold tracking-widest text-[#475569]">THREAT</div>
      <div
        className="pill font-mono text-[10px] font-bold px-3 py-1"
        style={{ background: `${color}22`, color, border: `1px solid ${color}55` }}
      >
        <span className="blink-dot inline-block w-1.5 h-1.5 rounded-full mr-1" style={{ background: color }} />
        {label}
      </div>
      <div className="relative w-24 h-1.5 rounded-full overflow-hidden bg-[#0d1e35]">
        <div
          className="absolute top-0 left-0 h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, #10b981, #f59e0b, #ff3b3b)`,
            backgroundSize: '300% 100%',
            backgroundPosition: `${pct}% 0`,
          }}
        />
      </div>
      <span className="font-mono text-[10px]" style={{ color }}>{pct}%</span>
    </div>
  )
}

const StatusPill = ({ label, value, color = '#22d3ee', blink = false }) => (
  <div className="flex flex-col gap-0.5">
    <div className="text-[8px] font-mono font-bold tracking-widest text-[#475569]">{label}</div>
    <div
      className={`font-mono text-[11px] font-bold ${blink ? 'blink-dot' : ''}`}
      style={{ color }}
    >
      {value}
    </div>
  </div>
)

const Divider = () => (
  <div className="w-px self-stretch bg-[#1a3354] mx-1" />
)

export default function TopBar({ utcTime, sensors, threatLevel, lastSync, autonomyMode, connectionQuality }) {
  const batPct = Math.round(sensors.battery_pct ?? 78)
  const batColor = batPct > 60 ? '#10b981' : batPct > 30 ? '#f59e0b' : '#ef4444'

  return (
    <header className="topbar px-4 py-2 flex items-center gap-0 min-h-[64px]">
      {/* Brand */}
      <div className="flex items-center gap-3 pr-4 border-r border-[#1a3354]">
        <div className="relative flex-shrink-0">
          <div className="w-9 h-9 rounded-full border-2 border-[#00f5ff] flex items-center justify-center bg-[#00f5ff11]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" fill="#00f5ff" />
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" fill="#00f5ff" opacity="0.4"/>
              <path d="M12 6v2M12 16v2M6 12H4M20 12h-2" stroke="#00f5ff" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
            </svg>
          </div>
          <div className="absolute inset-0 rounded-full border border-[#00f5ff] opacity-30 animate-ping" />
        </div>
        <div>
          <div className="font-mono text-[13px] font-bold text-[#00f5ff] glow-text tracking-widest leading-none">
            TRITON WATCH
          </div>
          <div className="font-mono text-[8px] text-[#475569] tracking-[0.2em] leading-none mt-0.5">
            SENTINEL BUOY COMMAND INTERFACE
          </div>
        </div>
      </div>

      {/* Buoy + Mission */}
      <div className="flex items-center gap-6 px-4 border-r border-[#1a3354]">
        <StatusPill label="BUOY ID" value={BUOY_CONFIG.id} color="#00f5ff" />
        <StatusPill label="MISSION" value={BUOY_CONFIG.missionName} color="#e2e8f0" />
        <StatusPill label="AUTONOMY MODE" value={autonomyMode} color="#22d3ee" />
      </div>

      {/* GPS */}
      <div className="flex items-center gap-6 px-4 border-r border-[#1a3354]">
        <StatusPill
          label="GPS POSITION"
          value={`${(sensors.gps_lat ?? BASE_LAT).toFixed(4)}°N  ${Math.abs(sensors.gps_lon ?? BASE_LON).toFixed(4)}°W`}
          color="#94a3b8"
        />
        <StatusPill label="GPS ACC" value={`±${(sensors.gps_accuracy ?? 1.8).toFixed(1)}m`} color="#94a3b8" />
      </div>

      {/* Threat */}
      <div className="px-4 border-r border-[#1a3354]">
        <ThreatBadge level={threatLevel} />
      </div>

      {/* Power */}
      <div className="flex items-center gap-6 px-4 border-r border-[#1a3354]">
        <div className="flex flex-col gap-0.5">
          <div className="text-[8px] font-mono font-bold tracking-widest text-[#475569]">BATTERY</div>
          <div className="flex items-center gap-1.5">
            <div className="relative w-20 h-3 bg-[#0d1e35] border border-[#1a3354] rounded-sm overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full rounded-sm transition-all duration-1000"
                style={{ width: `${batPct}%`, background: batColor }}
              />
            </div>
            <span className="font-mono text-[10px] font-bold" style={{ color: batColor }}>{batPct}%</span>
          </div>
        </div>
        <StatusPill label="SOLAR" value={`${(sensors.solar_output ?? 12.8).toFixed(1)}W`} color="#fbbf24" />
      </div>

      {/* Comms */}
      <div className="flex items-center gap-6 px-4 border-r border-[#1a3354]">
        <div className="flex flex-col gap-0.5">
          <div className="text-[8px] font-mono font-bold tracking-widest text-[#475569]">CONNECTIVITY</div>
          <div className="flex items-center gap-1.5">
            <span className="blink-dot w-2 h-2 rounded-full bg-[#10b981] inline-block" />
            <span className="font-mono text-[10px] font-bold text-[#10b981]">LINKED</span>
            <span className="font-mono text-[10px] text-[#475569]">{Math.round(connectionQuality)}%</span>
          </div>
        </div>
        <StatusPill label="LAST SYNC" value={lastSync} color="#94a3b8" />
      </div>

      {/* Edge AI */}
      <div className="flex items-center gap-6 px-4 border-r border-[#1a3354]">
        <StatusPill label="EDGE MODEL" value={BUOY_CONFIG.edgeModelVersion} color="#a78bfa" />
        <div className="flex flex-col gap-0.5">
          <div className="text-[8px] font-mono font-bold tracking-widest text-[#475569]">AI STATUS</div>
          <div className="pill pill-online text-[9px]">
            <span className="blink-dot w-1.5 h-1.5 rounded-full bg-[#10b981] inline-block" />
            ACTIVE
          </div>
        </div>
      </div>

      {/* UTC Time */}
      <div className="ml-auto pl-4">
        <div className="text-[8px] font-mono font-bold tracking-widest text-[#475569] mb-0.5">UTC</div>
        <div className="font-mono text-[13px] font-bold text-[#e2e8f0] glow-text">{utcTime}</div>
      </div>

      {/* Classification banner */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00f5ff33] to-transparent" />
    </header>
  )
}
