import React, { useRef, useEffect, useCallback } from 'react'

// ── Waterfall Spectrogram ─────────────────────────────────────────
function Spectrogram({ confidence, submersibleDetected }) {
  const canvasRef = useRef(null)
  const animRef   = useRef(null)
  const tickRef   = useRef(0)
  const confRef   = useRef(confidence)
  useEffect(() => { confRef.current = confidence }, [confidence])

  const colorize = (intensity) => {
    const i = Math.max(0, Math.min(1, intensity))
    if (i < 0.25) {
      const t = i / 0.25
      return [4, Math.floor(t * 18 + 5), Math.floor(t * 45 + 18), 255]
    } else if (i < 0.55) {
      const t = (i - 0.25) / 0.3
      return [0, Math.floor(t * 180 + 23), Math.floor(t * 140 + 63), 255]
    } else if (i < 0.80) {
      const t = (i - 0.55) / 0.25
      return [Math.floor(t * 200), Math.floor(180 + t * 55), Math.floor(203 - t * 160), 255]
    } else {
      const t = (i - 0.80) / 0.20
      return [Math.floor(200 + t * 55), 235, Math.floor(43 + t * 212), 255]
    }
  }

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    const W = canvas.width, H = canvas.height
    tickRef.current++
    const t = tickRef.current
    const conf = confRef.current
    const tonalGain = submersibleDetected ? conf : conf * 0.06

    // Scroll existing rows down
    if (H > 1) {
      const img = ctx.getImageData(0, 0, W, H - 1)
      ctx.putImageData(img, 0, 1)
    }

    // New top row
    const row = ctx.createImageData(W, 1)
    for (let x = 0; x < W; x++) {
      const f = x / W
      let intensity = Math.random() * 0.09 + 0.03

      // Low-freq ocean swell
      if (f < 0.06)  intensity += 0.28 + 0.1 * Math.sin(t * 0.03 + f * 30)
      // Shipping broadband
      if (f > 0.06 && f < 0.3) intensity += 0.14 * Math.pow(1 - (f - 0.06) / 0.24, 2) * (0.7 + 0.3 * Math.sin(t * 0.02))

      // ── Optional threat tonal at ~42 Hz (suppressed in lab / no-sub demo) ──
      const tonalFreq = 0.14
      const spread    = 0.009
      const dist      = Math.abs(f - tonalFreq)
      if (tonalGain > 0.02 && dist < spread * 4) {
        const dopWobble = 0.003 * Math.sin(t * 0.05)
        const sd = Math.abs(f - tonalFreq - dopWobble)
        const g  = Math.exp(-0.5 * Math.pow(sd / spread, 2))
        intensity += tonalGain * 0.85 * g * (0.75 + 0.25 * Math.sin(t * 0.09))
      }
      for (let h = 2; h <= 4; h++) {
        const hf = tonalFreq * h
        if (tonalGain > 0.02 && hf < 1) {
          const hd = Math.abs(f - hf)
          const hg = Math.exp(-0.5 * Math.pow(hd / (spread * 0.8), 2))
          intensity += (tonalGain / h) * 0.5 * hg
        }
      }

      // Rare transient spike
      if (Math.random() < 0.0002) intensity = 0.95

      const [r, g, b, a] = colorize(intensity)
      const idx = x * 4
      row.data[idx] = r; row.data[idx+1] = g; row.data[idx+2] = b; row.data[idx+3] = a
    }
    ctx.putImageData(row, 0, 0)
    animRef.current = requestAnimationFrame(draw)
  }, [submersibleDetected])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    ctx.fillStyle = '#040912'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    animRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animRef.current)
  }, [draw])

  return (
    <div className="relative">
      {/* Frequency labels */}
      <div className="flex justify-between px-1 mb-1">
        {['DC', '25 Hz', '50 Hz', '100 Hz', '250 Hz', '500 Hz', '1 kHz', '4 kHz'].map(l => (
          <span key={l} className="font-mono text-[8px] text-[#334155]">{l}</span>
        ))}
      </div>
      <canvas
        ref={canvasRef}
        id="hydro-canvas"
        width={800}
        height={140}
        className="rounded"
        style={{ height: 140 }}
      />
      {submersibleDetected && (
        <>
          <div
            className="absolute top-5 bottom-0 w-px opacity-50 pointer-events-none"
            style={{ left: '14%', background: 'rgba(239,68,68,0.7)' }}
          />
          <div
            className="absolute font-mono text-[8px] text-[#ef4444] opacity-70 pointer-events-none"
            style={{ left: 'calc(14% + 3px)', top: 6 }}
          >
            42 Hz
          </div>
        </>
      )}
      {/* Color scale */}
      <div className="flex items-center gap-2 mt-1.5">
        <span className="font-mono text-[8px] text-[#334155]">QUIET</span>
        <div className="flex-1 h-1.5 rounded"
          style={{ background: 'linear-gradient(90deg, #04091a, #003848, #00c8c8, #ffee00, #fff)' }} />
        <span className="font-mono text-[8px] text-[#334155]">LOUD</span>
      </div>
    </div>
  )
}

