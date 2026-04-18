import React, { useRef, useEffect } from 'react'

// Animated SVG digital twin of buoy + sea environment
function TwinCanvas({ sensors }) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const frameRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width
    const H = canvas.height

    const draw = () => {
      frameRef.current++
      const f = frameRef.current
      ctx.clearRect(0, 0, W, H)

      // Background
      ctx.fillStyle = '#04091a'
      ctx.fillRect(0, 0, W, H)

      // Grid
      ctx.strokeStyle = 'rgba(0, 245, 255, 0.04)'
      ctx.lineWidth = 0.5
      for (let x = 0; x < W; x += 20) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
      }
      for (let y = 0; y < H; y += 20) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
      }

      // Sea level (animated waves)
      const seaY = H * 0.55
      const roll = (sensors?.roll ?? -1.4) * Math.PI / 180
      const pitch = (sensors?.pitch ?? 2.1) * Math.PI / 180
      const waveH = (sensors?.wave_height ?? 0.8) * 8

      // Water fill
      ctx.beginPath()
      ctx.moveTo(0, seaY)
      for (let x = 0; x <= W; x += 4) {
        const wy = seaY + waveH * Math.sin(x * 0.03 + f * 0.04) + 3 * Math.sin(x * 0.07 + f * 0.06)
        ctx.lineTo(x, wy)
      }
      ctx.lineTo(W, H)
      ctx.lineTo(0, H)
      ctx.closePath()
      const waterGrad = ctx.createLinearGradient(0, seaY, 0, H)
      waterGrad.addColorStop(0, 'rgba(0, 40, 80, 0.7)')
      waterGrad.addColorStop(1, 'rgba(0, 15, 35, 0.9)')
      ctx.fillStyle = waterGrad
      ctx.fill()

      // Wave highlights
      ctx.strokeStyle = 'rgba(0, 245, 255, 0.15)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, seaY)
      for (let x = 0; x <= W; x += 4) {
        const wy = seaY + waveH * Math.sin(x * 0.03 + f * 0.04) + 3 * Math.sin(x * 0.07 + f * 0.06)
        ctx.lineTo(x, wy)
      }
      ctx.stroke()

      // Sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, seaY)
      skyGrad.addColorStop(0, 'rgba(2, 8, 20, 0.95)')
      skyGrad.addColorStop(1, 'rgba(5, 18, 40, 0.6)')
      ctx.fillStyle = skyGrad
      ctx.fillRect(0, 0, W, seaY)

      // ── BUOY BODY ──────────────────────────────────────────
      const bx = W * 0.5
      const by = seaY - 4 + waveH * 0.3 * Math.sin(f * 0.04)

      ctx.save()
      ctx.translate(bx, by)
      ctx.rotate(roll + 0.1 * Math.sin(f * 0.025) + pitch * 0.5)

      // Hull (ellipse)
      ctx.beginPath()
      ctx.ellipse(0, 6, 14, 8, 0, 0, Math.PI * 2)
      const hullGrad = ctx.createLinearGradient(-14, 0, 14, 0)
      hullGrad.addColorStop(0, '#0d2a4a')
      hullGrad.addColorStop(0.5, '#1a4a7a')
      hullGrad.addColorStop(1, '#0d2a4a')
      ctx.fillStyle = hullGrad
      ctx.fill()
      ctx.strokeStyle = '#22d3ee'
      ctx.lineWidth = 1
      ctx.stroke()

      // Mast
      ctx.strokeStyle = '#94a3b8'
      ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.moveTo(0, 6); ctx.lineTo(0, -32); ctx.stroke()

      // Antenna
      ctx.strokeStyle = '#00f5ff'
      ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(0, -32); ctx.lineTo(-8, -28); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(0, -32); ctx.lineTo(8, -28); ctx.stroke()

      // Solar panel
      ctx.fillStyle = '#1a3a6a'
      ctx.strokeStyle = '#22d3ee'
      ctx.lineWidth = 0.5
      ctx.beginPath()
      ctx.rect(-10, -20, 8, 5)
      ctx.fill(); ctx.stroke()
      ctx.beginPath()
      ctx.rect(2, -20, 8, 5)
      ctx.fill(); ctx.stroke()

      // Blinking status LED
      if (f % 60 < 30) {
        ctx.beginPath()
        ctx.arc(0, -30, 2, 0, Math.PI * 2)
        ctx.fillStyle = '#10b981'
        ctx.fill()
        ctx.shadowColor = '#10b981'
        ctx.shadowBlur = 8
        ctx.fill()
        ctx.shadowBlur = 0
      }

      // Hydrophone sensor (below waterline indicator)
      ctx.strokeStyle = 'rgba(167, 139, 250, 0.5)'
      ctx.setLineDash([2, 3])
      ctx.beginPath(); ctx.moveTo(0, 12); ctx.lineTo(0, 22); ctx.stroke()
      ctx.setLineDash([])
      ctx.beginPath()
      ctx.arc(0, 24, 3, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(167, 139, 250, 0.7)'
      ctx.fill()

      ctx.restore()

      // ── BUOY DETECTION RINGS ─────────────────────────────
      const ringAlpha = 0.05 + 0.04 * Math.sin(f * 0.03)
      for (let r = 1; r <= 3; r++) {
        ctx.beginPath()
        ctx.arc(bx, seaY, r * 28 + 4 * Math.sin(f * 0.02 + r), 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(0, 245, 255, ${ringAlpha / r})`
        ctx.lineWidth = 0.5
        ctx.stroke()
      }

      // ── UNDERWATER CONTACT (simulated position) ─────────
      const contactX = bx + 60
      const contactY = seaY + 35

      ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)'
      ctx.lineWidth = 1
      ctx.setLineDash([4, 4])
      ctx.beginPath(); ctx.moveTo(bx, seaY + 10); ctx.lineTo(contactX, contactY); ctx.stroke()
      ctx.setLineDash([])

      ctx.beginPath()
      ctx.arc(contactX, contactY, 5, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(239, 68, 68, 0.7)'
      ctx.fill()

      // Contact uncertainty ellipse
      ctx.beginPath()
      ctx.ellipse(contactX, contactY, 12, 8, f * 0.01, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.25)'
      ctx.lineWidth = 0.8
      ctx.stroke()

      // Label
      ctx.font = 'bold 7px "Space Mono", monospace'
      ctx.fillStyle = 'rgba(239, 68, 68, 0.85)'
      ctx.fillText('UWC-01', contactX - 14, contactY - 10)

      // ── SURFACE VESSEL ───────────────────────────────────
      const vx = W * 0.75 + 20 * Math.sin(f * 0.005)
      const vy = seaY + waveH * Math.sin(vx * 0.03 + f * 0.04)
      ctx.fillStyle = 'rgba(245, 158, 11, 0.7)'
      ctx.fillRect(vx - 12, vy - 5, 24, 5)
      ctx.fillRect(vx - 3, vy - 10, 6, 5)
      ctx.font = 'bold 7px "Space Mono", monospace'
      ctx.fillStyle = 'rgba(245, 158, 11, 0.7)'
      ctx.fillText('VESSEL', vx - 14, vy - 13)

      // ── SEA STATE INDICATOR ──────────────────────────────
      const seaState = sensors?.wave_height < 0.5 ? 1 : sensors?.wave_height < 1.25 ? 2 :
                       sensors?.wave_height < 2.5 ? 3 : sensors?.wave_height < 4 ? 4 : 5
      ctx.font = 'bold 8px "Space Mono", monospace'
      ctx.fillStyle = 'rgba(34, 211, 238, 0.8)'
      ctx.fillText(`SS ${seaState}`, W - 36, H - 8)

      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animRef.current)
  }, [sensors])

  return (
    <canvas
      ref={canvasRef}
      width={380}
      height={200}
      className="w-full rounded"
      style={{ height: '200px' }}
    />
  )
}

export default function DigitalTwinPanel({ sensors, threatLevel }) {
  const seaState = (sensors?.wave_height ?? 0.8) < 0.5 ? 'CALM (SS1)' :
                   (sensors?.wave_height ?? 0.8) < 1.25 ? 'SLIGHT (SS2)' :
                   (sensors?.wave_height ?? 0.8) < 2.5 ? 'MODERATE (SS3)' : 'ROUGH (SS4)'

  return (
    <div className="tac-card flex flex-col h-full">
      <div className="section-header justify-between">
        <div className="flex items-center gap-2">
          <div className="dot" style={{ background: '#a78bfa', boxShadow: '0 0 6px rgba(167,139,250,0.6)' }} />
          <span>DIGITAL TWIN / SIMULATION</span>
        </div>
        <div className="pill pill-cyan text-[8px]">SIM ACTIVE</div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Twin canvas */}
        <TwinCanvas sensors={sensors} />

        {/* Environment state */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { l: 'SEA STATE', v: seaState, c: '#38bdf8' },
            { l: 'WIND', v: `${Math.round(sensors?.wind_speed ?? 11.4)} kts ${Math.round(sensors?.wind_dir ?? 285)}°`, c: '#94a3b8' },
            { l: 'CURRENT VECTOR', v: `${(sensors?.current_speed ?? 0.34).toFixed(2)} kts ${Math.round(sensors?.current_dir ?? 195)}°`, c: '#22d3ee' },
            { l: 'BUOY DRIFT', v: '0.18 nm/hr SW', c: '#f59e0b' },
          ].map(({ l, v, c }) => (
            <div key={l} className="bg-[#060d1a] border border-[#1a3354] rounded p-1.5">
              <div className="font-mono text-[7px] text-[#475569]">{l}</div>
              <div className="font-mono text-[9px] font-bold" style={{ color: c }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Mission scenario */}
        <div className="bg-[#060d1a] rounded border border-[#1a3354] p-2">
          <div className="font-mono text-[8px] font-bold tracking-widest text-[#475569] mb-1.5">MISSION SCENARIO</div>
          <div className="flex items-center justify-between mb-1">
            <div className="font-mono text-[9px] text-[#94a3b8]">OPERATION DEEP WATCH — Phase 2</div>
            <div className="pill pill-online text-[7px]">ACTIVE</div>
          </div>
          {[
            { label: 'Patrol Coverage', val: 82, color: '#10b981' },
            { label: 'Detection Probability', val: 71, color: '#22d3ee' },
            { label: 'Contact Clarity', val: 68, color: '#a78bfa' },
            { label: 'Mission Risk', val: Math.round(threatLevel * 0.6), color: '#f59e0b' },
          ].map(({ label, val, color }) => (
            <div key={label} className="flex items-center gap-2 mt-1">
              <div className="font-mono text-[8px] text-[#475569] w-32 flex-shrink-0">{label}</div>
              <div className="flex-1 h-1.5 bg-[#0a1628] rounded-full overflow-hidden">
                <div className="h-full rounded-full bar-fill" style={{ width: `${val}%`, background: color }} />
              </div>
              <div className="font-mono text-[8px] font-bold w-7 text-right flex-shrink-0" style={{ color }}>{val}%</div>
            </div>
          ))}
        </div>

        {/* Predicted drift */}
        <div className="bg-[#060d1a] rounded border border-[#1a3354] p-2">
          <div className="font-mono text-[8px] font-bold tracking-widest text-[#475569] mb-1">DRIFT FORECAST</div>
          <div className="font-mono text-[9px] text-[#94a3b8]">
            Predicted position in 6h: <span className="text-[#22d3ee]">36.618°N 121.921°W</span>
          </div>
          <div className="font-mono text-[8px] text-[#475569] mt-0.5">
            Delta: ~0.4 nm SW · Correction recommended T+5.8h
          </div>
        </div>

      </div>
    </div>
  )
}
