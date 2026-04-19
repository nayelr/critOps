import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react'
import { useYoloDetections } from '../hooks/useYoloDetections'
import { mapBoxToOverlay, labelColor } from '../utils/yoloOverlay'

const FEED_HEIGHT = 380

function LiveMjpegFeed({ streamUrl, boxes = [] }) {
  const trimmed = typeof streamUrl === 'string' ? streamUrl.trim() : ''
  const hasUrl = Boolean(trimmed)
  const [feedKey, setFeedKey] = useState(0)
  const [status, setStatus] = useState(() => (hasUrl ? 'loading' : 'error'))
  const [layoutTick, setLayoutTick] = useState(0)
  const containerRef = useRef(null)
  const imgRef = useRef(null)

  useEffect(() => {
    if (!hasUrl) {
      setStatus('error')
      return
    }
    setStatus('loading')
    setFeedKey(0)
  }, [streamUrl, hasUrl])

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
    if (!trimmed) {
      window.location.reload()
      return
    }
    setStatus('loading')
    setFeedKey(k => k + 1)
  }, [trimmed])

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
      {hasUrl ? (
        <img
          ref={imgRef}
          key={feedKey}
          src={trimmed}
          alt="USB camera"
          className="w-full object-contain block bg-black/40"
          style={{ height: FEED_HEIGHT }}
          draggable={false}
          onLoad={onLoad}
          onError={onError}
        />
      ) : (
        <div className="w-full block bg-black/40" style={{ height: FEED_HEIGHT }} aria-hidden />
      )}
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
      {hasUrl && status === 'loading' && (
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
          <div className={live ? 'dot-online' : 'dot-offline'} />
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
            {live ? 'ACORN LIVE' : 'NO SIGNAL'}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-2 px-3 py-2 overflow-y-auto min-h-0">
        <div className="relative flex-shrink-0">
          <LiveMjpegFeed streamUrl={streamUrl.trim()} boxes={boxes} />
          <div className="absolute top-2 right-2 flex flex-col gap-1 z-10 pointer-events-none">
            <div
              className="px-2 py-0.5 rounded font-mono text-[7px] font-bold border"
              style={
                live
                  ? { color: '#22c55e', borderColor: '#22c55e44', background: 'rgba(4,9,18,0.85)' }
                  : { color: '#64748b', borderColor: '#1a3050', background: 'rgba(4,9,18,0.85)' }
              }
            >
              {live ? 'LIVE' : 'NO SIGNAL'}
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
