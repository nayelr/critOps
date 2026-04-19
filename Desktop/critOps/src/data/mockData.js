// ═══════════════════════════════════════════════════════════
// Simulated sensor data — replace with real WebSocket / API feeds
// ═══════════════════════════════════════════════════════════

/** When false, UI shows cleared / no submersible contact */
export const SUBMERSIBLE_DETECTED = false

// 241 18th St S, Arlington, VA 22202 (National Landing / Crystal City)
export const BUOY = {
  name: 'Acorn-01',
  lat: 38.8583542,
  lon: -77.0503172,
  missionId: 'ACORN-2026-0418',
}

export const THREAT_CONTACT = {
  id: '—',
  lat: BUOY.lat,
  lon: BUOY.lon,
  type: 'None',
  bearing: 0,
  rangeKm: 0,
  confidence: 0,
  freqHz: 0,
  doppler: 0,
  status: 'clear',
}

export const VESSELS = []

export const AI_ASSESSMENTS = [
  'Passive acoustic picture is quiet. No narrow-band tonals or machinery lines consistent with a subsurface contact. Environmental noise within expected limits for the operating area.',
  'Fused optical and hydrophone assessment: no classified undersea track. Broadband levels nominal; no Doppler-indicated approach vector.',
  'Tracker reports zero active threat hypotheses above threshold. Scene stability and spectral content match ambient-only conditions.',
  'Continued passive monitoring recommended. No change in threat posture; contact library shows no match to known signatures in-band.',
]

export const RECOMMENDED_ACTIONS = [
  'Maintain passive watch · Log environmental baseline',
  'Continue scheduled hydrophone calibration checks',
  'Hold current search pattern · No escalation',
  'Routine reporting · All sensors nominal',
]

export const INITIAL_EVENTS = [
  { id: 1, ts: '04:17:33Z', sev: 'info', text: 'All subsystems nominal — Acorn ops node' },
  { id: 2, ts: '04:16:12Z', sev: 'info', text: 'AI threat score at minimum — no contact classified' },
  { id: 3, ts: '04:11:02Z', sev: 'info', text: 'Hydrophone auto-gain within spec' },
  { id: 4, ts: '03:58:44Z', sev: 'info', text: 'GPS reference stable' },
  { id: 5, ts: '03:42:19Z', sev: 'info', text: 'USB camera stream OK' },
]

const noise = (base, pct) => base + base * (Math.random() - 0.5) * pct * 2

/** Indoor still freshwater — room-temp bath, tap salinity ~0 ppt, HVAC air, shallow column */
export function sensorValues() {
  return {
    waterTemp: parseFloat(noise(21.0, 0.025).toFixed(2)),
    // Fresh tap water: effectively 0 ppt (trace minerals only)
    salinity: Math.max(0, parseFloat(noise(0.02, 0.4).toFixed(3))),
    // Indoor barometric pressure (hPa), stable HVAC space
    pressure: parseFloat(noise(1013.2, 0.0015).toFixed(1)),
    // Room relative humidity (%)
    atmosphere: parseFloat(noise(48, 0.06).toFixed(1)),
    // Shallow still water column (m)
    depth: parseFloat(noise(0.38, 0.08).toFixed(2)),
    battery: parseFloat(noise(94, 0.01).toFixed(0)),
    lat: parseFloat(noise(BUOY.lat, 0.00002).toFixed(4)),
    lon: parseFloat(noise(BUOY.lon, 0.00002).toFixed(4)),
  }
}

/** Threat / anomaly score pinned to 0% for demo */
export function threatConfidence() {
  return 0
}

// ── Stubs for optional panels (CommsPanel, CybersecPanel, SensorGrid) ──
export const LINK_STATUS = {
  a: { name: 'Primary uplink', status: 'online', quality: 98, bandwidth: 'nominal' },
  b: { name: 'Secondary RF', status: 'online', quality: 91, bandwidth: 'nominal' },
}

export const NEIGHBOR_BUOYS = [
  { id: 'NB-REF-1', status: 'online', signal: -42, lastSeen: 'live' },
]

export const CYBER_EVENTS = [
  { ts: '04:10Z', level: 'info', msg: 'Endpoint authentication successful' },
  { ts: '04:02Z', level: 'info', msg: 'Local TLS session for dev UI' },
]

export const SENSOR_RANGES = {}
