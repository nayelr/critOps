import React, { useRef, useEffect, useState, useCallback } from 'react'
import { CLASSIFICATION_LABELS } from '../data/mockData'

// ── Waterfall / Spectrogram Canvas ────────────────────────────────
function WaterfallCanvas({ activeContact }) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const timeRef = useRef(0)
  const contactRef = useRef(activeContact)

  useEffect(() => { contactRef.current = activeContact }, [activeContact])

  // Map 0-1 intensity to RGBA
  const intensityToColor = (intensity) => {
    // Deep navy → cyan → white color scale
    const i = Math.max(0, Math.min(1, intensity))
    if (i < 0.2) {
      // near black to dark blue
      const t = i / 0.2
      return [Math.floor(t * 10), Math.floor(t * 20 + 5), Math.floor(t * 50 + 20), 255]
    } else if (i < 0.5) {
      // dark blue to cyan
      const t = (i - 0.2) / 0.3
      return [0, Math.floor(t * 200 + 20), Math.floor(t * 150 + 70), 255]
    } else if (i < 0.75) {
      // cyan to yellow
      const t = (i - 0.5) / 0.25
      return [Math.floor(t * 220), Math.floor(200 + t * 55), Math.floor(220 - t * 200), 255]
    } else {
      // yellow to white
      const t = (i - 0.75) / 0.25
      return [Math.floor(220 + t * 35), 255, Math.floor(20 + t * 235), 255]
    }
  }

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    const W = canvas.width
    const H = canvas.height
    timeRef.current += 1

    // Shift existing image down by 1 row
    if (H > 1) {
      const imageData = ctx.getImageData(0, 0, W, H - 1)
      ctx.putImageData(imageData, 0, 1)
    }

    // Generate new top row
    const rowData = ctx.createImageData(W, 1)
    const contact = contactRef.current
    const t = timeRef.current

    // Determine active tonal frequencies from contact
    let tonalFreq = -1
    let tonalStrength = 0
    if (contact && contact.classification === 'probable_submersible') {
      // Map 35-55Hz to 0.1-0.3 normalized freq band
      const normFreq = ((contact.freq_peak ?? 42) - 20) / 200
      tonalFreq = normFreq
      tonalStrength = (contact.confidence ?? 0.7) * 0.9
    }

    for (let x = 0; x < W; x++) {
      const f = x / W // normalized 0-1 frequency

      // ── Base ambient noise ──
      let intensity = Math.random() * 0.12 + 0.03

      // ── Low-frequency ocean swell (0-5 Hz) ──
      if (f < 0.04) {
        intensity += 0.25 + 0.15 * Math.sin(t * 0.03 + f * 40)
      }

      // ── Biological noise band (50-500 Hz) ──
      if (f > 0.12 && f < 0.5) {
        const bio = 0.05 * Math.sin(t * 0.07 + f * 120) * Math.random()
        intensity += Math.max(0, bio)
      }

      // ── Commercial shipping broadband (20-200 Hz) ──
      if (f > 0.05 && f < 0.25) {
        const ship = 0.18 * Math.pow(1 - (f - 0.05) / 0.2, 2)
        intensity += ship * (0.6 + 0.4 * Math.sin(t * 0.02))
      }

      // ── Tonal line from contact ──
      if (tonalFreq > 0) {
        const spread = 0.012
        const dist = Math.abs(f - tonalFreq)
        if (dist < spread * 3) {
          const gaussian = Math.exp(-0.5 * Math.pow(dist / spread, 2))
          // Add Doppler wobble
          const dopplerShift = 0.002 * Math.sin(t * 0.04)
          const shiftedDist = Math.abs(f - tonalFreq - dopplerShift)
          const sg = Math.exp(-0.5 * Math.pow(shiftedDist / spread, 2))
          intensity += tonalStrength * sg * (0.7 + 0.3 * Math.sin(t * 0.08))
        }
      }

      // ── Harmonic series from contact ──
      if (tonalFreq > 0) {
        for (let h = 2; h <= 5; h++) {
          const hFreq = tonalFreq * h
          if (hFreq < 1) {
            const hSpread = 0.008
            const hDist = Math.abs(f - hFreq)
            if (hDist < hSpread * 3) {
              const hg = Math.exp(-0.5 * Math.pow(hDist / hSpread, 2))
              intensity += (tonalStrength / h) * hg * 0.6
            }
          }
        }
      }

      // ── Interference / transient spikes ──
      if (Math.random() < 0.0003) {
        intensity += 0.9 + Math.random() * 0.1
      }

      // ── Clamp and colorize ──
      const [r, g, b, a] = intensityToColor(intensity)
      const idx = x * 4
      rowData.data[idx]     = r
      rowData.data[idx + 1] = g
      rowData.data[idx + 2] = b
      rowData.data[idx + 3] = a
    }

    ctx.putImageData(rowData, 0, 0)

    // Draw frequency axis overlay (do once, it scrolls with the data but that's ok for aesthetics)
    animRef.current = requestAnimationFrame(draw)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    ctx.fillStyle = '#04091a'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    animRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animRef.current)
  }, [draw])

  return (
    <canvas
      ref={canvasRef}
      width={900}
      height={200}
      id="spectrogram-canvas"
      className="rounded w-full"
      style={{ height: '200px', imageRendering: 'auto' }}
    />
  )
}

