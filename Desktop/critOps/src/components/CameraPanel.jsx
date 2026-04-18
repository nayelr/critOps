import React, { useState, useEffect, useRef } from 'react'

// Fake "object detection" boxes drawn on canvas
function CameraCanvas({ motionCount }) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const frameRef = useRef(0)
  const detectionsRef = useRef([
    { x: 0.55, y: 0.3, w: 0.12, h: 0.18, label: 'VESSEL', conf: 0.91, color: '#f59e0b' },
    { x: 0.2,  y: 0.5, w: 0.08, h: 0.08, label: 'WAKE',   conf: 0.77, color: '#22d3ee' },
  ])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width
    const H = canvas.height

    const draw = () => {
      frameRef.current++
      const f = frameRef.current

      // Simulated camera noise / sea background
      ctx.fillStyle = '#0a1a20'
      ctx.fillRect(0, 0, W, H)

      // Horizon line
      const horizonY = H * 0.42 + 8 * Math.sin(f * 0.02)
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.15)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, horizonY)
      ctx.lineTo(W, horizonY)
      ctx.stroke()

      // Sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY)
      skyGrad.addColorStop(0, 'rgba(4, 9, 26, 0.9)')
      skyGrad.addColorStop(1, 'rgba(10, 30, 50, 0.6)')
      ctx.fillStyle = skyGrad
      ctx.fillRect(0, 0, W, horizonY)

      // Sea / water texture
      const seaGrad = ctx.createLinearGradient(0, horizonY, 0, H)
      seaGrad.addColorStop(0, 'rgba(2, 20, 40, 0.95)')
      seaGrad.addColorStop(1, 'rgba(1, 10, 25, 0.98)')
      ctx.fillStyle = seaGrad
      ctx.fillRect(0, horizonY, W, H - horizonY)

      // Wave highlights
      for (let i = 0; i < 8; i++) {
        const wy = horizonY + (i + 1) * (H - horizonY) / 9
        const amp = 2 + i * 0.5
        ctx.strokeStyle = `rgba(34, 211, 238, ${0.04 + i * 0.01})`
        ctx.lineWidth = 0.5
        ctx.beginPath()
        for (let x = 0; x < W; x += 3) {
          const y = wy + amp * Math.sin(x * 0.04 + f * 0.05 + i)
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
        }
        ctx.stroke()
      }

      // Vessel silhouette (distant)
      const vx = (0.55 + 0.04 * Math.sin(f * 0.005)) * W
      const vy = horizonY - 12
      ctx.fillStyle = 'rgba(20, 40, 60, 0.95)'
      ctx.fillRect(vx - 18, vy - 4, 36, 8)
      ctx.fillRect(vx - 4, vy - 14, 8, 10)
      ctx.fillRect(vx + 8, vy - 9, 4, 5)

      // Scanline overlay
      for (let y = 0; y < H; y += 4) {
        ctx.fillStyle = `rgba(0, 0, 0, ${0.06 + 0.04 * Math.sin(f * 0.1 + y * 0.01)})`
        ctx.fillRect(0, y, W, 2)
      }

      // Detection boxes
      detectionsRef.current.forEach(d => {
        const alpha = 0.6 + 0.4 * Math.sin(f * 0.08)
        ctx.strokeStyle = d.color
        ctx.lineWidth = 1.5
        ctx.globalAlpha = alpha
        ctx.strokeRect(d.x * W, d.y * H, d.w * W, d.h * H)

        // Corner markers
        const cLen = 6
        ctx.lineWidth = 2
        ;[
          [d.x * W, d.y * H],
          [(d.x + d.w) * W, d.y * H],
          [d.x * W, (d.y + d.h) * H],
          [(d.x + d.w) * W, (d.y + d.h) * H],
        ].forEach(([cx, cy], qi) => {
          ctx.beginPath()
          if (qi === 0 || qi === 2) { ctx.moveTo(cx, cy); ctx.lineTo(cx + cLen, cy); ctx.moveTo(cx, cy); ctx.lineTo(cx, cy + cLen) }
          else if (qi === 1 || qi === 3) { ctx.moveTo(cx, cy); ctx.lineTo(cx - cLen, cy); ctx.moveTo(cx, cy); ctx.lineTo(cx, cy + cLen) }
          ctx.stroke()
        })

        // Label
        ctx.globalAlpha = 0.9
        ctx.fillStyle = d.color
        ctx.font = 'bold 9px "Space Mono", monospace'
        ctx.fillText(`${d.label} ${Math.round(d.conf * 100)}%`, d.x * W, d.y * H - 4)
      })

      ctx.globalAlpha = 1

      // Crosshair
      ctx.strokeStyle = 'rgba(0, 245, 255, 0.15)'
      ctx.lineWidth = 0.5
      ctx.setLineDash([4, 4])
      ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke()
      ctx.setLineDash([])

      // Corner UI overlay
      ctx.fillStyle = 'rgba(0, 245, 255, 0.6)'
      ctx.font = 'bold 8px "Space Mono", monospace'
      ctx.fillText('CAM-01 · VISIBLE', 6, 14)
      ctx.fillText(`FRAME ${String(f).padStart(6,'0')}`, 6, H - 6)
      ctx.fillText('1920×1080 · 30fps', W - 90, H - 6)

      // Night/low-light badge
      if (f % 120 < 10) {
        ctx.fillStyle = 'rgba(0,245,255,0.1)'
        ctx.fillRect(W - 80, 6, 74, 16)
        ctx.fillStyle = 'rgba(0,245,255,0.8)'
        ctx.fillText('LOW-LIGHT', W - 76, 18)
      }

      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={480}
      height={220}
      className="w-full rounded"
      style={{ height: '220px' }}
    />
  )
}

