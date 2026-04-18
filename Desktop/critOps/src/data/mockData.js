// ═══════════════════════════════════════════════════════════════════
// TRITON WATCH — Mock / Simulated Sensor Data
// Replace exports here with real API / WebSocket feeds when ready
// ═══════════════════════════════════════════════════════════════════

// ── Buoy Identity & Mission ─────────────────────────────────────
export const BUOY_CONFIG = {
  id: 'SENTINEL-7',
  callsign: 'TRITON-BRAVO',
  missionName: 'OPERATION DEEP WATCH',
  missionId: 'DW-2026-0418',
  deployedAt: '2026-04-12T08:22:00Z',
  operatorUnit: 'USCG Pacific Fleet — Maritime Surveillance Detachment',
  classification: 'UNCLASSIFIED // FOR OFFICIAL USE ONLY',
  firmwareVersion: '4.2.1-stable',
  edgeModelVersion: 'AQUILA-EDGE v3.1.4',
  bootId: 'b7a2f91c',
}

// ── Base GPS Location (Monterey Bay, CA) ───────────────────────
export const BASE_LAT = 36.621
export const BASE_LON = -121.917

// ── Drift breadcrumbs (last 24 positions, oldest first) ──────
export const DRIFT_TRAIL = [
  [36.618, -121.912],
  [36.619, -121.913],
  [36.619, -121.914],
  [36.620, -121.915],
  [36.620, -121.916],
  [36.621, -121.917],
]

// ── Restricted zone polygon ───────────────────────────────────
export const RESTRICTED_ZONES = [
  {
    id: 'RZ-1',
    name: 'RESTRICTED — NAVAL OPERATION AREA',
    color: '#ff3b3b',
    coords: [
      [36.65, -121.95],
      [36.65, -121.87],
      [36.58, -121.87],
      [36.58, -121.95],
    ],
  },
]

// ── Simulated vessel tracks ───────────────────────────────────
export const INITIAL_VESSELS = [
  { id: 'V001', name: 'COASTAL RUNNER', lat: 36.64, lon: -121.88, heading: 220, speed: 8.2, type: 'cargo', ais: true },
  { id: 'V002', name: 'NEPTUNE TIDE',   lat: 36.59, lon: -121.93, heading: 45,  speed: 5.7, type: 'fishing', ais: true },
  { id: 'V003', name: 'UNK-2847',       lat: 36.63, lon: -121.96, heading: 160, speed: 12.1, type: 'unknown', ais: false },
  { id: 'V004', name: 'HARBOR WATCH',   lat: 36.57, lon: -121.89, heading: 90,  speed: 3.4, type: 'patrol', ais: true },
]

// ── Simulated underwater contacts ───────────────────────────
export const INITIAL_CONTACTS = [
  { id: 'UWC-01', lat: 36.628, lon: -121.929, classification: 'probable_submersible', confidence: 0.72, bearing: 312, range_m: 1840 },
  { id: 'UWC-02', lat: 36.609, lon: -121.905, classification: 'biologic', confidence: 0.91, bearing: 148, range_m: 3200 },
]

// ── Sensor value generators ─────────────────────────────────
const clamp = (v, min, max) => Math.min(max, Math.max(min, v))
const noise = (v, pct = 0.02) => v + v * (Math.random() - 0.5) * pct * 2

