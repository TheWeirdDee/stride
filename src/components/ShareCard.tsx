'use client'

import { useState, useEffect } from 'react'
import { generateRouteCard } from '@/utils/generateRouteCard'
import { Share, Download, Image as ImageIcon, Check, Loader2 } from 'lucide-react'

interface Coord {
  lat: number
  lng: number
}

interface ShareStats {
  distance: string
  duration: string
  pace: string
  date: string
}

interface ShareCardProps {
  coords: Coord[]
  stats: ShareStats
}

export default function ShareCard({ coords, stats }: ShareCardProps) {
  const [imgUrl, setImgUrl] = useState<string | null>(null)
  const [imageBlob, setImageBlob] = useState<Blob | null>(null)
  const [generating, setGenerating] = useState(true)
  const [shared, setShared] = useState(false)
  const [downloaded, setDownloaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    async function createCard() {
      try {
        setGenerating(true)
        setError(null)
        const blob = await generateRouteCard(coords, stats)
        if (!active) return
        
        const url = URL.createObjectURL(blob)
        setImgUrl(url)
        setImageBlob(blob)
      } catch (err: any) {
        console.error('Error generating route card:', err)
        if (active) setError('Failed to generate sharing image.')
      } finally {
        if (active) setGenerating(false)
      }
    }

    createCard()

    return () => {
      active = false
      if (imgUrl) {
        URL.revokeObjectURL(imgUrl)
      }
    }
  }, [coords, stats])

  const handleShare = async () => {
    if (!imageBlob) return
    try {
      const file = new File([imageBlob], 'stride-workout.png', { type: 'image/png' })
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'My Stride Workout',
          text: `Just finished my workout on Stride! Check out my route and stats: ${stats.distance} in ${stats.duration}.`,
        })
        setShared(true)
        setTimeout(() => setShared(false), 3000)
      } else {
        if (navigator.share) {
          await navigator.share({
            title: 'My Stride Workout',
            text: `Just completed my Stride commitment! Distance: ${stats.distance}, Time: ${stats.duration}, Pace: ${stats.pace}.`,
          })
          setShared(true)
          setTimeout(() => setShared(false), 3000)
        } else {
          await navigator.clipboard.writeText(
            `Just completed my Stride commitment! Distance: ${stats.distance}, Time: ${stats.duration}, Pace: ${stats.pace}.`
          )
          alert('Workout stats copied to clipboard! You can paste them anywhere to share.')
        }
      }
    } catch (err) {
      console.warn('Web Share failed or cancelled:', err)
    }
  }

  const handleDownload = () => {
    if (!imgUrl) return
    const a = document.createElement('a')
    a.href = imgUrl
    a.download = 'stride-workout.png'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setDownloaded(true)
    setTimeout(() => setDownloaded(false), 3000)
  }

  return (
    <div className="w-full max-w-md mx-auto bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl text-white">
      <div className="flex items-center gap-2 mb-4">
        <ImageIcon className="h-5 w-5 text-lime-400" />
        <h3 className="font-bold text-sm uppercase tracking-wider">Shareable Workout Card</h3>
      </div>

      {generating && (
        <div className="w-full aspect-[1200/630] rounded-2xl bg-zinc-950 flex flex-col items-center justify-center border border-zinc-800">
          <Loader2 className="h-8 w-8 text-lime-400 animate-spin mb-2" />
          <p className="text-xs text-zinc-500 font-semibold">Generating high-res card...</p>
        </div>
      )}

      {error && (
        <div className="w-full aspect-[1200/630] rounded-2xl bg-zinc-950 flex flex-col items-center justify-center border border-zinc-800 text-rose-500 p-4 text-center">
          <p className="text-sm font-bold">{error}</p>
        </div>
      )}

      {!generating && !error && imgUrl && (
        <div className="w-full rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imgUrl} alt="Stride Workout Card" className="w-full h-auto object-contain" />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mt-5">
        <button
          onClick={handleShare}
          disabled={generating || !imageBlob}
          className="flex items-center justify-center gap-2 py-3 rounded-xl bg-lime-400 text-black font-extrabold text-xs shadow-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
        >
          {shared ? (
            <>
              <Check className="h-4 w-4" /> Shared!
            </>
          ) : (
            <>
              <Share className="h-4 w-4" /> Share Card
            </>
          )}
        </button>

        <button
          onClick={handleDownload}
          disabled={generating || !imgUrl}
          className="flex items-center justify-center gap-2 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white font-extrabold text-xs hover:bg-zinc-700 active:scale-95 transition-all disabled:opacity-50"
        >
          {downloaded ? (
            <>
              <Check className="h-4 w-4 text-lime-400" /> Saved!
            </>
          ) : (
            <>
              <Download className="h-4 w-4" /> Save Image
            </>
          )}
        </button>
      </div>
    </div>
  )
}
