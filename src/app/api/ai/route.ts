import { NextRequest, NextResponse } from 'next/server'

// Free, no-credit-card AI via Groq (OpenAI-compatible API). Get a free key at
// https://console.groq.com/keys and put it in .env.local as GROQ_API_KEY.
// Override the model with GROQ_MODEL if you like.
const ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'

const SYSTEMS: Record<string, string> = {
  calories:
    'You are a nutrition estimator inside a walking/running fitness app. The user names a meal or food. Reply with a concise calorie estimate: a single kcal figure or a tight range, then one short line naming the main contributors. If portion size is unspecified, assume a typical adult portion and say so. Keep the whole reply under 60 words.',
  coach:
    "You are an encouraging, practical walking and running coach inside a fitness app. Give specific, actionable advice in under 120 words tailored to the user's message — training, pacing, motivation, or form.",
  recovery:
    'You are a recovery advisor for walkers and runners. Given how the user feels after activity (soreness, fatigue, niggles), suggest concrete recovery steps — stretches, hydration, rest, sleep — in under 120 words.',
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'AI needs a free GROQ_API_KEY. Get one at console.groq.com/keys, add it to .env.local, and restart the dev server.' },
      { status: 503 }
    )
  }

  let body: { mode?: string; prompt?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const system = SYSTEMS[body.mode || '']
  if (!system) return NextResponse.json({ error: 'Unknown AI mode.' }, { status: 400 })
  if (!body.prompt?.trim()) return NextResponse.json({ error: 'Please enter something first.' }, { status: 400 })

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 400,
        temperature: 0.5,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: body.prompt.trim() },
        ],
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      return NextResponse.json({ error: data?.error?.message || 'AI request failed.' }, { status: res.status })
    }

    const text = (data?.choices?.[0]?.message?.content || '').trim()
    return NextResponse.json({ text })
  } catch {
    return NextResponse.json({ error: 'Could not reach the AI service.' }, { status: 502 })
  }
}