export const SENSOR_RANGES = {
  gps_lat:         { base: 36.621,  noise: 0.0002,  unit: '°N',   label: 'LAT' },
  gps_lon:         { base: -121.917, noise: 0.0002, unit: '°W',   label: 'LON' },
  gps_accuracy:    { base: 1.8,     noise: 0.5,     unit: 'm CEP', label: 'GPS ACC' },
  heading:         { base: 217,     noise: 3,       unit: '°',    label: 'HEADING' },
  pitch:           { base: 2.1,     noise: 1.5,     unit: '°',    label: 'PITCH' },
  roll:            { base: -1.4,    noise: 1.2,     unit: '°',    label: 'ROLL' },
  yaw_rate:        { base: 0.3,     noise: 0.2,     unit: '°/s',  label: 'YAW RATE' },
  water_temp:      { base: 14.2,    noise: 0.3,     unit: '°C',   label: 'WATER TEMP' },
  air_temp:        { base: 16.8,    noise: 0.5,     unit: '°C',   label: 'AIR TEMP' },
  salinity:        { base: 33.7,    noise: 0.2,     unit: 'PSU',  label: 'SALINITY' },
  ph:              { base: 8.12,    noise: 0.05,    unit: 'pH',   label: 'pH' },
  turbidity:       { base: 4.3,     noise: 0.8,     unit: 'NTU',  label: 'TURBIDITY' },
  dissolved_o2:    { base: 7.8,     noise: 0.3,     unit: 'mg/L', label: 'DISS O₂' },
  baro_pressure:   { base: 1013.2,  noise: 1.2,     unit: 'hPa',  label: 'BARO PRESS' },
  humidity:        { base: 78,      noise: 3,       unit: '%',    label: 'HUMIDITY' },
  wind_speed:      { base: 11.4,    noise: 2.5,     unit: 'kts',  label: 'WIND SPD' },
  wind_dir:        { base: 285,     noise: 10,      unit: '°',    label: 'WIND DIR' },
  wave_height:     { base: 0.8,     noise: 0.15,    unit: 'm',    label: 'WAVE HT' },
  current_speed:   { base: 0.34,    noise: 0.06,    unit: 'kts',  label: 'CURR SPD' },
  current_dir:     { base: 195,     noise: 8,       unit: '°',    label: 'CURR DIR' },
  depth_sonar:     { base: 87.4,    noise: 1.5,     unit: 'm',    label: 'SONAR DEPTH' },
  hull_tilt:       { base: 2.8,     noise: 0.5,     unit: '°',    label: 'HULL TILT' },
  battery_v:       { base: 24.7,    noise: 0.2,     unit: 'V',    label: 'BATT VOLT' },
  battery_pct:     { base: 78,      noise: 0.3,     unit: '%',    label: 'BATT SOC' },
  current_draw:    { base: 3.4,     noise: 0.3,     unit: 'A',    label: 'CURR DRAW' },
  solar_output:    { base: 12.8,    noise: 2.5,     unit: 'W',    label: 'SOLAR OUT' },
  solar_v:         { base: 17.2,    noise: 0.5,     unit: 'V',    label: 'SOLAR V' },
  cpu_temp:        { base: 52,      noise: 3,       unit: '°C',   label: 'CPU TEMP' },
  enclosure_pres:  { base: 1.02,    noise: 0.01,    unit: 'bar',  label: 'ENCL PRESS' },
  comms_latency:   { base: 148,     noise: 35,      unit: 'ms',   label: 'COMMS LAT' },
  packet_loss:     { base: 0.8,     noise: 0.5,     unit: '%',    label: 'PKT LOSS' },
  cpu_usage:       { base: 34,      noise: 8,       unit: '%',    label: 'CPU USAGE' },
  mem_usage:       { base: 61,      noise: 4,       unit: '%',    label: 'MEM USAGE' },
  storage_used:    { base: 42,      noise: 0.1,     unit: '%',    label: 'STORAGE' },
}

export function generateSensorValue(key) {
  const cfg = SENSOR_RANGES[key]
  if (!cfg) return 0
  return parseFloat(noise(cfg.base, cfg.noise / cfg.base).toFixed(
    cfg.unit.includes('°') && cfg.base > 10 ? 1 :
    cfg.unit === 'pH' ? 2 :
    cfg.base < 5 ? 2 : 1
  ))
}

