import React from 'react'

const THREAT_LEVELS = [
  { label: 'LOW',      color: '#22c55e', min: 0,   max: 0.4  },
  { label: 'MEDIUM',   color: '#eab308', min: 0.4, max: 0.65 },
  { label: 'HIGH',     color: '#ef4444', min: 0.65, max: 1.0 },
]

function getThreatLevel(confidence) {
  return THREAT_LEVELS.find(l => confidence >= l.min && confidence < l.max)
    ?? THREAT_LEVELS[THREAT_LEVELS.length - 1]
}

export default function AIPanel({ aiAssessment, recommendedAction, confidence }) {
  const threat = getThreatLevel(confidence)
  const pct = Math.round(confidence * 100)

  return (
    <div className="panel flex flex-col h-full">
      {/* Header */}
      <div className="panel-header">
        <div className="w-6 h-6 rounded border border-[#a78bfa] flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(167,139,250,0.1)' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#a78bfa" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M2 17l10 5 10-5" stroke="#a78bfa" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M2 12l10 5 10-5" stroke="#a78bfa" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="panel-label">AI Assessment</span>
        <div className="ml-auto px-2 py-0.5 rounded font-mono text-[9px] font-bold text-[#a78bfa] border border-[#a78bfa33]"
          style={{ background: 'rgba(167,139,250,0.08)' }}>
          ACORN-EDGE v3.1
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-between p-5 gap-4">

        {/* Assessment text — large, readable */}
        <div>
          <div className="font-mono text-[9px] text-[#334155] tracking-widest mb-3">SITUATION ASSESSMENT</div>
          <p className="text-[14px] text-[#94a3b8] leading-relaxed" style={{ fontWeight: 400 }}>
            {aiAssessment}
          </p>
        </div>

        {/* Threat level — BIG */}
        <div>
          <div className="font-mono text-[9px] text-[#334155] tracking-widest mb-3">THREAT LEVEL</div>
          <div className="flex items-center gap-4 mb-3">
            <div
              className="font-mono text-[28px] font-bold"
              style={{ color: threat.color }}
            >
              {threat.label}
            </div>
            <div className="flex-1">
              {/* Segmented bar */}
              <div className="flex gap-1 h-3 mb-1.5">
                {THREAT_LEVELS.map(l => (
                  <div
                    key={l.label}
                    className="flex-1 rounded transition-all duration-700"
                    style={{
                      background: confidence >= l.min ? l.color : '#1a3050',
                      opacity: confidence >= l.min ? (l.label === threat.label ? 1 : 0.35) : 0.2,
                    }}
                  />
                ))}
              </div>
              <div className="flex justify-between font-mono text-[8px] text-[#334155]">
                <span>LOW</span><span>MEDIUM</span><span>HIGH</span>
              </div>
            </div>
            <div className="font-mono text-[22px] font-bold" style={{ color: threat.color }}>
              {pct}%
            </div>
          </div>
        </div>

        {/* Recommended action */}
        <div>
          <div className="font-mono text-[9px] text-[#334155] tracking-widest mb-2">RECOMMENDED ACTION</div>
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-lg border"
            style={{
              background: `${threat.color}10`,
              borderColor: `${threat.color}33`,
            }}
          >
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: threat.color }} />
            <span className="font-mono text-[13px] font-bold" style={{ color: threat.color }}>
              {recommendedAction}
            </span>
          </div>
        </div>

        {/* Model info */}
        <div className="flex items-center justify-between border-t border-[#1a3050] pt-3">
          <div className="font-mono text-[9px] text-[#334155]">Inference latency: 847 ms</div>
          <div className="font-mono text-[9px] text-[#334155]">Model confidence: {pct}%</div>
          <div className="font-mono text-[9px] text-[#334155]">Edge · TensorRT INT8</div>
        </div>

      </div>
    </div>
  )
}
