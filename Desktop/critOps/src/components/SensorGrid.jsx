import React from 'react'
import { SENSOR_RANGES } from '../data/mockData'

// Mini SVG sparkline
function Sparkline({ data, color = '#22d3ee', height = 28 }) {
  if (!data || data.length < 2) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const w = 100
  const h = height
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / range) * h * 0.85 - h * 0.07
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={`sg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${h} ${pts.join(' ')} ${w},${h}`}
        fill={`url(#sg-${color.replace('#','')})`}
      />
      <polyline
        points={pts.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Status dot
function StatusDot({ status }) {
  const colors = { ok: '#10b981', warn: '#f59e0b', alert: '#ef4444', dim: '#475569' }
  return (
    <div
      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
      style={{ background: colors[status] ?? colors.dim, boxShadow: `0 0 4px ${colors[status] ?? colors.dim}88` }}
    />
  )
}

// Single sensor card
function SensorCard({ label, value, unit, history, color = '#22d3ee', status = 'ok', compact = false }) {
  return (
    <div className="bg-[#0a1628] border border-[#1a3354] rounded p-2 flex flex-col gap-1 min-w-0">
      <div className="flex items-center justify-between gap-1">
        <div className="text-[8px] font-mono font-bold tracking-[0.12em] text-[#475569] truncate leading-none">
          {label}
        </div>
        <StatusDot status={status} />
      </div>
      <div className="flex items-baseline gap-1 leading-none">
        <span className="font-mono font-bold text-[#e2e8f0] leading-none" style={{ fontSize: compact ? '13px' : '16px', color }}>
          {value}
        </span>
        <span className="font-mono text-[8px] text-[#475569]">{unit}</span>
      </div>
      {history && <Sparkline data={history} color={color} height={24} />}
    </div>
  )
}

// Section sub-header
function SubHeader({ label }) {
  return (
    <div className="col-span-full text-[8px] font-mono font-bold tracking-[0.2em] text-[#22d3ee] pt-2 pb-0.5 border-b border-[#122040] mb-1">
      ── {label}
    </div>
  )
}

// Bearing compass rose (tiny)
function BearingRose({ degrees }) {
  const rad = ((degrees - 90) * Math.PI) / 180
  const cx = 16, cy = 16, r = 12
  const x2 = cx + r * Math.cos(rad)
  const y2 = cy + r * Math.sin(rad)
  return (
    <svg width="32" height="32" viewBox="0 0 32 32">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1a3354" strokeWidth="1" />
      <circle cx={cx} cy={cy} r={2} fill="#22d3ee" />
      <line x1={cx} y1={cy} x2={x2} y2={y2} stroke="#00f5ff" strokeWidth="1.5" strokeLinecap="round" />
      <text x={cx} y={4} textAnchor="middle" fill="#475569" fontSize="5" fontFamily="Space Mono, monospace">N</text>
    </svg>
  )
}

export default function SensorGrid({ sensors, history }) {
  const fmt = (key, decimals = 1) => {
    const v = sensors?.[key]
    return v != null ? v.toFixed(decimals) : '—'
  }

  const statusFor = (key, warnThresh, alertThresh, invert = false) => {
    const v = sensors?.[key]
    if (v == null) return 'dim'
    const over = invert ? v < alertThresh : v > alertThresh
    const warn = invert ? v < warnThresh : v > warnThresh
    return over ? 'alert' : warn ? 'warn' : 'ok'
  }

  return (
    <div className="tac-card flex flex-col h-full overflow-hidden">
      <div className="section-header">
        <div className="dot" />
        <span>SENSOR TELEMETRY</span>
        <span className="ml-auto font-mono text-[9px] text-[#10b981]">LIVE</span>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <div className="grid grid-cols-2 gap-1.5">

          <SubHeader label="POSITION / NAVIGATION" />

          <SensorCard
            label="LATITUDE"
            value={fmt('gps_lat', 4)}
            unit="°N"
            history={history?.gps_lat}
            color="#22d3ee"
            status="ok"
          />
          <SensorCard
            label="LONGITUDE"
            value={fmt('gps_lon', 4)}
            unit="°W"
            history={history?.gps_lon}
            color="#22d3ee"
            status="ok"
          />
          <SensorCard
            label="HEADING"
            value={fmt('heading', 0)}
            unit="°"
            history={history?.heading}
            color="#94a3b8"
            status="ok"
          />
          <div className="bg-[#0a1628] border border-[#1a3354] rounded p-2 flex flex-col gap-1">
            <div className="text-[8px] font-mono font-bold tracking-[0.12em] text-[#475569]">BEARING ROSE</div>
            <div className="flex items-center gap-2">
              <BearingRose degrees={sensors?.heading ?? 217} />
              <div className="flex flex-col gap-0.5">
                <div className="font-mono text-[9px] text-[#94a3b8]">P: {fmt('pitch')}°</div>
                <div className="font-mono text-[9px] text-[#94a3b8]">R: {fmt('roll')}°</div>
                <div className="font-mono text-[9px] text-[#94a3b8]">ω: {fmt('yaw_rate')}°/s</div>
              </div>
            </div>
          </div>

          <SubHeader label="OCEANOGRAPHIC" />

          <SensorCard
            label="WATER TEMP"
            value={fmt('water_temp')}
            unit="°C"
            history={history?.water_temp}
            color="#22d3ee"
            status={statusFor('water_temp', 20, 25)}
          />
          <SensorCard
            label="AIR TEMP"
            value={fmt('air_temp')}
            unit="°C"
            history={history?.air_temp}
            color="#94a3b8"
            status="ok"
          />
          <SensorCard
            label="SALINITY"
            value={fmt('salinity')}
            unit="PSU"
            history={history?.salinity}
            color="#38bdf8"
            status="ok"
          />
          <SensorCard
            label="pH"
            value={fmt('ph', 2)}
            unit="pH"
            history={history?.ph}
            color="#a78bfa"
            status={statusFor('ph', 8.3, 8.5)}
          />
          <SensorCard
            label="TURBIDITY"
            value={fmt('turbidity')}
            unit="NTU"
            history={history?.turbidity}
            color="#fbbf24"
            status={statusFor('turbidity', 10, 20)}
          />
          <SensorCard
            label="DISS O₂"
            value={fmt('dissolved_o2')}
            unit="mg/L"
            history={history?.dissolved_o2}
            color="#34d399"
            status={statusFor('dissolved_o2', 5, 4, true)}
          />
          <SensorCard
            label="SONAR DEPTH"
            value={fmt('depth_sonar')}
            unit="m"
            history={history?.depth_sonar}
            color="#38bdf8"
            status="ok"
          />
          <SensorCard
            label="CURR SPEED"
            value={fmt('current_speed', 2)}
            unit="kts"
            history={history?.current_speed}
            color="#22d3ee"
            status="ok"
          />

          <SubHeader label="ATMOSPHERIC" />

          <SensorCard
            label="BARO PRESS"
            value={fmt('baro_pressure', 1)}
            unit="hPa"
            history={history?.baro_pressure}
            color="#94a3b8"
            status="ok"
          />
          <SensorCard
            label="HUMIDITY"
            value={fmt('humidity', 0)}
            unit="%"
            history={history?.humidity}
            color="#38bdf8"
            status="ok"
          />
          <SensorCard
            label="WIND SPEED"
            value={fmt('wind_speed')}
            unit="kts"
            history={history?.wind_speed}
            color="#fbbf24"
            status={statusFor('wind_speed', 20, 35)}
          />
          <SensorCard
            label="WIND DIR"
            value={fmt('wind_dir', 0)}
            unit="°"
            history={history?.wind_dir}
            color="#94a3b8"
            status="ok"
          />
          <SensorCard
            label="WAVE HEIGHT"
            value={fmt('wave_height')}
            unit="m"
            history={history?.wave_height}
            color="#38bdf8"
            status={statusFor('wave_height', 2.5, 4)}
          />
          <SensorCard
            label="HULL TILT"
            value={fmt('hull_tilt')}
            unit="°"
            history={history?.hull_tilt}
            color="#94a3b8"
            status={statusFor('hull_tilt', 8, 15)}
          />

          <SubHeader label="POWER SYSTEMS" />

          <SensorCard
            label="BATT VOLTAGE"
            value={fmt('battery_v')}
            unit="V"
            history={history?.battery_v}
            color="#10b981"
            status={statusFor('battery_v', 23, 22, true)}
          />
          <SensorCard
            label="BATT SOC"
            value={fmt('battery_pct', 0)}
            unit="%"
            history={history?.battery_pct}
            color="#10b981"
            status={statusFor('battery_pct', 30, 20, true)}
          />
          <SensorCard
            label="CURR DRAW"
            value={fmt('current_draw')}
            unit="A"
            history={history?.current_draw}
            color="#fbbf24"
            status={statusFor('current_draw', 5, 7)}
          />
          <SensorCard
            label="SOLAR OUT"
            value={fmt('solar_output')}
            unit="W"
            history={history?.solar_output}
            color="#fbbf24"
            status="ok"
          />

          <SubHeader label="SYSTEM HEALTH" />

          <SensorCard
            label="CPU TEMP"
            value={fmt('cpu_temp', 0)}
            unit="°C"
            history={history?.cpu_temp}
            color="#f97316"
            status={statusFor('cpu_temp', 70, 85)}
          />
          <SensorCard
            label="ENCL PRESS"
            value={fmt('enclosure_pres', 2)}
            unit="bar"
            history={history?.enclosure_pres}
            color="#10b981"
            status="ok"
          />
          <SensorCard
            label="CPU USAGE"
            value={fmt('cpu_usage', 0)}
            unit="%"
            history={history?.cpu_usage}
            color="#a78bfa"
            status={statusFor('cpu_usage', 80, 90)}
          />
          <SensorCard
            label="MEM USAGE"
            value={fmt('mem_usage', 0)}
            unit="%"
            history={history?.mem_usage}
            color="#a78bfa"
            status={statusFor('mem_usage', 85, 95)}
          />
          <SensorCard
            label="STORAGE"
            value={fmt('storage_used', 0)}
            unit="%"
            history={history?.storage_used}
            color="#64748b"
            status="ok"
          />
          <SensorCard
            label="COMMS LAT"
            value={fmt('comms_latency', 0)}
            unit="ms"
            history={history?.comms_latency}
            color="#22d3ee"
            status={statusFor('comms_latency', 300, 600)}
          />
          <SensorCard
            label="PKT LOSS"
            value={fmt('packet_loss', 1)}
            unit="%"
            history={history?.packet_loss}
            color="#22d3ee"
            status={statusFor('packet_loss', 3, 8)}
          />

          {/* Camera / subsystem status row */}
          <SubHeader label="SUBSYSTEM STATUS" />

          {[
            { label: 'CAMERA', status: 'online', color: '#10b981' },
            { label: 'RADAR', status: 'standby', color: '#f59e0b' },
            { label: 'LIDAR', status: 'offline', color: '#ef4444' },
            { label: 'HYDROPHONE', status: 'online', color: '#10b981' },
            { label: 'IMU', status: 'online', color: '#10b981' },
            { label: 'GPS/INS', status: 'online', color: '#10b981' },
          ].map(({ label, status, color }) => (
            <div
              key={label}
              className="bg-[#0a1628] border border-[#1a3354] rounded p-2 flex items-center justify-between"
            >
              <span className="font-mono text-[9px] text-[#475569] font-bold tracking-widest">{label}</span>
              <div
                className="pill text-[8px]"
                style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}
              >
                {status.toUpperCase()}
              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  )
}
