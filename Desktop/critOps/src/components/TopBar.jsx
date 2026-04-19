import React from 'react'
import { BUOY } from '../data/mockData'

export default function TopBar({ utcTime, sensors, confidence, submersibleDetected = true }) {
  const threatActive = submersibleDetected && confidence > 0.5
  const sysStatus = threatActive ? 'THREAT DETECTED' : submersibleDetected ? 'ONLINE' : 'ONLINE · CLEAR'
  const sysColor  = threatActive ? '#ef4444' : '#22c55e'

  return (
    <header className="flex items-center justify-between px-6 py-0 border-b border-[#1a3050] bg-[#040912]"
      style={{ height: 56 }}>

      {/* Brand */}
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <div className="w-8 h-8 rounded-full border border-[#00d4ff] flex items-center justify-center"
            style={{ background: 'rgba(0,212,255,0.08)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" fill="#00d4ff" />
              <circle cx="12" cy="12" r="9" stroke="#00d4ff" strokeWidth="1.5" opacity="0.4" />
              <path d="M12 3v2M12 19v2M3 12h2M19 12h2" stroke="#00d4ff" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
            </svg>
          </div>
        </div>
        <div>
          <div className="font-mono text-[15px] font-bold tracking-widest text-[#00d4ff]">
            {BUOY.name.toUpperCase()}
          </div>
          <div className="text-[9px] text-[#334155] tracking-[0.2em] font-mono">ACORN SURVEILLANCE NODE</div>
        </div>
      </div>

      {/* Center items */}
      <div className="flex items-center gap-8">

        {/* GPS */}
        <div className="text-center">
          <div className="text-[9px] text-[#334155] tracking-widest font-mono mb-0.5">POSITION</div>
          <div className="font-mono text-[12px] text-[#94a3b8] font-bold">
            {(sensors.lat ?? BUOY.lat).toFixed(4)}°N&nbsp;&nbsp;
            {Math.abs(sensors.lon ?? BUOY.lon).toFixed(4)}°W
          </div>
        </div>

        {/* Status */}
        <div className="text-center">
          <div className="text-[9px] text-[#334155] tracking-widest font-mono mb-0.5">STATUS</div>
          <div className="flex items-center gap-2">
            <div className={threatActive ? 'dot-threat' : 'dot-online'} />
            <span className="font-mono text-[11px] font-bold" style={{ color: sysColor }}>
              {sysStatus}
            </span>
          </div>
        </div>

        {/* Battery */}
        <div className="text-center">
          <div className="text-[9px] text-[#334155] tracking-widest font-mono mb-0.5">BATTERY</div>
          <div className="flex items-center gap-2">
            <div className="w-20 h-2 bg-[#0c1d30] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${sensors.battery ?? 78}%`,
                  background: (sensors.battery ?? 78) > 50 ? '#22c55e' : '#eab308',
                }}
              />
            </div>
            <span className="font-mono text-[11px] font-bold text-[#94a3b8]">
              {Math.round(sensors.battery ?? 78)}%
            </span>
          </div>
        </div>

        {/* Link */}
        <div className="text-center">
          <div className="text-[9px] text-[#334155] tracking-widest font-mono mb-0.5">UPLINK</div>
          <div className="flex items-center gap-2">
            <div className="dot-online blink" />
            <span className="font-mono text-[11px] font-bold text-[#22c55e]">LINKED</span>
          </div>
        </div>

      </div>

      {/* UTC Clock */}
      <div className="text-right">
        <div className="text-[9px] text-[#334155] tracking-widest font-mono mb-0.5">UTC</div>
        <div className="font-mono text-[16px] font-bold text-[#f1f5f9]">{utcTime}</div>
      </div>

    </header>
  )
}
