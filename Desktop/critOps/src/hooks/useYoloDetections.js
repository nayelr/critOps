import { useState, useEffect } from 'react'

function toWsUrl(base) {
  const b = base.replace(/\/$/, '')
  if (b.endsWith('/ws')) return b
  return `${b}/ws`
}

/**
 * @param {string} wsBase e.g. ws://127.0.0.1:8765
 * @param {boolean} enabled
 */
export function useYoloDetections(wsBase, enabled) {
  const [boxes, setBoxes] = useState([])
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!enabled || !wsBase) {
      setBoxes([])
      setConnected(false)
      return undefined
    }

    const url = toWsUrl(wsBase)
    let ws
    try {
      ws = new WebSocket(url)
    } catch {
      setConnected(false)
      return undefined
    }

    ws.onopen = () => setConnected(true)
    ws.onclose = () => {
      setConnected(false)
      setBoxes([])
    }
    ws.onerror = () => setConnected(false)
    ws.onmessage = (e) => {
      try {
        const d = JSON.parse(e.data)
        setBoxes(Array.isArray(d.boxes) ? d.boxes : [])
      } catch {
        /* ignore */
      }
    }

    return () => {
      ws.close()
    }
  }, [enabled, wsBase])

  return { boxes, connected }
}
