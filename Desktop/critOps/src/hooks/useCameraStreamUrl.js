import { useMemo } from 'react'

/**
 * Resolves camera MJPEG/stream URL: optional ?camera= URL param (decoded), else VITE_CAMERA_STREAM_URL.
 */
export function useCameraStreamUrl() {
  return useMemo(() => {
    if (typeof window === 'undefined') return ''
    const q = new URLSearchParams(window.location.search).get('camera')
    if (q) {
      try {
        return decodeURIComponent(q)
      } catch {
        return q
      }
    }
    const env = import.meta.env.VITE_CAMERA_STREAM_URL
    return typeof env === 'string' && env.trim().length > 0 ? env.trim() : ''
  }, [])
}
