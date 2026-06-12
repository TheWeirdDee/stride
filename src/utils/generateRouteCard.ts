interface Coord {
  lat: number
  lng: number
}

interface ShareStats {
  distance: string // e.g. "4.20 km"
  duration: string // e.g. "24:15"
  pace: string // e.g. "5:46 min/km"
  date: string // e.g. "Jun 12, 2026"
}

export function generateRouteCard(
  coords: Coord[],
  stats: ShareStats
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // Create a high-res canvas (1200x630 - standard social sharing og:image ratio)
    const canvas = document.createElement('canvas')
    canvas.width = 1200
    canvas.height = 630
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      reject(new Error('Canvas context not available'))
      return
    }

    // 1. Draw Background Gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, '#09090b') // zinc-950
    gradient.addColorStop(1, '#020617') // slate-950
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 2. Draw Subtle Grid Pattern for techy athletic look
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)'
    ctx.lineWidth = 1
    const gridSize = 40
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    // 3. Draw Branding (Stride Header)
    ctx.fillStyle = '#cdfb46' // Stride Lime
    ctx.font = '900 42px "Outfit", "Inter", sans-serif'
    ctx.fillText('STRIDE', 60, 80)

    ctx.fillStyle = '#ffffff'
    ctx.font = '500 16px "Inter", sans-serif'
    ctx.fillText('COMMIT · MOVE · EARN', 230, 75)

    // Draw Date
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
    ctx.font = '500 18px "Inter", sans-serif'
    ctx.fillText(stats.date, canvas.width - 250, 75)

    // 4. Draw Stats Section (Left Side Column)
    const statsYStart = 160
    const statSpacing = 110

    // Stat 1: Distance
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
    ctx.font = 'bold 14px "Inter", sans-serif'
    ctx.fillText('DISTANCE', 60, statsYStart)
    ctx.fillStyle = '#ffffff'
    ctx.font = '900 48px "Inter", sans-serif'
    ctx.fillText(stats.distance, 60, statsYStart + 45)

    // Stat 2: Duration
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
    ctx.font = 'bold 14px "Inter", sans-serif'
    ctx.fillText('DURATION', 60, statsYStart + statSpacing)
    ctx.fillStyle = '#ffffff'
    ctx.font = '900 48px "Inter", sans-serif'
    ctx.fillText(stats.duration, 60, statsYStart + statSpacing + 45)

    // Stat 3: Avg Pace
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
    ctx.font = 'bold 14px "Inter", sans-serif'
    ctx.fillText('AVG PACE', 60, statsYStart + 2 * statSpacing)
    ctx.fillStyle = '#cdfb46' // Highlight in Lime
    ctx.font = '900 48px "Inter", sans-serif'
    ctx.fillText(stats.pace, 60, statsYStart + 2 * statSpacing + 45)

    // 5. Draw Map Path (Right Side Area)
    const mapLeft = 520
    const mapTop = 140
    const mapWidth = 620
    const mapHeight = 430

    // Draw Map Frame Background (Glassmorphic panel)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.02)'
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.roundRect(mapLeft, mapTop, mapWidth, mapHeight, 30)
    ctx.fill()
    ctx.stroke()

    if (coords && coords.length >= 2) {
      const lats = coords.map((c) => c.lat)
      const lngs = coords.map((c) => c.lng)
      const minLat = Math.min(...lats)
      const maxLat = Math.max(...lats)
      const minLng = Math.min(...lngs)
      const maxLng = Math.max(...lngs)

      const rangeLat = maxLat - minLat || 0.0001
      const rangeLng = maxLng - minLng || 0.0001

      // Map coords inside frame with custom padding
      const padding = 60
      const scaleX = mapWidth - 2 * padding
      const scaleY = mapHeight - 2 * padding

      const project = (coord: Coord) => {
        const x = mapLeft + padding + ((coord.lng - minLng) / rangeLng) * scaleX
        const y = mapTop + mapHeight - (padding + ((coord.lat - minLat) / rangeLat) * scaleY)
        return { x, y }
      }

      // Draw Path Line
      ctx.strokeStyle = '#cdfb46'
      ctx.lineWidth = 8
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      
      // Glow effect
      ctx.shadowColor = '#cdfb46'
      ctx.shadowBlur = 15

      ctx.beginPath()
      const firstPt = project(coords[0])
      ctx.moveTo(firstPt.x, firstPt.y)

      for (let i = 1; i < coords.length; i++) {
        const pt = project(coords[i])
        ctx.lineTo(pt.x, pt.y)
      }
      ctx.stroke()

      // Reset shadow
      ctx.shadowBlur = 0

      // Draw Start/End Markers
      const startPt = project(coords[0])
      const endPt = project(coords[coords.length - 1])

      // Start Marker (Green)
      ctx.fillStyle = '#10b981'
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(startPt.x, startPt.y, 10, 0, 2 * Math.PI)
      ctx.fill()
      ctx.stroke()

      // End Marker (Blue)
      ctx.fillStyle = '#3b82f6'
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(endPt.x, endPt.y, 10, 0, 2 * Math.PI)
      ctx.fill()
      ctx.stroke()
    } else {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
      ctx.font = '500 18px "Inter", sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('NO GPS PATH RECORDED', mapLeft + mapWidth / 2, mapTop + mapHeight / 2)
      ctx.textAlign = 'left'
    }

    // Convert Canvas to Blob
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error('Canvas blob generation failed'))
      }
    }, 'image/png')
  })
}
