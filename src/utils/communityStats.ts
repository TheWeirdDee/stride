import { supabase } from '@/utils/supabase'

// Real community aggregates from Supabase (commitments / sessions / users).
// Supabase has no server-side SUM without RPC, so small result sets are summed
// client-side. Each function returns null/[] when the DB is unreachable so the
// UI can fall back to placeholders.

export interface NetworkStats {
  weeklyKm: number
  completions: number
  activeCities: number
  members: number
}

export interface CityRow {
  name: string
  km: number
  users: number
}

export interface MoverRow {
  wallet: string
  km: number
  streak: number
}

export interface FinishRow {
  wallet: string
  km: number
  reward: number
  date: string
}

export async function fetchNetworkStats(): Promise<NetworkStats | null> {
  if (!supabase) return null
  try {
    const { count: completions } = await supabase
      .from('commitments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')

    const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString()
    const { data: sess } = await supabase
      .from('sessions')
      .select('actual_distance')
      .gte('started_at', weekAgo)
    const weeklyKm = (sess || []).reduce((s, r) => s + (Number(r.actual_distance) || 0), 0) / 1000

    const { data: users } = await supabase.from('users').select('city')
    const cities = new Set((users || []).map((u) => u.city).filter((c) => c && c !== 'Unknown'))

    return { weeklyKm, completions: completions || 0, activeCities: cities.size, members: users?.length || 0 }
  } catch {
    return null
  }
}

export async function fetchCityLeaderboard(): Promise<CityRow[]> {
  if (!supabase) return []
  const { data: users } = await supabase.from('users').select('city, total_distance')
  const map = new Map<string, { km: number; users: number }>()
  for (const u of users || []) {
    const c = u.city && u.city !== 'Unknown' ? (u.city as string) : null
    if (!c) continue
    const cur = map.get(c) || { km: 0, users: 0 }
    cur.km += (Number(u.total_distance) || 0) / 1000
    cur.users += 1
    map.set(c, cur)
  }
  return [...map.entries()]
    .map(([name, v]) => ({ name, km: Math.round(v.km), users: v.users }))
    .sort((a, b) => b.km - a.km)
    .slice(0, 5)
}

export async function fetchTopMovers(): Promise<MoverRow[]> {
  if (!supabase) return []
  const { data } = await supabase
    .from('users')
    .select('wallet_address, total_distance, streak_current')
    .order('total_distance', { ascending: false })
    .limit(5)
  return (data || []).map((u) => ({
    wallet: u.wallet_address as string,
    km: (Number(u.total_distance) || 0) / 1000,
    streak: Number(u.streak_current) || 0,
  }))
}

export async function fetchRecentFinishes(): Promise<FinishRow[]> {
  if (!supabase) return []
  const { data } = await supabase
    .from('commitments')
    .select('wallet_address, goal_value, bonus_earned, completed_at, created_at')
    .eq('status', 'completed')
    .order('completed_at', { ascending: false, nullsFirst: false })
    .limit(8)
  return (data || []).map((c) => ({
    wallet: c.wallet_address as string,
    km: (Number(c.goal_value) || 0) / 1000,
    reward: Number(c.bonus_earned) || 0,
    date: (c.completed_at || c.created_at) as string,
  }))
}
