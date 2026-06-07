import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './constants'

// A valid Supabase URL must start with https:// (or http:// for local dev)
const isValidUrl = (url: string) => /^https?:\/\/.+/.test(url)

const urlReady = !!SUPABASE_URL && isValidUrl(SUPABASE_URL)
const keyReady = !!SUPABASE_ANON_KEY

if (!urlReady || !keyReady) {
  console.warn(
    'Supabase client not initialised — NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_ANON_KEY are missing or invalid. ' +
    'Configure them in your .env.local file or in Netlify environment variables.'
  )
}

// Only create the client when both values are valid.
// Calling createClient() with a missing/malformed URL throws at module
// evaluation time which aborts Next.js SSR / Netlify builds.
export const supabase: SupabaseClient | null =
  urlReady && keyReady
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null

