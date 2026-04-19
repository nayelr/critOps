import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react'
import { useYoloDetections } from '../hooks/useYoloDetections'
import { mapBoxToOverlay, labelColor } from '../utils/yoloOverlay'

const FEED_HEIGHT = 380

// Fake "object detection" boxes drawn on canvas (fallback when no stream URL)
function CameraCanvas() {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const frameRef = useRef(0)
  const detectionsRef = useRef([
    { x: 0.12, y: 0.35, w: 0.76, h: 0.38, label: 'SURFACE', conf: 0.42, color: '#64748b' },
    { x: 0.38, y: 0.48, w: 0.22, h: 0.12, label: 'RIPPLE', conf: 0.31, color: '#22d3ee' },
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

      ctx.fillStyle = '#0a1a20'
      ctx.fillRect(0, 0, W, H)

      const horizonY = H * 0.42 + 8 * Math.sin(f * 0.02)
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.15)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, horizonY)
      ctx.lineTo(W, horizonY)
      ctx.stroke()

      const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY)
      skyGrad.addColorStop(0, 'rgba(4, 9, 26, 0.9)')
      skyGrad.addColorStop(1, 'rgba(10, 30, 50, 0.6)')
      ctx.fillStyle = skyGrad
      ctx.fillRect(0, 0, W, horizonY)

      const seaGrad = ctx.createLinearGradient(0, horizonY, 0, H)
      seaGrad.addColorStop(0, 'rgba(2, 20, 40, 0.95)')
      seaGrad.addColorStop(1, 'rgba(1, 10, 25, 0.98)')
      ctx.fillStyle = seaGrad
      ctx.fillRect(0, horizonY, W, H - horizonY)

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

      const vx = (0.55 + 0.04 * Math.sin(f * 0.005)) * W
      const vy = horizonY - 12
      ctx.fillStyle = 'rgba(20, 40, 60, 0.95)'
      ctx.fillRect(vx - 18, vy - 4, 36, 8)
      ctx.fillRect(vx - 4, vy - 14, 8, 10)
      ctx.fillRect(vx + 8, vy - 9, 4, 5)

      for (let y = 0; y < H; y += 4) {
        ctx.fillStyle = `rgba(0, 0, 0, ${0.06 + 0.04 * Math.sin(f * 0.1 + y * 0.01)})`
        ctx.fillRect(0, y, W, 2)
      }

      detectionsRef.current.forEach(d => {
        const alpha = 0.6 + 0.4 * Math.sin(f * 0.08)
        ctx.strokeStyle = d.color
        ctx.lineWidth = 1.5
        ctx.globalAlpha = alpha
        ctx.strokeRect(d.x * W, d.y * H, d.w * W, d.h * H)

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

        ctx.globalAlpha = 0.9
        ctx.fillStyle = d.color
        ctx.font = 'bold 9px "Space Mono", monospace'
        ctx.fillText(`${d.label} ${Math.round(d.conf * 100)}%`, d.x * W, d.y * H - 4)
      })

      ctx.globalAlpha = 1

      ctx.strokeStyle = 'rgba(0, 245, 255, 0.15)'
      ctx.lineWidth = 0.5
      ctx.setLineDash([4, 4])
      ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke()
      ctx.setLineDash([])

      ctx.fillStyle = 'rgba(0, 245, 255, 0.6)'
      ctx.font = 'bold 8px "Space Mono", monospace'
      ctx.fillText('ACORN-01 · SIMULATED', 6, 14)
      ctx.fillText(`FRAME ${String(f).padStart(6, '0')}`, 6, H - 6)
      ctx.fillText('demo feed · no threat', W - 118, H - 6)

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
      width={640}
      height={380}
      className="w-full rounded"
      style={{ height: `${FEED_HEIGHT}px`, display: 'block' }}
    />
  )
}

function LiveMjpegFeed({ streamUrl, boxes = [] }) {
  const [feedKey, setFeedKey] = useState(0)
  const [status, setStatus] = useState('loading')
  const [layoutTick, setLayoutTick] = useState(0)
  const containerRef = useRef(null)
  const imgRef = useRef(null)

  useEffect(() => {
    setStatus('loading')
    setFeedKey(0)
  }, [streamUrl])

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return undefined
    const ro = new ResizeObserver(() => setLayoutTick(t => t + 1))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const onLoad = useCallback(() => {
    setStatus('ok')
    setLayoutTick(t => t + 1)
  }, [])

  const onError = useCallback(() => {
    setStatus('error')
  }, [])

  const retry = useCallback(() => {
    setStatus('loading')
    setFeedKey(k => k + 1)
  }, [])

  void layoutTick
  void boxes
  const img = imgRef.current
  const container = containerRef.current
  const overlayRects = []
  if (status === 'ok' && img && container && boxes.length) {
    for (let i = 0; i < boxes.length; i += 1) {
      const b = boxes[i]
      const r = mapBoxToOverlay(b, img, container)
      if (r && r.width > 2 && r.height > 2) {
        overlayRects.push({ ...r, label: b.label, conf: b.conf, key: `${b.label}-${i}` })
      }
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded overflow-hidden bg-[#040912]"
      style={{ minHeight: FEED_HEIGHT }}
    >
      <img
        ref={imgRef}
        key={feedKey}
        src={streamUrl}
        alt="USB camera"
        className="w-full object-contain block bg-black/40"
        style={{ height: FEED_HEIGHT }}
        draggable={false}
        onLoad={onLoad}
        onError={onError}
      />
      {status === 'ok' && overlayRects.length > 0 && (
        <div className="absolute inset-0 pointer-events-none z-20" aria-hidden>
          {overlayRects.map((r) => (
            <div key={r.key}>
              <div
                className="absolute font-mono text-[10px] font-bold px-1.5 py-0.5 rounded leading-none shadow-md"
                style={{
                  left: r.left,
                  top: Math.max(0, r.top - 18),
                  background: 'rgba(4,9,18,0.92)',
                  color: labelColor(r.label),
                  border: `1px solid ${labelColor(r.label)}`,
                }}
              >
                {r.label} {Math.round((r.conf || 0) * 100)}%
              </div>
              <div
                className="absolute rounded-sm"
                style={{
                  left: r.left,
                  top: r.top,
                  width: r.width,
                  height: r.height,
                  border: `3px solid ${labelColor(r.label)}`,
                  boxShadow: `0 0 12px ${labelColor(r.label)}66`,
                }}
              />
            </div>
          ))}
        </div>
      )}
      {status === 'error' && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-3 text-center z-10"
          style={{ background: 'rgba(4,9,18,0.92)' }}
        >
          <div className="font-mono text-[10px] text-[#94a3b8]">
            Could not load stream. Check the Pi URL and MJPEG endpoint.
          </div>
          <button
            type="button"
            onClick={retry}
            className="font-mono text-[10px] px-3 py-1 rounded border border-[#1a3050] text-[#22d3ee] hover:bg-[#0c1d30]"
          >
            Retry
          </button>
        </div>
      )}
      {status === 'loading' && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
          style={{ background: 'rgba(4,9,18,0.5)' }}
        >
          <span className="font-mono text-[9px] text-[#475569]">Connecting…</span>
        </div>
      )}
    </div>
  )
}

