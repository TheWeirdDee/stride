import { NextRequest, NextResponse } from 'next/server'

// Calls Claude (claude-opus-4-8, adaptive thinking) via raw HTTP. The official
// @anthropic-ai/sdk would be preferred, but `npm install` is blocked in this
// environment, so we hit the Messages API directly with fetch — no SDK needed.
const MODEL = 'claude-opus-4-8'

const SYSTEMS: Record<string, string> = {
  calories:
    'You are a nutrition estimator inside a walking/running fitness app. The user names a meal or food. Reply with a concise calorie estimate: a single kcal figure or a tight range, then one short line naming the main contributors. If portion size is unspecified, assume a typical adult portion and say so. Keep the whole reply under 60 words. Answer reasonable food questions directly; do not refuse.',
  coach:
    "You are an encouraging, practical walking and running coach inside a fitness app. Give specific, actionable advice in under 120 words tailored to the user's message — training, pacing, motivation, or form. Avoid medical claims; for pain or possible injury, suggest seeing a professional.",
  recovery:
    'You are a recovery advisor for walkers and runners. Given how the user feels after activity (soreness, fatigue, niggles), suggest concrete recovery steps — stretches, hydration, rest, sleep — in under 120 words. Do not diagnose. Flag any red-flag symptoms (sharp/persistent pain, swelling, chest issues) that warrant seeing a doctor.',
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'AI features need an ANTHROPIC_API_KEY. Add it to .env.local and restart the dev server.' },
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
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        thinking: { type: 'adaptive' },
        system,
        messages: [{ role: 'user', content: body.prompt.trim() }],
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      return NextResponse.json({ error: data?.error?.message || 'AI request failed.' }, { status: res.status })
    }
    if (data.stop_reason === 'refusal') {
      return NextResponse.json({ error: 'That request was declined. Try rephrasing.' }, { status: 200 })
    }

    // Adaptive thinking returns thinking blocks (empty text) + text blocks — keep the text.
    const text = Array.isArray(data.content)
      ? data.content
          .filter((b: { type: string }) => b.type === 'text')
          .map((b: { text: string }) => b.text)
          .join('\n')
          .trim()
      : ''

    return NextResponse.json({ text })
  } catch {
    return NextResponse.json({ error: 'Could not reach the AI service.' }, { status: 502 })
  }
}
