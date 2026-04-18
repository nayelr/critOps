import React, { useState, useEffect } from 'react'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, Tooltip } from 'recharts'

// Mini gauge arc SVG
function GaugeArc({ value, label, color = '#22d3ee', size = 80 }) {
  const pct = Math.min(1, Math.max(0, value))
  const r = size * 0.38
  const cx = size / 2
  const cy = size / 2
  const startAngle = -210 // degrees
  const sweep = 240
  const endAngle = startAngle + sweep * pct

  const polarToXY = (angle, radius) => {
    const a = (angle * Math.PI) / 180
    return { x: cx + radius * Math.cos(a), y: cy + radius * Math.sin(a) }
  }

  const p1 = polarToXY(startAngle, r)
  const p2 = polarToXY(startAngle + sweep, r)
  const pEnd = polarToXY(endAngle, r)
  const large = sweep * pct > 180 ? 1 : 0

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="gauge-svg">
      {/* Track */}
      <path
        d={`M ${p1.x} ${p1.y} A ${r} ${r} 0 1 1 ${p2.x} ${p2.y}`}
        fill="none"
        stroke="#1a3354"
        strokeWidth={size * 0.07}
        strokeLinecap="round"
      />
      {/* Fill */}
      {pct > 0 && (
        <path
          d={`M ${p1.x} ${p1.y} A ${r} ${r} 0 ${large} 1 ${pEnd.x} ${pEnd.y}`}
          fill="none"
          stroke={color}
          strokeWidth={size * 0.07}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 4px ${color}88)` }}
        />
      )}
      {/* Value */}
      <text x={cx} y={cy + 2} textAnchor="middle" fill={color}
        fontSize={size * 0.18} fontFamily="Space Mono, monospace" fontWeight="bold">
        {Math.round(pct * 100)}%
      </text>
      {/* Label */}
      <text x={cx} y={cy + size * 0.22} textAnchor="middle" fill="#475569"
        fontSize={size * 0.1} fontFamily="Space Mono, monospace">
        {label}
      </text>
    </svg>
  )
}

// Threat radar chart data
const RADAR_LABELS = ['ACOUSTIC', 'SURFACE', 'CYBER', 'RF/ELEC', 'PHYSICAL', 'DRIFT']

function buildRadarData(threatLevel) {
  const base = threatLevel / 100
  return RADAR_LABELS.map(label => ({
    label,
    value: Math.max(5, Math.min(100,
      label === 'ACOUSTIC' ? (base * 90 + 10) :
      label === 'SURFACE'  ? (base * 60 + 20) :
      label === 'CYBER'    ? (base * 40 + 15) :
      Math.floor(Math.random() * 40 + 15)
    )),
  }))
}

// Mini line chart for threat trend
function ThreatTrendChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={50}>
      <LineChart data={data.map((v, i) => ({ i, v }))}>
        <Line type="monotone" dataKey="v" stroke="#22d3ee" dot={false} strokeWidth={1.5} />
        <Tooltip
          contentStyle={{ background: '#0a1628', border: '1px solid #1a3354', borderRadius: 4 }}
          labelStyle={{ display: 'none' }}
          itemStyle={{ color: '#22d3ee', fontSize: 10, fontFamily: 'Space Mono' }}
          formatter={v => [`${v.toFixed(0)}%`, 'THREAT']}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

// Confidence bar row
function ConfRow({ label, value, color = '#22d3ee' }) {
  return (
    <div className="flex items-center gap-2 py-0.5">
      <div className="text-[8px] font-mono text-[#475569] w-28 truncate flex-shrink-0">{label}</div>
      <div className="flex-1 h-1.5 bg-[#060d1a] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bar-fill"
          style={{ width: `${Math.round(value * 100)}%`, background: color }}
        />
      </div>
      <div className="font-mono text-[9px] font-bold w-7 text-right flex-shrink-0" style={{ color }}>
        {Math.round(value * 100)}%
      </div>
    </div>
  )
}

export default function AIPanel({ aiScenario, threatLevel, inferenceLatency, inferenceConfidence, history, sensors }) {
  const [radarData, setRadarData] = useState(() => buildRadarData(threatLevel))
  const [threatHistory, setThreatHistory] = useState(() =>
    Array.from({ length: 40 }, (_, i) =>
      Math.max(20, Math.min(85, 55 + (i - 20) * 0.8 + (Math.random() - 0.5) * 15))
    )
  )

  useEffect(() => {
    setRadarData(buildRadarData(threatLevel))
    setThreatHistory(prev => [...prev.slice(1), threatLevel])
  }, [threatLevel])

  const anomalyScore = Math.min(0.99, (threatLevel / 100) * 0.85 + 0.1)
  const fusionConf = 0.72 + (inferenceConfidence - 0.75) * 0.4
  const driftConf = 0.88 + (Math.random() - 0.5) * 0.05

  return (
    <div className="tac-card flex flex-col h-full">
      <div className="section-header">
        <div className="dot" />
        <span>AI / INFERENCE / ANALYTICS</span>
        <div className="ml-auto pill pill-cyan text-[8px]">AQUILA-EDGE v3.1.4</div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">

        {/* Mission AI Copilot */}
        <div className="bg-[#060d1a] border border-[#1e4070] rounded-md p-3"
          style={{ boxShadow: '0 0 12px rgba(0,245,255,0.05)' }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded-full border border-[#00f5ff] flex items-center justify-center bg-[#00f5ff11]">
              <div className="w-2 h-2 rounded-full bg-[#00f5ff]" />
            </div>
            <div className="font-mono text-[9px] font-bold tracking-widest text-[#00f5ff]">MISSION AI COPILOT</div>
            <div className="pill pill-online text-[7px] ml-auto">ACTIVE</div>
          </div>
          <p className="font-mono text-[10px] text-[#94a3b8] leading-relaxed">
            {aiScenario}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <div className="font-mono text-[8px] text-[#475569]">Inference confidence:</div>
            <div className="font-mono text-[9px] font-bold" style={{
              color: inferenceConfidence > 0.7 ? '#10b981' : inferenceConfidence > 0.5 ? '#f59e0b' : '#ef4444'
            }}>
              {Math.round(inferenceConfidence * 100)}%
            </div>
            <div className="font-mono text-[8px] text-[#475569] ml-auto">
              {inferenceLatency}ms latency
            </div>
          </div>
        </div>

        {/* Gauges row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center gap-1 bg-[#060d1a] rounded p-2 border border-[#1a3354]">
            <GaugeArc value={threatLevel / 100} label="THREAT" size={76}
              color={threatLevel > 70 ? '#ff3b3b' : threatLevel > 45 ? '#f59e0b' : '#10b981'} />
          </div>
          <div className="flex flex-col items-center gap-1 bg-[#060d1a] rounded p-2 border border-[#1a3354]">
            <GaugeArc value={anomalyScore} label="ANOMALY" size={76} color="#a78bfa" />
          </div>
          <div className="flex flex-col items-center gap-1 bg-[#060d1a] rounded p-2 border border-[#1a3354]">
            <GaugeArc value={fusionConf} label="FUSION" size={76} color="#22d3ee" />
          </div>
        </div>

        {/* Threat radar */}
        <div className="bg-[#060d1a] rounded border border-[#1a3354] p-2">
          <div className="font-mono text-[8px] font-bold tracking-widest text-[#475569] mb-1">MULTI-DOMAIN THREAT RADAR</div>
          <ResponsiveContainer width="100%" height={140}>
            <RadarChart data={radarData} outerRadius="70%">
              <PolarGrid stroke="#1a3354" />
              <PolarAngleAxis
                dataKey="label"
                tick={{ fill: '#475569', fontSize: 8, fontFamily: 'Space Mono' }}
              />
              <Radar
                name="Threat"
                dataKey="value"
                stroke="#22d3ee"
                fill="#22d3ee"
                fillOpacity={0.12}
                strokeWidth={1.5}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Threat trend */}
        <div className="bg-[#060d1a] rounded border border-[#1a3354] p-2">
          <div className="font-mono text-[8px] font-bold tracking-widest text-[#475569] mb-1">THREAT INDEX — TREND</div>
          <ThreatTrendChart data={threatHistory} />
        </div>

        {/* Confidence breakdown */}
        <div className="bg-[#060d1a] rounded border border-[#1a3354] p-2 space-y-1">
          <div className="font-mono text-[8px] font-bold tracking-widest text-[#475569] mb-2">MODEL CONFIDENCE BREAKDOWN</div>
          <ConfRow label="Acoustic Inference" value={0.81} color="#a78bfa" />
          <ConfRow label="Sensor Fusion" value={fusionConf} color="#22d3ee" />
          <ConfRow label="Drift Prediction" value={driftConf} color="#10b981" />
          <ConfRow label="Route Prediction" value={0.67} color="#38bdf8" />
          <ConfRow label="Env Trend Forecast" value={0.74} color="#fbbf24" />
          <ConfRow label="Anomaly Detection" value={anomalyScore} color="#a78bfa" />
        </div>

        {/* Recommended actions */}
        <div className="bg-[#060d1a] rounded border border-[#ff3b3b33] p-2 space-y-1.5">
          <div className="font-mono text-[8px] font-bold tracking-widest text-[#ff3b3b] mb-2">RECOMMENDED ACTIONS</div>
          {[
            { pri: 'HIGH',   action: 'Maintain hydrophone active track on UWC-01 bearing 312°' },
            { pri: 'MEDIUM', action: 'Flag UNK-2847 to shore station — AIS suppressed' },
            { pri: 'LOW',    action: 'Schedule position correction in 6 hours to counter drift' },
            { pri: 'INFO',   action: 'Request mesh relay to SENTINEL-4 for redundant uplink' },
          ].map(({ pri, action }) => {
            const color = pri === 'HIGH' ? '#ff3b3b' : pri === 'MEDIUM' ? '#f59e0b' : pri === 'LOW' ? '#10b981' : '#22d3ee'
            return (
              <div key={action} className="flex items-start gap-2 py-0.5">
                <div
                  className="pill text-[7px] flex-shrink-0 mt-0.5"
                  style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}
                >{pri}</div>
                <div className="font-mono text-[9px] text-[#94a3b8]">{action}</div>
              </div>
            )
          })}
        </div>

        {/* Edge model status */}
        <div className="bg-[#060d1a] rounded border border-[#1a3354] p-2">
          <div className="font-mono text-[8px] font-bold tracking-widest text-[#475569] mb-2">EDGE MODEL STATUS</div>
          <div className="grid grid-cols-2 gap-y-1.5 gap-x-3">
            {[
              { l: 'MODEL', v: 'AQUILA-EDGE v3.1.4', c: '#a78bfa' },
              { l: 'BACKEND', v: 'TensorRT INT8', c: '#94a3b8' },
              { l: 'LATENCY', v: `${inferenceLatency}ms`, c: '#22d3ee' },
              { l: 'LAST SYNC', v: '04:17:33Z', c: '#475569' },
              { l: 'PARAMS', v: '87M', c: '#94a3b8' },
              { l: 'QUANT', v: 'INT8 / FP16', c: '#94a3b8' },
            ].map(({ l, v, c }) => (
              <div key={l}>
                <div className="font-mono text-[7px] text-[#475569]">{l}</div>
                <div className="font-mono text-[9px] font-bold" style={{ color: c }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