// ── Bearing indicator ──────────────────────────────────────────
function BearingIndicator({ bearing }) {
  const cx = 40, cy = 40, r = 32
  const rad = ((bearing - 90) * Math.PI) / 180
  const x2 = cx + r * 0.85 * Math.cos(rad)
  const y2 = cy + r * 0.85 * Math.sin(rad)

  return (
    <svg width="80" height="80" viewBox="0 0 80 80">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1a3354" strokeWidth="1" />
      <circle cx={cx} cy={cy} r={r * 0.65} fill="none" stroke="#122040" strokeWidth="0.5" strokeDasharray="3 3" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map(a => {
        const ar = ((a - 90) * Math.PI) / 180
        const x1 = cx + r * 0.88 * Math.cos(ar)
        const y1 = cy + r * 0.88 * Math.sin(ar)
        const xt = cx + r * 1.1 * Math.cos(ar)
        const yt = cy + r * 1.1 * Math.sin(ar)
        return (
          <g key={a}>
            <line x1={cx + r * 0.78 * Math.cos(ar)} y1={cy + r * 0.78 * Math.sin(ar)} x2={x1} y2={y1}
              stroke="#1a3354" strokeWidth="0.5" />
          </g>
        )
      })}
      <text x={cx} y={cy - r - 4} textAnchor="middle" fill="#475569" fontSize="7" fontFamily="Space Mono">N</text>
      <text x={cx + r + 4} y={cy + 3} textAnchor="start" fill="#475569" fontSize="7" fontFamily="Space Mono">E</text>
      <text x={cx} y={cy + r + 10} textAnchor="middle" fill="#475569" fontSize="7" fontFamily="Space Mono">S</text>
      <text x={cx - r - 4} y={cy + 3} textAnchor="end" fill="#475569" fontSize="7" fontFamily="Space Mono">W</text>

      {/* Bearing line */}
      <line x1={cx} y1={cy} x2={x2} y2={y2} stroke="#ff3b3b" strokeWidth="2" strokeLinecap="round" />
      <circle cx={x2} cy={y2} r="3" fill="#ff3b3b" opacity="0.9" />
      <circle cx={cx} cy={cy} r="3" fill="#22d3ee" />

      {/* Bearing label */}
      <text x={cx} y={cy + 3} textAnchor="middle" fill="#00f5ff" fontSize="8" fontFamily="Space Mono" fontWeight="bold">
        {bearing}°
      </text>
    </svg>
  )
}

