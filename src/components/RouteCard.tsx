'use client'

interface RouteCardProps {
  id: string
  userName?: string
  city: string
  distanceKm: number
  durationMinutes: number
  rewardUSDm: number
  date: string
  activityType: 'walk' | 'run'
  svgPath: string
  // Optional real map snapshot (routes.map_snapshot) shown instead of the SVG.
  imageUrl?: string
}

export default function RouteCard({
  city,
  distanceKm,
  durationMinutes,
  rewardUSDm,
  date,
  activityType,
  svgPath,
  imageUrl,
}: RouteCardProps) {
  const timeStr = `${Math.floor(durationMinutes)}:${String(Math.round((durationMinutes % 1) * 60)).padStart(2, '0')}`

  return (
    <div className="sd-card" style={{ overflow: 'hidden' }}>
      {/* Map / route visual */}
      <div
        style={{
          position: 'relative',
          height: 118,
          background: 'radial-gradient(120% 120% at 30% 20%, rgba(10,42,72,0.4), transparent 60%), #0b0e10',
          overflow: 'hidden',
        }}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={`Route in ${city}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <>
            <div className="sd-grid" style={{ position: 'absolute', inset: 0 }} />
            <svg viewBox="0 0 200 100" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
              <path d={svgPath} fill="none" stroke="#cdfb46" strokeWidth="2.6" strokeLinecap="round" className="sd-route-stroke" />
            </svg>
          </>
        )}
        <div
          className="sd-mono"
          style={{ position: 'absolute', top: 10, left: 12, fontWeight: 700, fontSize: 10, letterSpacing: '0.12em', color: 'rgba(244,246,243,0.6)', textTransform: 'uppercase' }}
        >
          {city}
        </div>
        <div
          className="sd-mono"
          style={{ position: 'absolute', top: 10, right: 12, fontWeight: 700, fontSize: 9, letterSpacing: '0.1em', color: '#cdfb46', textTransform: 'uppercase', background: 'rgba(6,8,10,0.5)', backdropFilter: 'blur(4px)', padding: '3px 7px', borderRadius: 20 }}
        >
          {activityType}
        </div>
      </div>

      {/* Stats */}
      <div style={{ padding: '13px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div className="sd-mono" style={{ fontWeight: 800, fontSize: 26, lineHeight: 1, color: '#f4f6f3' }}>
            {distanceKm.toFixed(2)}
            <span style={{ fontSize: 12, color: 'rgba(244,246,243,0.45)', marginLeft: 3 }}>km</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="sd-mono" style={{ fontSize: 10, color: 'rgba(244,246,243,0.4)', letterSpacing: '0.08em' }}>TIME</div>
            <div className="sd-mono" style={{ fontWeight: 700, fontSize: 14, color: 'rgba(244,246,243,0.85)' }}>{timeStr}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 11, paddingTop: 11, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <span className="sd-mono" style={{ fontSize: 10, color: 'rgba(244,246,243,0.4)', letterSpacing: '0.05em' }}>{date}</span>
          {rewardUSDm > 0 && (
            <span className="sd-mono" style={{ fontSize: 13, fontWeight: 800, color: '#cdfb46' }}>+${rewardUSDm.toFixed(2)}</span>
          )}
        </div>
      </div>
    </div>
  )
}
