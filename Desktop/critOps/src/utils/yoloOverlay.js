/** @param {string} label */
export function labelColor(label) {
  let h = 0
  const s = String(label || 'obj')
  for (let i = 0; i < s.length; i += 1) {
    h = (h * 31 + s.charCodeAt(i)) % 360
  }
  return `hsl(${h} 82% 52%)`
}

/**
 * Map normalized box (0–1) to pixels inside container for object-contain image.
 * @param {{x1:number,y1:number,x2:number,y2:number}} box
 * @param {HTMLImageElement} imgEl
 * @param {HTMLElement} containerEl
 */
export function mapBoxToOverlay(box, imgEl, containerEl) {
  if (!imgEl || !containerEl) return null
  const nw = imgEl.naturalWidth
  const nh = imgEl.naturalHeight
  if (!nw || !nh) return null
  const cw = containerEl.clientWidth
  const ch = containerEl.clientHeight
  const scale = Math.min(cw / nw, ch / nh)
  const dw = nw * scale
  const dh = nh * scale
  const ox = (cw - dw) / 2
  const oy = (ch - dh) / 2
  const left = ox + box.x1 * nw * scale
  const top = oy + box.y1 * nh * scale
  const width = (box.x2 - box.x1) * nw * scale
  const height = (box.y2 - box.y1) * nh * scale
  return { left, top, width, height }
}
