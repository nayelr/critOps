// ═══════════════════════════════════════════════════════════
// SENTINEL BUOY — Simulated Sensor Data
// Swap these generators for real WebSocket / API feeds later
// ═══════════════════════════════════════════════════════════

export const BUOY = {
  name: 'Sentinel-01',
  lat: 38.4821,
  lon: -76.3974,
  missionId: 'DW-2026-0418',
}

// The single active threat scenario
export const THREAT_CONTACT = {
  id: 'UWC-01',
  lat: 38.4912,
  lon: -76.4183,
  type: 'Probable Submersible',
  bearing: 312,
  rangeKm: 1.84,
  confidence: 0.72,
  freqHz: 42,
  doppler: -0.34,
  status: 'active',
}

// Surface vessels (AIS)
export const VESSELS = [
  { id: 'V1', name: 'COASTAL RUNNER', lat: 38.502, lon: -76.378, heading: 200, speed: 8.2, ais: true },
  { id: 'V2', name: 'UNK-2847',       lat: 38.465, lon: -76.421, heading: 340, speed: 12.1, ais: false },
]

// AI assessment text scenarios
export const AI_ASSESSMENTS = [
  'Unidentified subsurface acoustic signature detected bearing 312°. Movement pattern and tonal frequency (42 Hz) are consistent with a slow-moving diesel-electric submersible.',
  'Contact UWC-01 maintains stable bearing. Narrow-band tonal at 42 Hz with negative Doppler shift indicates an approaching subsurface platform.',
  'Acoustic profile does not match any commercial or biological source in the reference library. Classification: probable submersible. Confidence trending upward.',
  'Persistent contact at bearing 312°. Estimated range decreasing at 0.3 km/hr. Recommend alerting shore station and maintaining active hydrophone tracking.',
]

export const RECOMMENDED_ACTIONS = [
  'Track Target · Alert Shore Station',
  'Maintain Acoustic Track · Log Contact',
  'Continue Passive Monitoring · Request Relay',
  'Escalate to Shore Command · Track Target',
]

// Event log (newest first)
export const INITIAL_EVENTS = [
  { id: 1, ts: '04:17:33Z', sev: 'threat',  text: 'Hydrophone contact UWC-01 — Probable Submersible detected' },
  { id: 2, ts: '04:17:35Z', sev: 'ai',      text: 'AI classified acoustic anomaly — confidence 72%' },
  { id: 3, ts: '04:11:02Z', sev: 'info',    text: 'Signal strength increased — hydrophone gain adjusted' },
  { id: 4, ts: '03:58:44Z', sev: 'info',    text: 'GPS position sync confirmed — accuracy ±1.8 m' },
  { id: 5, ts: '03:42:19Z', sev: 'warning', text: 'AIS-dark vessel UNK-2847 detected on radar, NW sector' },
]

// Sensor value generators (realistic ranges + small noise)
const noise = (base, pct) => base + base * (Math.random() - 0.5) * pct * 2

export function sensorValues() {
  return {
    waterTemp:    parseFloat(noise(14.2, 0.03).toFixed(1)),
    waveHeight:   parseFloat(noise(0.82, 0.12).toFixed(2)),
    windSpeed:    parseFloat(noise(11.4, 0.15).toFixed(1)),
    currentDir:   Math.round(noise(195, 0.04)),
    depth:        parseFloat(noise(87.4, 0.02).toFixed(1)),
    battery:      parseFloat(noise(78.2, 0.005).toFixed(0)),
    lat:          parseFloat(noise(BUOY.lat, 0.00015).toFixed(4)),
    lon:          parseFloat(noise(BUOY.lon, 0.00015).toFixed(4)),
  }
}

export function threatConfidence(base) {
  return Math.min(0.96, Math.max(0.55, base + (Math.random() - 0.45) * 0.03))
}