// ── Confidence bar ─────────────────────────────────────────────
function ConfBar({ label, value, color = '#22d3ee' }) {
  return (
    <div className="flex items-center gap-2">
      <div className="text-[9px] font-mono text-[#475569] w-24 truncate">{label}</div>
      <div className="flex-1 h-2 bg-[#0a1628] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.round(value * 100)}%`, background: color }}
        />
      </div>
      <div className="font-mono text-[10px] font-bold w-8 text-right" style={{ color }}>
        {Math.round(value * 100)}%
      </div>
    </div>
  )
}

// ── Freq axis labels ──────────────────────────────────────────
const FREQ_LABELS = ['DC', '25 Hz', '50 Hz', '100 Hz', '200 Hz', '500 Hz', '1 kHz', '2 kHz', '4 kHz', '8 kHz', '16 kHz']

export default function HydrophonePanel({ acousticLog, activeContact }) {
  const contact = activeContact ?? acousticLog?.[0]
  const cls = contact ? CLASSIFICATION_LABELS[contact.classification] : null
  const isThreat = contact?.classification === 'probable_submersible'

  return (
    <div className={`tac-card flex flex-col ${isThreat ? 'border-[#ff3b3b55]' : ''}`}
         style={isThreat ? { boxShadow: '0 0 20px rgba(255, 59, 59, 0.12)' } : {}}>

      <div className="section-header justify-between" style={isThreat ? { borderBottomColor: '#ff3b3b33' } : {}}>
        <div className="flex items-center gap-2">
          <div className="dot" style={isThreat ? { background: '#ff3b3b', boxShadow: '0 0 8px rgba(255,59,59,0.7)' } : {}} />
          <span>HYDROPHONE / ACOUSTIC DETECTION SUBSYSTEM</span>
          <div className="pill pill-online text-[8px]">48-ELEMENT ARRAY</div>
        </div>
        <div className="flex items-center gap-3">
          {isThreat && (
            <div className="contact-flash rounded px-2 py-0.5 font-mono text-[9px] font-bold text-[#ff3b3b] border border-[#ff3b3b44]">
              ▲ SUSPICIOUS CONTACT DETECTED
            </div>
          )}
          <div className="pill pill-online text-[8px]">ONLINE</div>
          <div className="font-mono text-[9px] text-[#10b981]">SNR: 28.4 dB</div>
        </div>
      </div>

      {/* Alert banner */}
      {isThreat && (
        <div className="contact-flash border-b border-[#ff3b3b33] px-4 py-2 flex items-center gap-3">
          <div className="blink-dot w-2 h-2 rounded-full bg-[#ff3b3b]" />
          <span className="font-mono text-[10px] font-bold text-[#ff3b3b]">
            ACOUSTIC CONTACT {contact?.id} — {cls?.label} — BRG {contact?.bearing}° — {contact?.range_m}m — CONF {Math.round((contact?.confidence ?? 0) * 100)}%
          </span>
          <span className="font-mono text-[9px] text-[#ff3b3b88] ml-auto">
            DOPPLER: {contact?.doppler >= 0 ? '+' : ''}{contact?.doppler} kn · PEAK: {contact?.freq_peak} Hz
          </span>
        </div>
      )}

      <div className="flex gap-0 flex-1">

        {/* ── Left: Waterfall + freq axis ─────────────────── */}
        <div className="flex-1 p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between mb-1">
            <div className="font-mono text-[9px] font-bold tracking-widest text-[#22d3ee]">
              ACOUSTIC SPECTRUM — WATERFALL DISPLAY
            </div>
            <div className="flex gap-2">
              <div className="pill pill-cyan text-[8px]">LIVE STREAM</div>
              <div className="pill pill-dim text-[8px]">DEPTH: {(87).toFixed(0)}m</div>
            </div>
          </div>

          {/* Frequency axis */}
          <div className="flex justify-between px-0.5 mb-0.5">
            {FREQ_LABELS.map(l => (
              <div key={l} className="font-mono text-[7px] text-[#475569]">{l}</div>
            ))}
          </div>

          {/* Waterfall canvas */}
          <WaterfallCanvas activeContact={contact} />

          {/* Colorbar legend */}
          <div className="flex items-center gap-2 mt-1">
            <div className="font-mono text-[8px] text-[#475569]">QUIET</div>
            <div className="flex-1 h-2 rounded"
              style={{ background: 'linear-gradient(90deg, #060d1a, #003040, #00c8c8, #ffff00, #ffffff)' }} />
            <div className="font-mono text-[8px] text-[#475569]">LOUD</div>
          </div>

          {/* Doppler indicator */}
          <div className="flex items-center gap-4 mt-1 p-2 bg-[#060d1a] rounded border border-[#1a3354]">
            <div className="font-mono text-[9px] text-[#475569]">DOPPLER SHIFT</div>
            <div className="flex-1 relative h-1.5 rounded bg-[#0a1628]">
              <div className="absolute top-0 bottom-0 left-1/2 w-px bg-[#1a3354]" />
              <div
                className="absolute top-0 h-full rounded transition-all duration-500"
                style={{
                  width: '6px',
                  background: isThreat ? '#ff3b3b' : '#22d3ee',
                  left: `calc(50% + ${(contact?.doppler ?? 0) * 30}%)`,
                  transform: 'translateX(-50%)',
                  boxShadow: isThreat ? '0 0 6px #ff3b3b' : '0 0 6px #22d3ee',
                }}
              />
            </div>
            <div className="font-mono text-[10px] font-bold" style={{ color: isThreat ? '#ff3b3b' : '#22d3ee' }}>
              {contact?.doppler >= 0 ? '+' : ''}{(contact?.doppler ?? 0).toFixed(2)} kn
            </div>
            <div className="font-mono text-[9px] text-[#475569]">
              {(contact?.doppler ?? 0) < -0.1 ? '← APPROACHING' : (contact?.doppler ?? 0) > 0.1 ? 'RECEDING →' : 'STATIONARY'}
            </div>
          </div>

          {/* Timeline of detections (last 60 min) */}
          <div className="mt-2">
            <div className="font-mono text-[8px] font-bold tracking-widest text-[#475569] mb-1">
              DETECTION TIMELINE — PAST 60 MIN
            </div>
            <div className="relative h-6 bg-[#060d1a] rounded border border-[#1a3354] overflow-hidden">
              <div className="absolute inset-y-0 left-0 right-0 flex items-center">
                {acousticLog?.slice().reverse().map((e, i) => {
                  const x = (i / Math.max(acousticLog.length - 1, 1)) * 100
                  const c = CLASSIFICATION_LABELS[e.classification]
                  return (
                    <div
                      key={e.id}
                      className="absolute w-1.5 h-1.5 rounded-full"
                      style={{
                        left: `${x}%`,
                        background: c?.color ?? '#475569',
                        boxShadow: `0 0 4px ${c?.color ?? '#475569'}`,
                        top: '50%',
                        transform: 'translateY(-50%)',
                      }}
                      title={`${e.id}: ${c?.label} — ${e.ts}`}
                    />
                  )
                })}
              </div>
              <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1">
                <span className="font-mono text-[6px] text-[#475569]">−60m</span>
                <span className="font-mono text-[6px] text-[#475569]">NOW</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Center: Contact detail ─────────────────────── */}
        <div className="w-52 border-l border-[#1a3354] p-3 flex flex-col gap-3">
          <div className="font-mono text-[9px] font-bold tracking-widest text-[#22d3ee]">ACTIVE CONTACT</div>

          {contact ? (
            <>
              <div className="flex items-center justify-between">
                <div className="font-mono text-[14px] font-bold" style={{ color: cls?.color ?? '#94a3b8' }}>
                  {contact.id}
                </div>
                <div
                  className="pill text-[8px]"
                  style={{ background: `${cls?.color ?? '#94a3b8'}22`, color: cls?.color ?? '#94a3b8', border: `1px solid ${cls?.color ?? '#94a3b8'}44` }}
                >
                  {cls?.label ?? 'UNKNOWN'}
                </div>
              </div>

              <BearingIndicator bearing={contact.bearing} />

              <div className="space-y-1.5">
                {[
                  { l: 'BEARING', v: `${contact.bearing}°`, c: '#00f5ff' },
                  { l: 'EST RANGE', v: `${contact.range_m.toLocaleString()} m`, c: '#94a3b8' },
                  { l: 'PEAK FREQ', v: `${contact.freq_peak} Hz`, c: '#a78bfa' },
                  { l: 'DOPPLER', v: `${contact.doppler >= 0 ? '+' : ''}${contact.doppler} kn`, c: isThreat ? '#ff3b3b' : '#22d3ee' },
                  { l: 'TIMESTAMP', v: contact.ts, c: '#475569' },
                ].map(({ l, v, c }) => (
                  <div key={l} className="flex justify-between items-center">
                    <div className="font-mono text-[8px] text-[#475569]">{l}</div>
                    <div className="font-mono text-[10px] font-bold" style={{ color: c }}>{v}</div>
                  </div>
                ))}
              </div>

              <div className="mt-1">
                <ConfBar label="CONFIDENCE" value={contact.confidence} color={cls?.color ?? '#22d3ee'} />
              </div>

              <div className="bg-[#060d1a] rounded p-2 border border-[#1a3354]">
                <div className="font-mono text-[8px] text-[#475569] mb-1">AI CLASSIFICATION NOTE</div>
                <div className="font-mono text-[9px] text-[#94a3b8] leading-relaxed">{contact.note}</div>
              </div>

              {/* Candidate confidence breakdown */}
              <div className="mt-1 space-y-1">
                <div className="font-mono text-[8px] font-bold tracking-widest text-[#475569]">AI INFERENCE</div>
                <ConfBar label="Prob Submersible" value={isThreat ? contact.confidence : 0.12} color="#ff3b3b" />
                <ConfBar label="Comm Vessel" value={isThreat ? 0.18 : 0.72} color="#10b981" />
                <ConfBar label="Biologic" value={isThreat ? 0.06 : 0.11} color="#22d3ee" />
                <ConfBar label="Interference" value={0.04} color="#475569" />
              </div>
            </>
          ) : (
            <div className="font-mono text-[9px] text-[#475569] text-center mt-4">NO ACTIVE CONTACT</div>
          )}
        </div>

        {/* ── Right: Contact log ──────────────────────────── */}
        <div className="w-72 border-l border-[#1a3354] flex flex-col">
          <div className="px-3 py-2 border-b border-[#1a3354] font-mono text-[9px] font-bold tracking-widest text-[#475569]">
            CONTACT HISTORY LOG
          </div>
          <div className="flex-1 overflow-y-auto">
            {acousticLog?.map((e) => {
              const c = CLASSIFICATION_LABELS[e.classification]
              return (
                <div
                  key={e.id}
                  className="px-3 py-2 border-b border-[#0a1628] hover:bg-[#0a1628] transition-colors cursor-default"
                  style={{ borderLeft: `3px solid ${c?.color ?? '#475569'}` }}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="font-mono text-[9px] font-bold" style={{ color: c?.color ?? '#94a3b8' }}>
                      {e.id}
                    </div>
                    <div className="font-mono text-[8px] text-[#475569]">{e.ts}</div>
                  </div>
                  <div
                    className="pill text-[7px] mb-1"
                    style={{ background: `${c?.color ?? '#94a3b8'}22`, color: c?.color ?? '#94a3b8', border: `1px solid ${c?.color ?? '#94a3b8'}44` }}
                  >
                    {c?.label ?? 'UNKNOWN'}
                  </div>
                  <div className="font-mono text-[8px] text-[#475569]">
                    BRG {e.bearing}° · {e.range_m.toLocaleString()}m · {Math.round(e.confidence * 100)}% conf
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
