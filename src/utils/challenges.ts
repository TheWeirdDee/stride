import { supabase } from '@/utils/supabase'

export type Activity = 'walk' | 'run'
export type ChallengeStatus = 'active' | 'completed' | 'cancelled'

export interface Challenge {
  id: string
  creator_wallet: string
  title: string
  description: string | null
  activity: Activity
  goal_value: number // meters
  starts_at: string
  ends_at: string | null
  cover_url: string | null
  status: ChallengeStatus
  created_at: string
}

export interface ChallengeParticipant {
  id: string
  challenge_id: string
  wallet_address: string
  joined_at: string
  progress: number // meters
  completed_at: string | null
}

/**
 * Resolve the current member identity. Connected wallet wins; otherwise fall
 * back to the locally-stored guest profile id — guests are full members.
 */
export function getMemberId(address?: string | null): string | null {
  if (address) return address
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('stride_guest_profile')
    if (raw) return (JSON.parse(raw)?.id as string) || null
  } catch {}
  return null
}

export async function fetchChallenges(activity?: Activity): Promise<Challenge[]> {
  if (!supabase) return []
  let q = supabase.from('challenges').select('*').order('created_at', { ascending: false })
  if (activity) q = q.eq('activity', activity)
  const { data, error } = await q
  if (error) {
    // Most commonly the 'challenges' table hasn't been created yet — fail quietly.
    console.warn('[challenges] not reachable yet:', error.message || error.code || 'unknown', '— run supabase/schema.sql + create the challenge-covers bucket.')
    return []
  }
  return (data as Challenge[]) || []
}

export async function fetchChallenge(id: string): Promise<Challenge | null> {
  if (!supabase) return null
  const { data } = await supabase.from('challenges').select('*').eq('id', id).maybeSingle()
  return (data as Challenge) || null
}

export async function fetchParticipants(challengeId: string): Promise<ChallengeParticipant[]> {
  if (!supabase) return []
  const { data } = await supabase
    .from('challenge_participants')
    .select('*')
    .eq('challenge_id', challengeId)
    .order('progress', { ascending: false })
  return (data as ChallengeParticipant[]) || []
}

/** Sum of a member's completed-session distance (meters) within a window. */
export async function computeProgressMeters(
  walletId: string,
  startsAt: string,
  endsAt: string | null
): Promise<number> {
  if (!supabase) return 0
  let q = supabase
    .from('sessions')
    .select('actual_distance, started_at')
    .eq('wallet_address', walletId)
    .gte('started_at', startsAt)
  if (endsAt) q = q.lte('started_at', endsAt)
  const { data } = await q
  if (!data) return 0
  return (data as { actual_distance: number | null }[]).reduce((sum, s) => sum + (s.actual_distance || 0), 0)
}

export interface CreateChallengeInput {
  creatorId: string
  title: string
  description?: string
  activity: Activity
  goalKm: number
  durationDays: number
  coverFile?: File | null
}

export async function createChallenge(input: CreateChallengeInput): Promise<Challenge | null> {
  if (!supabase) return null

  let coverUrl: string | null = null
  if (input.coverFile) {
    try {
      const ext = input.coverFile.name.split('.').pop() || 'png'
      const path = `${input.creatorId}/${crypto.randomUUID()}.${ext}`
      const { error: upErr } = await supabase.storage
        .from('challenge-covers')
        .upload(path, input.coverFile, { upsert: true, contentType: input.coverFile.type })
      if (upErr) console.error('Cover upload failed:', upErr)
      else coverUrl = supabase.storage.from('challenge-covers').getPublicUrl(path).data.publicUrl
    } catch (e) {
      console.error('Cover upload error:', e)
    }
  }

  const endsAt = new Date(Date.now() + input.durationDays * 86_400_000).toISOString()
  const { data, error } = await supabase
    .from('challenges')
    .insert({
      creator_wallet: input.creatorId,
      title: input.title,
      description: input.description || null,
      activity: input.activity,
      goal_value: Math.round(input.goalKm * 1000),
      ends_at: endsAt,
      cover_url: coverUrl,
      status: 'active',
    })
    .select('*')
    .single()

  if (error) {
    console.error('createChallenge failed:', error)
    return null
  }

  // Auto-join the creator.
  await joinChallenge(data.id, input.creatorId)
  return data as Challenge
}

export async function joinChallenge(challengeId: string, walletId: string): Promise<boolean> {
  if (!supabase) return false
  const { error } = await supabase
    .from('challenge_participants')
    .upsert({ challenge_id: challengeId, wallet_address: walletId }, { onConflict: 'challenge_id,wallet_address' })
  if (error) {
    console.error('joinChallenge failed:', error)
    return false
  }
  return true
}

/** Refresh a participant's cached progress and auto-mark complete if goal met. */
export async function syncParticipantProgress(
  challenge: Challenge,
  walletId: string
): Promise<{ progress: number; completed: boolean }> {
  const progress = await computeProgressMeters(walletId, challenge.starts_at, challenge.ends_at)
  const completed = progress >= challenge.goal_value
  if (supabase) {
    await supabase
      .from('challenge_participants')
      .update({ progress, completed_at: completed ? new Date().toISOString() : null })
      .eq('challenge_id', challenge.id)
      .eq('wallet_address', walletId)
  }
  return { progress, completed }
}

/** Creator action: close the challenge for everyone. */
export async function closeChallenge(id: string): Promise<boolean> {
  if (!supabase) return false
  const { error } = await supabase.from('challenges').update({ status: 'completed' }).eq('id', id)
  if (error) {
    console.error('closeChallenge failed:', error)
    return false
  }
  return true
}