// ── Bearing rose ──────────────────────────────────────────────────
function BearingRose({ bearing, submersibleDetected }) {
  const cx = 44, cy = 44, r = 34
  const rad = ((bearing - 90) * Math.PI) / 180
  const x2 = cx + r * 0.82 * Math.cos(rad)
  const y2 = cy + r * 0.82 * Math.sin(rad)
  const needle = submersibleDetected ? '#ef4444' : '#64748b'

  return (
    <svg width={88} height={88} viewBox="0 0 88 88">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1a3050" strokeWidth="1" />
      <circle cx={cx} cy={cy} r={r * 0.55} fill="none" stroke="#0c1d30" strokeWidth="0.5" strokeDasharray="3 4" />
      {['N','E','S','W'].map((dir, i) => {
        const a = (i * 90 - 90) * Math.PI / 180
        return (
          <text key={dir}
            x={cx + (r + 8) * Math.cos(a)} y={cy + (r + 8) * Math.sin(a) + 3}
            textAnchor="middle" fill="#334155" fontSize="8" fontFamily="Space Mono">
            {dir}
          </text>
        )
      })}
      <line x1={cx} y1={cy} x2={x2} y2={y2} stroke={needle} strokeWidth="2.5" strokeLinecap="round" opacity={submersibleDetected ? 1 : 0.35} />
      <circle cx={x2} cy={y2} r={3.5} fill={needle} opacity={submersibleDetected ? 1 : 0.35} />
      <circle cx={cx} cy={cy} r={3} fill="#00d4ff" />
    </svg>
  )
}

