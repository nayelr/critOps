import { useState, useEffect } from 'react'
import {
  sensorValues,
  threatConfidence,
  INITIAL_EVENTS,
  AI_ASSESSMENTS,
  RECOMMENDED_ACTIONS,
  VESSELS,
  BUOY,
  SUBMERSIBLE_DETECTED,
} from '../data/mockData'

const fmtUTC = () => {
  const d = new Date()
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}:${String(d.getUTCSeconds()).padStart(2, '0')}Z`
}

export function useSimulation() {
  const [utcTime, setUtcTime] = useState(fmtUTC())
  const [sensors, setSensors] = useState(sensorValues())
  const [confidence, setConfidence] = useState(0)
  const [aiIdx, setAiIdx] = useState(0)
  const [events, setEvents] = useState(INITIAL_EVENTS)
  const [vessels, setVessels] = useState(VESSELS)
  const [threatRange, setThreatRange] = useState(0.009)

  const threatLat = BUOY.lat
  const threatLon = BUOY.lon

  useEffect(() => {
    const id = setInterval(() => setUtcTime(fmtUTC()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      setSensors(sensorValues())
      setConfidence(threatConfidence())
      setThreatRange(prev => Math.max(0, Math.min(0.025, prev + (Math.random() - 0.5) * 0.004)))
    }, 2000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      setAiIdx(i => (i + 1) % AI_ASSESSMENTS.length)
    }, 15000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!vessels.length) return undefined
    const id = setInterval(() => {
      setVessels(prev => prev.map(v => ({
        ...v,
        lat: v.lat + (Math.random() - 0.5) * 0.0008,
        lon: v.lon + (Math.random() - 0.5) * 0.0008,
      })))
    }, 5000)
    return () => clearInterval(id)
  }, [vessels.length])

  useEffect(() => {
    const newEvents = [
      { sev: 'info', text: `Water temp ${(20.8 + Math.random() * 0.8).toFixed(1)} °C — stable (indoor)` },
      { sev: 'ai', text: 'Threat score 0% — no contact hypotheses active' },
      { sev: 'info', text: 'Environmental noise floor nominal' },
      { sev: 'info', text: 'Motion compensation within limits' },
    ]
    const id = setInterval(() => {
      const e = newEvents[Math.floor(Math.random() * newEvents.length)]
      const now = fmtUTC()
      setEvents(prev => [{ id: Date.now(), ts: now, ...e }, ...prev].slice(0, 8))
    }, 20000)
    return () => clearInterval(id)
  }, [])

  return {
    utcTime,
    sensors,
    confidence,
    aiAssessment: AI_ASSESSMENTS[aiIdx],
    recommendedAction: RECOMMENDED_ACTIONS[aiIdx],
    events,
    vessels,
    threatRange: parseFloat(threatRange.toFixed(3)),
    threatLat,
    threatLon,
    submersibleDetected: SUBMERSIBLE_DETECTED,
  }
}
