import { useMemo } from 'react'

/** WebSocket base for YOLO service (path /ws appended). Set VITE_YOLO_WS_URL=false to disable. */
export function useYoloWsUrl() {
  return useMemo(() => {
    const v = import.meta.env.VITE_YOLO_WS_URL
    if (v === 'false' || v === '0') return ''
    if (typeof v === 'string' && v.trim().length > 0) return v.trim()
    return 'ws://127.0.0.1:8765'
  }, [])
}
