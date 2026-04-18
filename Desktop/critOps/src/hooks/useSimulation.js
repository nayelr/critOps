import { useState, useEffect, useRef } from 'react'
import {
  sensorValues,
  threatConfidence,
  INITIAL_EVENTS,
  AI_ASSESSMENTS,
  RECOMMENDED_ACTIONS,
  VESSELS,
  THREAT_CONTACT,
} from '../data/mockData'

const fmtUTC = () => {
  const d = new Date()
  return `${String(d.getUTCHours()).padStart(2,'0')}:${String(d.getUTCMinutes()).padStart(2,'0')}:${String(d.getUTCSeconds()).padStart(2,'0')}Z`
}

export function useSimulation() {
  const [utcTime, setUtcTime] = useState(fmtUTC())
  const [sensors, setSensors] = useState(sensorValues())
  const [confidence, setConfidence] = useState(THREAT_CONTACT.confidence)
  const [aiIdx, setAiIdx] = useState(0)
  const [events, setEvents] = useState(INITIAL_EVENTS)
  const [vessels, setVessels] = useState(VESSELS)
  const [threatRange, setThreatRange] = useState(THREAT_CONTACT.rangeKm)
  const [threatLat, setThreatLat] = useState(THREAT_CONTACT.lat)
  const [threatLon, setThreatLon] = useState(THREAT_CONTACT.lon)

  // Clock
  useEffect(() => {
    const id = setInterval(() => setUtcTime(fmtUTC()), 1000)
    return () => clearInterval(id)
  }, [])

  // Sensors update every 2s
  useEffect(() => {
    const id = setInterval(() => {
      setSensors(sensorValues())
      setConfidence(prev => threatConfidence(prev))
      setThreatRange(prev => Math.max(0.8, prev - 0.002 + (Math.random() - 0.3) * 0.01))
    }, 2000)
    return () => clearInterval(id)
  }, [])

  // AI assessment rotates every 15s
  useEffect(() => {
    const id = setInterval(() => {
      setAiIdx(i => (i + 1) % AI_ASSESSMENTS.length)
    }, 15000)
    return () => clearInterval(id)
  }, [])

  // Vessel drift every 5s
  useEffect(() => {
    const id = setInterval(() => {
      setVessels(prev => prev.map(v => ({
        ...v,
        lat: v.lat + (Math.random() - 0.5) * 0.0008,
        lon: v.lon + (Math.random() - 0.5) * 0.0008,
      })))
      setThreatLat(prev => prev + (Math.random() - 0.5) * 0.0005)
      setThreatLon(prev => prev + (Math.random() - 0.5) * 0.0005)
    }, 5000)
    return () => clearInterval(id)
  }, [])

  // Occasional new events
  useEffect(() => {
    const newEvents = [
      { sev: 'threat',  text: 'UWC-01 bearing holding steady at 312°' },
      { sev: 'ai',      text: `AI confidence updated — ${Math.round(confidence * 100)}%` },
      { sev: 'info',    text: 'Mesh uplink to shore station: nominal' },
      { sev: 'warning', text: 'AIS-dark contact UNK-2847 still unresponsive' },
    ]
    const id = setInterval(() => {
      const e = newEvents[Math.floor(Math.random() * newEvents.length)]
      const now = fmtUTC()
      setEvents(prev => [{ id: Date.now(), ts: now, ...e }, ...prev].slice(0, 8))
    }, 20000)
    return () => clearInterval(id)
  }, [confidence])

  return {
    utcTime,
    sensors,
    confidence,
    aiAssessment: AI_ASSESSMENTS[aiIdx],
    recommendedAction: RECOMMENDED_ACTIONS[aiIdx],
    events,
    vessels,
    threatRange: parseFloat(threatRange.toFixed(2)),
    threatLat,
    threatLon,
  }
}
