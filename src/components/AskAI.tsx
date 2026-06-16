'use client'

import { useState } from 'react'
import { Sparkles, RefreshCw } from 'lucide-react'

interface AskAIProps {
  mode: 'calories' | 'coach' | 'recovery'
  title: string
  subtitle: string
  placeholder: string
  cta: string
  accent?: string
}

export default function AskAI({ mode, title, subtitle, placeholder, cta, accent = '#cdfb46' }: AskAIProps) {
  const [input, setInput] = useState('')
  const [answer, setAnswer] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const ask = async () => {
    if (!input.trim() || loading) return
    setLoading(true)
    setError(null)
    setAnswer(null)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ mode, prompt: input.trim() }),
      })
      const data = await res.json()
      if (!res.ok) setError(data?.error || 'Something went wrong.')
      else setAnswer(data.text || 'No answer returned.')
    } catch {
      setError('Network error — try again.')
    }
    setLoading(false)
  }

  return (
    <div className="sd-card" style={{ padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <Sparkles className="h-4 w-4" style={{ color: accent }} />
        <h3 style={{ fontFamily: "'Archivo Expanded',sans-serif", fontWeight: 800, fontSize: 16, textTransform: 'uppercase' }}>{title}</h3>
      </div>
      <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>{subtitle}</p>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder}
        rows={2}
        className="sd-input"
        style={{ resize: 'vertical', fontFamily: "'Archivo',system-ui,sans-serif" }}
      />
      <button onClick={ask} disabled={loading || !input.trim()} className="sd-btn sd-btn-lime" style={{ marginTop: 10, fontSize: 13, padding: 12 }}>
        {loading ? (<><RefreshCw className="h-4 w-4" style={{ animation: 'spin 0.9s linear infinite' }} /> Thinking…</>) : cta}
      </button>
      {error && (
        <div style={{ marginTop: 12, padding: 12, borderRadius: 12, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#fbbf24', fontSize: 12, lineHeight: 1.5 }}>{error}</div>
      )}
      {answer && (
        <div style={{ marginTop: 12, padding: 14, borderRadius: 12, background: 'rgba(205,251,70,0.06)', border: '1px solid rgba(205,251,70,0.18)', fontSize: 13.5, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{answer}</div>
      )}
      <div className="sd-mono" style={{ fontSize: 9, color: 'var(--muted-3)', marginTop: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }}>AI estimate · not medical advice</div>
    </div>
  )
}
