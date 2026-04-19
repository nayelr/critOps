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
    format: v => v.toFixed(2),
  },
  {
    key: 'salinity',
    label: 'Salinity',
    unit: 'ppt',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M12 3c-2 4-5 7-5 10a5 5 0 1010 0c0-3-3-6-5-10z" stroke="#22d3ee" strokeWidth="1.5" strokeLinejoin="round"/>
        <circle cx="12" cy="13" r="1.5" fill="#22d3ee"/>
      </svg>
    ),
    color: '#22d3ee',
    format: v => v.toFixed(3),
  },
  {
    key: 'pressure',
    label: 'Pressure',
    unit: 'hPa',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="8" stroke="#94a3b8" strokeWidth="1.5"/>
        <path d="M12 8v4l3 2" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    color: '#94a3b8',
    format: v => v.toFixed(1),
  },
  {
    key: 'atmosphere',
    label: 'Atmosphere',
    unit: '% RH',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M6 16c0-2 1.5-4 4-4s4 2 4 4" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M4 12c0-1.5 1-3 3-3M17 9c2 0 3 1.5 3 3" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
      </svg>
    ),
    color: '#34d399',
    format: v => v.toFixed(1),
  },
  {
    key: 'depth',
    label: 'Water depth',
    unit: 'm',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M12 3v18M7 18l5 3 5-3" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5 8h14" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
        <path d="M7 13h10" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" opacity="0.3"/>
      </svg>
    ),
    color: '#818cf8',
    format: v => v.toFixed(2),
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
                {display}
              </span>
              <span className="font-mono text-[11px] text-[#475569]">
                {s.unit}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
