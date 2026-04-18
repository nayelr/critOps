import React, { useState } from 'react'

const SEV_STYLES = {
  critical: { bg: 'rgba(255,59,59,0.08)', border: '#ff3b3b', color: '#ff3b3b', label: 'CRIT' },
  high:     { bg: 'rgba(255,107,53,0.08)', border: '#ff6b35', color: '#ff6b35', label: 'HIGH' },
  medium:   { bg: 'rgba(245,158,11,0.08)', border: '#f59e0b', color: '#f59e0b', label: 'MED' },
  low:      { bg: 'rgba(16,185,129,0.08)', border: '#10b981', color: '#10b981', label: 'LOW' },
  info:     { bg: 'rgba(34,211,238,0.05)', border: '#22d3ee', color: '#475569', label: 'INFO' },
}

function AlertRow({ event }) {
  const sev = SEV_STYLES[event.sev] ?? SEV_STYLES.info
  const ts = new Date(event.ts).toISOString().slice(11, 19) + 'Z'
  return (
    <div
      className="flex gap-2 px-3 py-2 border-b border-[#0a1628] hover:bg-[#0a1628] transition-colors"
      style={{ borderLeft: `3px solid ${sev.border}`, background: sev.bg }}
    >
      <div
        className="pill text-[7px] flex-shrink-0 self-start mt-0.5"
        style={{ background: `${sev.color}22`, color: sev.color, border: `1px solid ${sev.color}44` }}
      >
        {sev.label}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-mono text-[9px] text-[#94a3b8] leading-snug">{event.msg}</div>
        <div className="font-mono text-[8px] text-[#475569] mt-0.5">{ts}</div>
      </div>
      <div className="font-mono text-[12px] flex-shrink-0 self-center" style={{ color: sev.border }}>
        {event.icon}
      </div>
    </div>
  )
}

export default function AlertsPanel({ alertLog }) {
  const [filter, setFilter] = useState('all')

  const counts = (alertLog ?? []).reduce((acc, e) => {
    acc[e.sev] = (acc[e.sev] ?? 0) + 1
    return acc
  }, {})

  const filtered = filter === 'all'
    ? alertLog
    : alertLog?.filter(e => e.sev === filter)

  return (
    <div className="tac-card flex flex-col h-full">
      <div className="section-header justify-between">
        <div className="flex items-center gap-2">
          <div className="dot" style={{ background: '#ff3b3b', boxShadow: '0 0 6px rgba(255,59,59,0.6)' }} />
          <span>ALERTS / MISSION EVENT LOG</span>
        </div>
        <div className="flex items-center gap-1">
          {counts.critical > 0 && (
            <div className="pill pill-alert text-[8px]">
              <span className="blink-dot w-1.5 h-1.5 rounded-full bg-[#ff3b3b] inline-block" />
              {counts.critical} CRIT
            </div>
          )}
          {counts.high > 0 && (
            <div className="pill text-[8px]" style={{ background: 'rgba(255,107,53,0.15)', color: '#ff6b35', border: '1px solid rgba(255,107,53,0.3)' }}>
              {counts.high} HIGH
            </div>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 px-3 py-2 border-b border-[#1a3354]">
        {['all', 'critical', 'high', 'medium', 'low', 'info'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-2 py-0.5 font-mono text-[8px] font-bold rounded border transition-colors ${
              filter === f
                ? 'bg-[#00f5ff22] text-[#00f5ff] border-[#00f5ff44]'
                : 'text-[#475569] border-[#1a3354] bg-transparent hover:text-[#94a3b8]'
            }`}
          >
            {f.toUpperCase()}
            {f !== 'all' && counts[f] > 0 && (
              <span className="ml-1 opacity-70">({counts[f]})</span>
            )}
          </button>
        ))}
      </div>

      {/* Event log */}
      <div className="flex-1 overflow-y-auto">
        {filtered?.length === 0 ? (
          <div className="font-mono text-[9px] text-[#475569] text-center py-8">NO EVENTS</div>
        ) : (
          filtered?.map((e) => <AlertRow key={e.id} event={e} />)
        )}
      </div>

      {/* Summary footer */}
      <div className="border-t border-[#1a3354] px-3 py-2 flex items-center gap-4">
        {['critical','high','medium','low','info'].map(s => {
          const st = SEV_STYLES[s]
          return (
            <div key={s} className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: st.border }} />
              <span className="font-mono text-[8px]" style={{ color: st.color }}>
                {counts[s] ?? 0}
              </span>
            </div>
          )
        })}
        <div className="ml-auto font-mono text-[8px] text-[#475569]">
          {alertLog?.length ?? 0} total events
        </div>
      </div>
    </div>
  )
}
