import React from 'react'
import { CYBER_EVENTS } from '../data/mockData'

function SecurityIndicator({ label, status, detail }) {
  const color = status === 'secure' ? '#10b981' : status === 'warning' ? '#f59e0b' : '#ef4444'
  const icon = status === 'secure' ? '✓' : status === 'warning' ? '!' : '✗'
  return (
    <div className="flex items-center gap-2 py-1.5 border-b border-[#0a1628]">
      <div
        className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 font-mono text-[9px] font-bold"
        style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-mono text-[9px] font-bold text-[#94a3b8] truncate">{label}</div>
        {detail && <div className="font-mono text-[8px] text-[#475569] truncate">{detail}</div>}
      </div>
      <div
        className="pill text-[7px] flex-shrink-0"
        style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}
      >
        {status.toUpperCase()}
      </div>
    </div>
  )
}

export default function CybersecPanel() {
  return (
    <div className="tac-card flex flex-col h-full">
      <div className="section-header justify-between">
        <div className="flex items-center gap-2">
          <div className="dot" style={{ background: '#10b981', boxShadow: '0 0 6px rgba(16,185,129,0.6)' }} />
          <span>CYBERSECURITY / SYSTEM INTEGRITY</span>
        </div>
        <div className="pill pill-online text-[8px]">NOMINAL</div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Security indicators */}
        <div>
          <SecurityIndicator label="SECURE BOOT" status="secure" detail="Firmware hash verified — SHA-256 match" />
          <SecurityIndicator label="ENCRYPTED LINK (TLS 1.3)" status="secure" detail="AES-256-GCM · ECDHE" />
          <SecurityIndicator label="FIRMWARE INTEGRITY" status="secure" detail="4.2.1-stable · sig OK" />
          <SecurityIndicator label="SENSOR TAMPER DETECT" status="warning" detail="IMU housing seal — minor delta" />
          <SecurityIndicator label="INTRUSION DETECTION" status="secure" detail="0 active threats" />
          <SecurityIndicator label="UNAUTHORIZED ACCESS" status="warning" detail="1 failed SSH attempt (blocked)" />
          <SecurityIndicator label="VPN TUNNEL" status="secure" detail="shore-01.tritonwatch.net" />
          <SecurityIndicator label="CERT EXPIRY" status="secure" detail="Valid 2027-04-01" />
        </div>

        {/* Threat counters */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'INTRUSION ATTEMPTS', val: '2', color: '#f59e0b' },
            { label: 'BLOCKED SCANS', val: '7', color: '#f59e0b' },
            { label: 'AUTH FAILURES', val: '1', color: '#ef4444' },
          ].map(({ label, val, color }) => (
            <div key={label} className="bg-[#060d1a] border border-[#1a3354] rounded p-2 text-center">
              <div className="font-mono text-[18px] font-bold" style={{ color }}>{val}</div>
              <div className="font-mono text-[7px] text-[#475569] mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Cyber event log */}
        <div>
          <div className="font-mono text-[8px] font-bold tracking-widest text-[#475569] mb-1.5">SECURITY EVENT LOG</div>
          <div className="space-y-0.5">
            {CYBER_EVENTS.map((e, i) => {
              const color = e.level === 'info' ? '#22d3ee' : e.level === 'warning' ? '#f59e0b' : '#ef4444'
              return (
                <div
                  key={i}
                  className="flex gap-2 py-1 px-2 rounded text-[8px] font-mono"
                  style={{ borderLeft: `2px solid ${color}`, background: `${color}08` }}
                >
                  <span className="text-[#475569] flex-shrink-0">{e.ts}</span>
                  <span style={{ color: color === '#22d3ee' ? '#94a3b8' : color }}>{e.msg}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Encryption metrics */}
        <div className="bg-[#060d1a] rounded border border-[#1a3354] p-2">
          <div className="font-mono text-[8px] font-bold tracking-widest text-[#475569] mb-2">ENCRYPTION METRICS</div>
          <div className="grid grid-cols-2 gap-y-1.5">
            {[
              { l: 'CIPHER', v: 'AES-256-GCM' },
              { l: 'KEY EXCHANGE', v: 'ECDHE-P384' },
              { l: 'HMAC', v: 'SHA-512' },
              { l: 'KEY ROTATION', v: '24h / auto' },
              { l: 'LAST REKEY', v: '02:00:00Z' },
              { l: 'FIPS 140-2', v: 'COMPLIANT' },
            ].map(({ l, v }) => (
              <div key={l}>
                <div className="font-mono text-[7px] text-[#475569]">{l}</div>
                <div className="font-mono text-[9px] font-bold text-[#10b981]">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
