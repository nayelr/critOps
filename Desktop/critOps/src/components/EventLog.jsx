import React from 'react'

const SEV = {
  threat:  { color: '#ef4444', label: 'THREAT', dot: 'dot-threat' },
  ai:      { color: '#a78bfa', label: 'AI',     dot: null },
  warning: { color: '#eab308', label: 'WARN',   dot: 'dot-warning' },
  info:    { color: '#334155', label: 'INFO',   dot: null },
}

export default function EventLog({ events }) {
  const shown = events?.slice(0, 5) ?? []

  return (
    <div className="panel flex flex-col h-full">
      <div className="panel-header">
        <span className="panel-label">Mission Event Log</span>
        <div className="ml-auto font-mono text-[9px] text-[#334155]">LIVE</div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {shown.map((e, i) => {
          const s = SEV[e.sev] ?? SEV.info
          return (
            <div
              key={e.id ?? i}
              className="event-row"
              style={{ borderLeft: `3px solid ${s.color}`, background: i === 0 ? `${s.color}08` : 'transparent' }}
            >
              {/* Dot */}
              <div
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: s.color }}
              />
              {/* Severity badge */}
              <div
                className="font-mono text-[8px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
                style={{ background: `${s.color}18`, color: s.color }}
              >
                {s.label}
              </div>
              {/* Text */}
              <div className="text-[12px] text-[#94a3b8] flex-1 leading-snug">{e.text}</div>
              {/* Timestamp */}
              <div className="font-mono text-[10px] text-[#334155] flex-shrink-0">{e.ts}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