export default function CameraPanel() {
  const [motionCount, setMotionCount] = useState(2)
  const [snapshots, setSnapshots] = useState([
    { id: 1, ts: '04:15:22Z', label: 'Vessel detected NE sector' },
    { id: 2, ts: '03:52:07Z', label: 'Wave height event' },
    { id: 3, ts: '03:31:44Z', label: 'Wake pattern anomaly' },
  ])

  useEffect(() => {
    const id = setInterval(() => {
      setMotionCount(prev => Math.max(0, prev + Math.floor((Math.random() - 0.5) * 3)))
    }, 8000)
    return () => clearInterval(id)
  }, [])

  const visualContacts = [
    { id: 'VC-01', type: 'SURFACE VESSEL', bearing: '045°', range: '~1.8 nm', conf: 91 },
    { id: 'VC-02', type: 'WAKE / DISTURBANCE', bearing: '020°', range: '~0.4 nm', conf: 77 },
  ]

  return (
    <div className="tac-card flex flex-col h-full">
      <div className="section-header justify-between">
        <div className="flex items-center gap-2">
          <div className="dot" />
          <span>CAMERA / VISUAL OBSERVATION</span>
        </div>
        <div className="flex items-center gap-2">
          {motionCount > 0 && (
            <div className="pill pill-warning text-[8px]">
              <span className="blink-dot w-1.5 h-1.5 rounded-full bg-[#f59e0b] inline-block" />
              {motionCount} MOTION
            </div>
          )}
          <div className="pill pill-online text-[8px]">CAM-01 ONLINE</div>
        </div>
      </div>

      <div className="p-3 flex flex-col gap-3 flex-1 overflow-y-auto">
        {/* Live feed */}
        <div className="relative">
          <CameraCanvas motionCount={motionCount} />
          {/* Overlay badges */}
          <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
            <div className="pill pill-online text-[7px]">LIVE</div>
            <div className="pill pill-cyan text-[7px]">GYRO-STAB</div>
          </div>
        </div>

        {/* Camera controls row */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'MODE', val: 'VISIBLE' },
            { label: 'ZOOM', val: '2.0×' },
            { label: 'HORIZON', val: '+2.1°' },
            { label: 'EXPOSURE', val: 'AUTO' },
          ].map(({ label, val }) => (
            <div key={label} className="bg-[#060d1a] border border-[#1a3354] rounded p-1.5 text-center">
              <div className="font-mono text-[7px] text-[#475569]">{label}</div>
              <div className="font-mono text-[9px] font-bold text-[#22d3ee]">{val}</div>
            </div>
          ))}
        </div>

        {/* Visual contacts */}
        <div>
          <div className="font-mono text-[8px] font-bold tracking-widest text-[#475569] mb-1.5">VISUAL CONTACTS</div>
          <div className="space-y-1">
            {visualContacts.map(c => (
              <div key={c.id} className="flex items-center gap-2 bg-[#060d1a] border border-[#1a3354] rounded px-2 py-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
                <div className="font-mono text-[9px] font-bold text-[#f59e0b]">{c.id}</div>
                <div className="font-mono text-[9px] text-[#94a3b8] flex-1">{c.type}</div>
                <div className="font-mono text-[8px] text-[#475569]">BRG {c.bearing}</div>
                <div className="font-mono text-[8px] text-[#475569]">{c.range}</div>
                <div className="font-mono text-[9px] font-bold text-[#10b981]">{c.conf}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Snapshot log */}
        <div>
          <div className="font-mono text-[8px] font-bold tracking-widest text-[#475569] mb-1.5">SNAPSHOT LOG</div>
          <div className="space-y-0.5">
            {snapshots.map(s => (
              <div key={s.id} className="flex items-center gap-2 py-0.5">
                <div className="font-mono text-[8px] text-[#475569] w-18 flex-shrink-0">{s.ts}</div>
                <div className="w-1 h-1 rounded-full bg-[#22d3ee] flex-shrink-0" />
                <div className="font-mono text-[9px] text-[#94a3b8]">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