// ── Main component ────────────────────────────────────────────────
export default function HydrophonePanel({ confidence, threatRange, submersibleDetected = true, waterTemp = 21 }) {
  const pct = Math.round(confidence * 100)

  return (
    <div className="panel flex flex-col h-full">
      {/* Header */}
      <div className="panel-header justify-between">
        <div className="flex items-center gap-2.5">
          <div className="dot-online" />
          <span className="panel-label">Hydrophone Detection</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-[#334155]">
            {submersibleDetected ? '48-element array · 87 m depth' : '48-element array · shallow test · 0.4 m'}
          </span>
          <div className="px-2 py-0.5 rounded font-mono text-[9px] font-bold text-[#22c55e] border border-[#22c55e33]"
            style={{ background: 'rgba(34,197,94,0.08)' }}>
            ACTIVE
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-0 overflow-hidden">
        {/* ── ALERT BANNER ───────────────────────────────── */}
        {submersibleDetected ? (
          <div className="alert-banner border-b border-[#ef444433] px-5 py-2.5 flex items-center gap-4"
            style={{ background: 'rgba(239,68,68,0.12)' }}>
            <div className="dot-threat flex-shrink-0" style={{ width: 10, height: 10 }} />
            <div>
              <div className="font-bold text-[13px] text-[#ef4444] leading-tight">
                CONTACT DETECTED — UWC-01
              </div>
              <div className="text-[11px] text-[#ef444499] mt-0.5 font-mono">
                Probable Submersible · Bearing 312° · {threatRange.toFixed(2)} km · {pct}% confidence
              </div>
            </div>
            <div className="ml-auto font-mono text-[11px] text-[#ef4444]">
              Doppler: −0.34 kn ← APPROACHING
            </div>
          </div>
        ) : (
          <div className="border-b border-[#22c55e33] px-5 py-2.5 flex items-center gap-4"
            style={{ background: 'rgba(34,197,94,0.08)' }}>
            <div className="dot-online flex-shrink-0" style={{ width: 10, height: 10 }} />
            <div>
              <div className="font-bold text-[13px] text-[#22c55e] leading-tight">
                NO SUBMERSIBLE DETECTED
              </div>
              <div className="text-[11px] text-[#94a3b8] mt-0.5 font-mono">
                Ambient noise only · micro-motion {(threatRange * 1000).toFixed(0)} mm RMS · {pct}% score
              </div>
            </div>
            <div className="ml-auto font-mono text-[11px] text-[#64748b]">
              Doppler: n/a (no track)
            </div>
          </div>
        )}

        {/* ── SPECTROGRAM ─────────────────────────────────── */}
        <div className="px-5 pt-3 pb-1">
          <div className="font-mono text-[9px] text-[#334155] tracking-widest mb-2">
            ACOUSTIC SPECTRUM — WATERFALL DISPLAY
          </div>
          <Spectrogram confidence={confidence} submersibleDetected={submersibleDetected} />
        </div>

        {/* ── CONTACT DETAIL ──────────────────────────────── */}
        <div className="flex items-start gap-6 px-5 py-3 border-t border-[#1a3050] mt-auto">

          {/* Bearing rose */}
          <div className="flex-shrink-0">
            <div className="font-mono text-[9px] text-[#334155] mb-1.5">BEARING</div>
            <BearingRose bearing={submersibleDetected ? 312 : 0} submersibleDetected={submersibleDetected} />
          </div>

          {/* Contact fields */}
          <div className="flex-1 grid grid-cols-2 gap-x-8 gap-y-3 pt-1">
            {(submersibleDetected
              ? [
                  { label: 'CLASSIFICATION',  value: 'Probable Submersible', color: '#ef4444' },
                  { label: 'CONFIDENCE',      value: `${pct}%`,              color: '#ef4444' },
                  { label: 'BEARING',         value: '312° NW',              color: '#f1f5f9' },
                  { label: 'EST. RANGE',      value: `${threatRange.toFixed(2)} km`, color: '#f1f5f9' },
                  { label: 'PEAK FREQUENCY',  value: '42 Hz',                color: '#94a3b8' },
                  { label: 'DOPPLER SHIFT',   value: '−0.34 kn',             color: '#ef4444' },
                ]
              : [
                  { label: 'CLASSIFICATION',  value: 'No submersible', color: '#22c55e' },
                  { label: 'ANOMALY SCORE',   value: `${pct}%`, color: '#94a3b8' },
                  { label: 'WATER COLUMN',    value: 'Calibrated fixture · fresh', color: '#f1f5f9' },
                  { label: 'WATER TEMP',      value: `${Number(waterTemp).toFixed(2)} °C`, color: '#f1f5f9' },
                  { label: 'PEAK LINE',       value: 'None (42 Hz idle)', color: '#64748b' },
                  { label: 'DOPPLER',         value: 'n/a', color: '#64748b' },
                ]
            ).map(({ label, value, color }) => (
              <div key={label}>
                <div className="font-mono text-[9px] text-[#334155] mb-0.5">{label}</div>
                <div className="font-mono text-[13px] font-bold" style={{ color }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Confidence meter */}
          <div className="flex-shrink-0 w-28">
            <div className="font-mono text-[9px] text-[#334155] mb-2">
              {submersibleDetected ? 'CONFIDENCE' : 'ANOMALY'}
            </div>
            <div
              className="font-mono text-[32px] font-bold leading-none"
              style={{ color: submersibleDetected ? '#ef4444' : '#22c55e' }}
            >
              {pct}%
            </div>
            <div className="mt-2 threat-track">
              <div
                className="threat-fill"
                style={{
                  width: `${pct}%`,
                  background: submersibleDetected
                    ? (pct > 70 ? '#ef4444' : pct > 50 ? '#eab308' : '#22c55e')
                    : '#22c55e',
                }}
              />
            </div>
            <div className="font-mono text-[9px] mt-1.5"
              style={{ color: submersibleDetected ? (pct > 70 ? '#ef4444' : '#eab308') : '#22c55e' }}>
              {submersibleDetected ? (pct > 70 ? 'HIGH CONFIDENCE' : 'MODERATE') : 'BACKGROUND OK'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