// ── Historical sparkline data (60 points) ───────────────────
export function generateHistory(key, len = 60) {
  const cfg = SENSOR_RANGES[key]
  if (!cfg) return Array(len).fill(0)
  let v = cfg.base
  return Array.from({ length: len }, () => {
    v = clamp(
      v + (Math.random() - 0.5) * cfg.noise * 4,
      cfg.base * 0.85,
      cfg.base * 1.15
    )
    return parseFloat(v.toFixed(2))
  })
}

// ── Hydrophone / Acoustic contact data ──────────────────────
export const ACOUSTIC_CLASSIFICATIONS = [
  'unknown_contact',
  'biologic',
  'commercial_vessel',
  'probable_submersible',
  'interference',
  'false_positive',
]

export const CLASSIFICATION_LABELS = {
  unknown_contact:     { label: 'UNK CONTACT',       color: '#f59e0b', severity: 'medium' },
  biologic:            { label: 'BIOLOGIC',           color: '#22d3ee', severity: 'low' },
  commercial_vessel:   { label: 'COMM VESSEL',        color: '#10b981', severity: 'low' },
  probable_submersible:{ label: 'PROB SUBMERSIBLE',   color: '#ff3b3b', severity: 'critical' },
  interference:        { label: 'INTERFERENCE',       color: '#6b7280', severity: 'info' },
  false_positive:      { label: 'FALSE POSITIVE',     color: '#475569', severity: 'info' },
}

export const INITIAL_ACOUSTIC_LOG = [
  { id: 'AC-0012', ts: '04:17:33Z', classification: 'probable_submersible', confidence: 0.72, bearing: 312, range_m: 1840, doppler: -0.34, freq_peak: 42, note: 'Narrow-band tonal at 42 Hz, persistent Doppler shift' },
  { id: 'AC-0011', ts: '03:52:14Z', classification: 'commercial_vessel',   confidence: 0.96, bearing: 185, range_m: 6200, doppler: 0.12, freq_peak: 180, note: 'Broadband noise, consistent with large diesel propulsion' },
  { id: 'AC-0010', ts: '03:41:07Z', classification: 'biologic',            confidence: 0.89, bearing: 220, range_m: 2100, doppler: 0.00, freq_peak: 380, note: 'Cetacean vocalizations — likely Pacific humpback' },
  { id: 'AC-0009', ts: '03:29:55Z', classification: 'unknown_contact',     confidence: 0.51, bearing: 295, range_m: 3800, doppler: -0.18, freq_peak: 68, note: 'Intermittent low-frequency source, classification pending' },
  { id: 'AC-0008', ts: '02:58:40Z', classification: 'false_positive',      confidence: 0.88, bearing: 0,   range_m: 0,    doppler: 0.00, freq_peak: 0, note: 'Sea state noise — reclassified after multi-frame analysis' },
  { id: 'AC-0007', ts: '02:34:12Z', classification: 'probable_submersible',confidence: 0.61, bearing: 308, range_m: 2400, doppler: -0.29, freq_peak: 38, note: 'Previously tracked contact, bearing consistent with UWC-01' },
]

// ── AI / Threat scoring ──────────────────────────────────────
export const AI_SCENARIOS = [
  'Monitoring nominal maritime traffic corridor. Elevated attention on UWC-01 acoustic contact bearing 312°. No immediate threat posture required.',
  'UWC-01 contact persistence is anomalous for biologic source — reanalysis flagged probable mechanical origin. Recommend continued tracking.',
  'Environmental sensors nominal. Sea state 2. Current drift vector suggests buoy will require position correction in approx. 6 hours.',
  'Acoustic tonal at 42 Hz with -0.34 knot Doppler shift is consistent with slow-moving subsurface mechanical platform. Confidence elevated to HIGH.',
  'Vessel UNK-2847 has not broadcast AIS in 47 minutes despite continued radar detection. Recommend flagging to shore station.',
]