export default function CameraPanel({ streamUrl = '', yoloWsUrl = '' }) {
  const live = Boolean(streamUrl && streamUrl.trim())
  const yoloOn = live && Boolean(yoloWsUrl)
  const { boxes, connected } = useYoloDetections(yoloWsUrl, yoloOn)
  const [motionCount, setMotionCount] = useState(0)
  const [snapshots] = useState([
    { id: 1, ts: '04:15:22Z', label: 'Ambient reflection — benign' },
    { id: 2, ts: '03:52:07Z', label: 'Micro-motion from structure' },
    { id: 3, ts: '03:31:44Z', label: 'No submersible contact' },
  ])

  useEffect(() => {
    const id = setInterval(() => {
      setMotionCount(prev => Math.min(2, Math.max(0, prev + Math.floor((Math.random() - 0.5) * 2))))
    }, 8000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="panel flex flex-col h-full min-h-0">
      <div className="panel-header justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className={live ? 'dot-online' : 'dot-warning'} />
          <span className="panel-label">Camera</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {motionCount > 0 && (
            <div
              className="px-2 py-0.5 rounded font-mono text-[8px] font-bold border flex items-center gap-1"
              style={{ color: '#f59e0b', borderColor: '#f59e0b44', background: 'rgba(245,158,11,0.08)' }}
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#f59e0b]" style={{ boxShadow: '0 0 6px rgba(245,158,11,0.6)' }} />
              {motionCount} MOTION
            </div>
          )}
          {yoloOn && (
            <div
              className="px-2 py-0.5 rounded font-mono text-[8px] font-bold border"
              style={
                connected
                  ? { color: '#a855f7', borderColor: '#a855f744', background: 'rgba(168,85,247,0.1)' }
                  : { color: '#64748b', borderColor: '#1a3050', background: '#0c1d30' }
              }
            >
              {connected ? `YOLO · ${boxes.length}` : 'YOLO …'}
            </div>
          )}
          <div
            className="px-2 py-0.5 rounded font-mono text-[8px] font-bold border"
            style={
              live
                ? { color: '#22c55e', borderColor: '#22c55e44', background: 'rgba(34,197,94,0.08)' }
                : { color: '#94a3b8', borderColor: '#1a3050', background: '#0c1d30' }
            }
          >
            {live ? 'ACORN LIVE' : 'SIMULATED'}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-2 px-3 py-2 overflow-y-auto min-h-0">
        <div className="relative flex-shrink-0">
          {live ? (
            <LiveMjpegFeed
              streamUrl={streamUrl.trim()}
              boxes={boxes}
            />
          ) : (
            <CameraCanvas />
          )}
          <div className="absolute top-2 right-2 flex flex-col gap-1 z-10 pointer-events-none">
            <div
              className="px-2 py-0.5 rounded font-mono text-[7px] font-bold border"
              style={{ color: '#22c55e', borderColor: '#22c55e44', background: 'rgba(4,9,18,0.85)' }}
            >
              {live ? 'LIVE' : 'DEMO'}
            </div>
            {live && (
              <div
                className="px-2 py-0.5 rounded font-mono text-[7px] font-bold border"
                style={{ color: '#22d3ee', borderColor: '#22d3ee44', background: 'rgba(4,9,18,0.85)' }}
              >
                MJPEG
              </div>
            )}
            {live && yoloOn && connected && (
              <div
                className="px-2 py-0.5 rounded font-mono text-[7px] font-bold border"
                style={{ color: '#a855f7', borderColor: '#a855f744', background: 'rgba(4,9,18,0.85)' }}
              >
                YOLOv8
              </div>
            )}
          </div>
        </div>

        <div className="flex-shrink-0">
          <div className="font-mono text-[8px] font-bold tracking-widest text-[#475569] mb-1">SNAPSHOT LOG</div>
          <div className="space-y-0.5">
            {snapshots.map(s => (
              <div key={s.id} className="flex items-center gap-2 py-0.5">
                <div className="font-mono text-[7px] text-[#475569] w-14 flex-shrink-0">{s.ts}</div>
                <div className="w-1 h-1 rounded-full bg-[#22d3ee] flex-shrink-0" />
                <div className="font-mono text-[8px] text-[#94a3b8] truncate">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
