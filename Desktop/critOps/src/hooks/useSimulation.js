import { useState, useEffect, useRef, useCallback } from 'react'
import {
  generateSensorValue,
  generateHistory,
  SENSOR_RANGES,
  INITIAL_VESSELS,
  INITIAL_CONTACTS,
  INITIAL_ACOUSTIC_LOG,
  AI_SCENARIOS,
  THREAT_EVENTS_TEMPLATES,
  BASE_LAT,
  BASE_LON,
  DRIFT_TRAIL,
} from '../data/mockData'

const rnd = (min, max) => min + Math.random() * (max - min)
const fmtUTC = () => new Date().toUTCString().replace(/.*,\s*/, '').slice(0, 12) + ' UTC'

// Build initial sensor state from all SENSOR_RANGES keys
function buildInitialSensors() {
  const s = {}
  Object.keys(SENSOR_RANGES).forEach(k => {
    s[k] = generateSensorValue(k)
  })
  return s
}

// Build initial history for all sensor keys
function buildInitialHistory() {
  const h = {}
  Object.keys(SENSOR_RANGES).forEach(k => {
    h[k] = generateHistory(k, 60)
  })
  return h
}

export function useSimulation() {
  const [utcTime, setUtcTime] = useState(fmtUTC())
  const [sensors, setSensors] = useState(buildInitialSensors)
  const [history, setHistory] = useState(buildInitialHistory)
  const [vessels, setVessels] = useState(INITIAL_VESSELS)
  const [contacts, setContacts] = useState(INITIAL_CONTACTS)
  const [acousticLog, setAcousticLog] = useState(INITIAL_ACOUSTIC_LOG)
  const [activeContact, setActiveContact] = useState(INITIAL_ACOUSTIC_LOG[0])
  const [alertLog, setAlertLog] = useState(() =>
    THREAT_EVENTS_TEMPLATES.map((t, i) => ({
      ...t,
      id: i,
      ts: new Date(Date.now() - (i + 1) * rnd(90_000, 300_000)).toISOString(),
    }))
  )
  const [aiScenarioIdx, setAiScenarioIdx] = useState(0)
  const [threatLevel, setThreatLevel] = useState(62)
  const [lastSync, setLastSync] = useState('00:00:04')
  const [autonomyMode, setAutonomyMode] = useState('SENTINEL-AUTO')
  const [connectionQuality, setConnectionQuality] = useState(91)
  const [inferenceLatency, setInferenceLatency] = useState(847)
  const [inferenceConfidence, setInferenceConfidence] = useState(0.81)

  const tickRef = useRef(0)

  // ── 1 Hz: update sensor values & histories ───────────────
  useEffect(() => {
    const id = setInterval(() => {
      tickRef.current += 1

      setSensors(prev => {
        const next = { ...prev }
        // Update a random subset of sensors each tick for variety
        const keys = Object.keys(SENSOR_RANGES)
        const toUpdate = keys.filter(() => Math.random() < 0.6)
        toUpdate.forEach(k => { next[k] = generateSensorValue(k) })
        return next
      })

      setHistory(prev => {
        const next = { ...prev }
        const keys = Object.keys(SENSOR_RANGES)
        const toUpdate = keys.filter(() => Math.random() < 0.4)
        toUpdate.forEach(k => {
          const cfg = SENSOR_RANGES[k]
          const lastVal = next[k][next[k].length - 1]
          const newVal = parseFloat(
            Math.min(cfg.base * 1.15, Math.max(cfg.base * 0.85,
              lastVal + (Math.random() - 0.5) * cfg.noise * 3
            )).toFixed(2)
          )
          next[k] = [...next[k].slice(1), newVal]
        })
        return next
      })

      // Drift threat level slowly
      setThreatLevel(prev => {
        const delta = (Math.random() - 0.4) * 3
        return Math.min(95, Math.max(20, prev + delta))
      })

      setConnectionQuality(prev =>
        Math.min(99, Math.max(40, prev + (Math.random() - 0.5) * 2))
      )

      setInferenceLatency(Math.floor(rnd(720, 1100)))

      setLastSync(prev => {
        const parts = prev.split(':')
        let s = parseInt(parts[2]) + 1
        let m = parseInt(parts[1])
        if (s >= 60) { s = 0; m += 1 }
        return `${parts[0]}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
      })
    }, 1000)
    return () => clearInterval(id)
  }, [])

  // ── UTC clock (every second) ─────────────────────────────
  useEffect(() => {
    const id = setInterval(() => setUtcTime(fmtUTC()), 1000)
    return () => clearInterval(id)
  }, [])

  // ── Vessel track updates (every 5s) ─────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      setVessels(prev => prev.map(v => {
        const rad = (v.heading * Math.PI) / 180
        const spd = v.speed * 0.000005 // crude lat/lon delta
        return {
          ...v,
          lat: v.lat + Math.cos(rad) * spd + (Math.random() - 0.5) * 0.0002,
          lon: v.lon + Math.sin(rad) * spd + (Math.random() - 0.5) * 0.0002,
          heading: v.heading + (Math.random() - 0.5) * 2,
          speed: Math.max(1, v.speed + (Math.random() - 0.5) * 0.4),
        }
      }))

      setContacts(prev => prev.map(c => ({
        ...c,
        lat: c.lat + (Math.random() - 0.5) * 0.001,
        lon: c.lon + (Math.random() - 0.5) * 0.001,
        confidence: Math.min(0.99, Math.max(0.3,
          c.confidence + (Math.random() - 0.5) * 0.04
        )),
      })))
    }, 5000)
    return () => clearInterval(id)
  }, [])

  // ── AI copilot scenario rotation (every 12s) ─────────────
  useEffect(() => {
    const id = setInterval(() => {
      setAiScenarioIdx(i => (i + 1) % AI_SCENARIOS.length)
      setInferenceConfidence(prev =>
        Math.min(0.99, Math.max(0.55, prev + (Math.random() - 0.5) * 0.06))
      )
    }, 12000)
    return () => clearInterval(id)
  }, [])

  // ── New alert events (every 15–45s) ─────────────────────
  useEffect(() => {
    const spawn = () => {
      const template = THREAT_EVENTS_TEMPLATES[
        Math.floor(Math.random() * THREAT_EVENTS_TEMPLATES.length)
      ]
      const event = {
        ...template,
        id: Date.now(),
        ts: new Date().toISOString(),
      }
      setAlertLog(prev => [event, ...prev.slice(0, 29)])

      const delay = rnd(15_000, 45_000)
      const next = setTimeout(spawn, delay)
      return next
    }
    const t = setTimeout(spawn, rnd(15_000, 30_000))
    return () => clearTimeout(t)
  }, [])

  // ── Acoustic detection events (every 20–60s) ─────────────
  useEffect(() => {
    const spawn = () => {
      const classifications = [
        { c: 'probable_submersible', conf: () => rnd(0.55, 0.80), bearing: () => Math.floor(rnd(295, 330)), range: () => Math.floor(rnd(1200, 2800)), doppler: () => -rnd(0.2, 0.45), freq: () => Math.floor(rnd(35, 55)) },
        { c: 'biologic',            conf: () => rnd(0.80, 0.97), bearing: () => Math.floor(rnd(100, 250)), range: () => Math.floor(rnd(500, 4000)), doppler: () => rnd(-0.05, 0.05), freq: () => Math.floor(rnd(200, 600)) },
        { c: 'commercial_vessel',   conf: () => rnd(0.88, 0.99), bearing: () => Math.floor(rnd(0, 360)),   range: () => Math.floor(rnd(3000, 8000)), doppler: () => rnd(0.05, 0.20), freq: () => Math.floor(rnd(100, 250)) },
        { c: 'unknown_contact',     conf: () => rnd(0.40, 0.65), bearing: () => Math.floor(rnd(0, 360)),   range: () => Math.floor(rnd(1000, 5000)), doppler: () => rnd(-0.3, 0.3), freq: () => Math.floor(rnd(30, 150)) },
      ]
      const tpl = classifications[Math.floor(Math.random() * classifications.length)]
      const entry = {
        id: `AC-${String(Math.floor(rnd(13, 99))).padStart(4,'0')}`,
        ts: new Date().toUTCString().split(' ').slice(4).join(' '),
        classification: tpl.c,
        confidence: parseFloat(tpl.conf().toFixed(2)),
        bearing: tpl.bearing(),
        range_m: tpl.range(),
        doppler: parseFloat(tpl.doppler().toFixed(2)),
        freq_peak: tpl.freq(),
        note: tpl.c === 'probable_submersible'
          ? `Narrow-band tonal at ${tpl.freq()} Hz, negative Doppler — subsurface motion`
          : tpl.c === 'biologic'
          ? 'Biological vocalization pattern detected'
          : `Broadband noise consistent with ${tpl.c.replace('_',' ')}`,
      }
      setAcousticLog(prev => [entry, ...prev.slice(0, 19)])
      setActiveContact(entry)

      const delay = rnd(20_000, 60_000)
      setTimeout(spawn, delay)
    }
    const t = setTimeout(spawn, rnd(20_000, 40_000))
    return () => clearTimeout(t)
  }, [])

  return {
    utcTime,
    sensors,
    history,
    vessels,
    contacts,
    acousticLog,
    activeContact,
    alertLog,
    aiScenario: AI_SCENARIOS[aiScenarioIdx],
    threatLevel,
    lastSync,
    autonomyMode,
    connectionQuality,
    inferenceLatency,
    inferenceConfidence,
  }
}