export const THREAT_EVENTS_TEMPLATES = [
  { sev: 'critical', icon: '▲', msg: 'Probable submersible contact UWC-01 — confidence elevated to 72%' },
  { sev: 'high',     icon: '!', msg: 'Vessel UNK-2847 dark — AIS suppressed, radar track active' },
  { sev: 'medium',   icon: '◆', msg: 'Geofence proximity alert: UNK-2847 within 2.1 nm of RZ-1' },
  { sev: 'low',      icon: '●', msg: 'Battery SOC below 80% — solar charging active, nominal rate' },
  { sev: 'info',     icon: '›', msg: 'Edge model AQUILA-EDGE inference cycle completed — 847ms' },
  { sev: 'info',     icon: '›', msg: 'Uplink to SHORE-01: 2.3 kB telemetry packet transmitted' },
  { sev: 'medium',   icon: '◆', msg: 'Unexpected salinity variance — possible thermocline detected' },
  { sev: 'low',      icon: '●', msg: 'Hydrophone self-test passed — 48-element array nominal' },
  { sev: 'info',     icon: '›', msg: 'PNT sync acquired — GPS/INS agreement within 0.8m' },
  { sev: 'critical', icon: '▲', msg: 'Acoustic tonal at 42 Hz — bearing 312° — motion signature' },
  { sev: 'high',     icon: '!', msg: 'Comms latency spike: 412ms — investigating relay path' },
  { sev: 'info',     icon: '›', msg: 'Digital twin sync complete — delta T +0.3°C from forecast' },
  { sev: 'medium',   icon: '◆', msg: 'Wave height trending up — 0.8m → 1.1m in last 30 min' },
  { sev: 'low',      icon: '●', msg: 'SECURE BOOT integrity check passed — firmware 4.2.1-stable' },
]

// ── Neighbor buoy mesh ───────────────────────────────────────
export const NEIGHBOR_BUOYS = [
  { id: 'SENTINEL-4', lat: 36.71, lon: -121.84, status: 'online',  signal: -72, lastSeen: '00:00:08' },
  { id: 'SENTINEL-9', lat: 36.54, lon: -121.97, status: 'online',  signal: -81, lastSeen: '00:00:22' },
  { id: 'SENTINEL-2', lat: 36.68, lon: -122.01, status: 'warning', signal: -94, lastSeen: '00:01:47' },
  { id: 'SENTINEL-11',lat: 36.49, lon: -121.82, status: 'offline', signal: null, lastSeen: '00:14:03' },
]

// ── Cybersecurity ────────────────────────────────────────────
export const CYBER_EVENTS = [
  { ts: '04:11:22Z', level: 'info',    msg: 'TLS 1.3 handshake completed — SHORE-01' },
  { ts: '03:48:07Z', level: 'warning', msg: 'Unexpected port 8443 scan from 10.11.0.44 — blocked' },
  { ts: '03:22:55Z', level: 'info',    msg: 'Firmware hash verified — SHA-256 match confirmed' },
  { ts: '02:59:13Z', level: 'warning', msg: 'Authentication failure — SSH attempt from 192.168.3.71' },
  { ts: '02:30:44Z', level: 'info',    msg: 'Encrypted tunnel re-established after 2.1s gap' },
  { ts: '01:55:29Z', level: 'critical',msg: 'Sensor tamper flag — IMU housing seal pressure drop' },
]

export const LINK_STATUS = {
  satellite: { name: 'SATCOM (Iridium)',   status: 'online',  quality: 91, bandwidth: '28.8 kbps' },
  radio:     { name: 'HF Radio (SHORE-01)',status: 'online',  quality: 78, bandwidth: '9.6 kbps'  },
  mesh:      { name: 'Mesh (Buoy Net)',     status: 'online',  quality: 84, bandwidth: '54 kbps'   },
  lte:       { name: 'LTE Backup',         status: 'offline', quality: 0,  bandwidth: '—'          },
}
