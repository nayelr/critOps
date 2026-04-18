import React from 'react'

const SENSORS = [
  {
    key: 'waterTemp',
    label: 'Water Temp',
    unit: '°C',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M12 2v12M9 7l3-3 3 3" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="18" r="4" stroke="#38bdf8" strokeWidth="2"/>
      </svg>
    ),
    color: '#38bdf8',
    format: v => v.toFixed(1),
  },
  {
    key: 'waveHeight',
    label: 'Wave Height',
    unit: 'm',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M3 12c1.5-3 4.5-3 6 0s4.5 3 6 0 4.5-3 6 0" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round"/>
        <path d="M3 17c1.5-3 4.5-3 6 0s4.5 3 6 0 4.5-3 6 0" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
      </svg>
    ),
    color: '#22d3ee',
    format: v => v.toFixed(2),
  },
  {
    key: 'windSpeed',
    label: 'Wind Speed',
    unit: 'kts',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M3 8h13a3 3 0 100-6c-1.66 0-3 1.34-3 3" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"/>
        <path d="M3 12h16a3 3 0 110 6c-1.66 0-3-1.34-3-3" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"/>
        <path d="M3 16h8" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    color: '#94a3b8',
    format: v => v.toFixed(1),
  },
  {
    key: 'currentDir',
    label: 'Current Dir',
    unit: '°',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="#34d399" strokeWidth="2"/>
        <path d="M12 7v5l3 3" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    color: '#34d399',
    format: v => `${v}°`,
    noUnit: true,
  },
  {
    key: 'depth',
    label: 'Sonar Depth',
    unit: 'm',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M12 3v18M7 18l5 3 5-3" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5 8h14" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
        <path d="M7 13h10" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" opacity="0.3"/>
      </svg>
    ),
    color: '#818cf8',
    format: v => v.toFixed(1),
  },
]

export default function SensorStrip({ sensors }) {
  return (
    <div className="grid grid-cols-5 gap-2 h-full">
      {SENSORS.map(s => {
        const raw = sensors?.[s.key] ?? 0
        const display = s.format(raw)
        return (
          <div key={s.key} className="sensor-card justify-between">
            <div className="flex items-center gap-2">
              {s.icon}
              <span className="font-mono text-[9px] text-[#475569] tracking-widest uppercase">
                {s.label}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="val-lg" style={{ color: s.color }}>
                {s.noUnit ? display.replace('°','') : display}
              </span>
              <span className="font-mono text-[11px] text-[#475569]">
                {s.noUnit ? '°' : s.unit}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
