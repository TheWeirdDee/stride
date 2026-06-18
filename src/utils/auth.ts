import { supabase } from './supabase'
import type { GuestProfile } from '@/components/landing/types'

export type Activity = 'walk' | 'run' | 'both'

export interface SignUpInput {
  username: string
  email: string
  password: string
  city: string
  activity: Activity
}

export interface AuthResult {
  ok: boolean
  needsConfirmation?: boolean
  error?: string
}

function setLocalIdentity(p: GuestProfile) {
  try { localStorage.setItem('stride_guest_profile', JSON.stringify(p)) } catch {}
}

// ── Uniqueness checks (backed by SECURITY DEFINER RPCs — see auth schema SQL) ──
// If the RPCs aren't installed yet we don't block signup; the DB's unique
// constraint is the real guard. These just give friendlier messages.
export async function usernameAvailable(username: string): Promise<boolean> {
  if (!supabase) return true
  const { data, error } = await supabase.rpc('username_available', { p_username: username.trim() })
  if (error) { console.warn('username_available RPC unavailable:', error.message); return true }
  return data !== false
}

export async function emailAvailable(email: string): Promise<boolean> {
  if (!supabase) return true
  const { data, error } = await supabase.rpc('email_available', { p_email: email.trim().toLowerCase() })
  if (error) { console.warn('email_available RPC unavailable:', error.message); return true }
  return data !== false
}

// ── Sign up ──
export async function signUpWithProfile(input: SignUpInput): Promise<AuthResult> {
  if (!supabase) return { ok: false, error: 'Accounts are not configured (Supabase missing).' }
  const username = input.username.trim()
  const email = input.email.trim().toLowerCase()

  if (!(await usernameAvailable(username))) return { ok: false, error: 'That username is already taken.' }
  if (!(await emailAvailable(email))) return { ok: false, error: 'An account with that email already exists. Try logging in.' }

  const { data, error } = await supabase.auth.signUp({
    email,
    password: input.password,
    options: { data: { username, city: input.city.trim(), activity: input.activity } },
  })
  if (error) {
    const msg = /already registered|already exists/i.test(error.message)
      ? 'An account with that email already exists. Try logging in.'
      : error.message
    return { ok: false, error: msg }
  }

  // Mirror the identity locally so the rest of the app (profile/settings/commitments)
  // recognises the user immediately — the DB profile row is created by a trigger.
  setLocalIdentity({
    id: data.user?.id || `guest_${username}`,
    nickname: username,
    email,
    city: input.city.trim(),
    activity: input.activity,
  })

  // No session means email confirmation is on — the user must verify first.
  if (!data.session) return { ok: true, needsConfirmation: true }
  return { ok: true }
}

// ── Log in (by username) ──
export async function loginWithUsername(username: string, password: string, remember: boolean): Promise<AuthResult> {
  if (!supabase) return { ok: false, error: 'Accounts are not configured (Supabase missing).' }

  const { data: email, error: lookupErr } = await supabase.rpc('email_for_username', { p_username: username.trim() })
  if (lookupErr) return { ok: false, error: 'Could not reach the login service. Try again.' }
  if (!email) return { ok: false, error: 'No account found with that username.' }

  const { data, error } = await supabase.auth.signInWithPassword({ email: email as string, password })
  if (error) return { ok: false, error: 'Incorrect username or password.' }

  let nickname = username.trim()
  let city = ''
  let activity: Activity = 'walk'
  try {
    const { data: prof } = await supabase
      .from('profiles')
      .select('username, city, activity')
      .eq('id', data.user!.id)
      .maybeSingle()
    if (prof) {
      nickname = prof.username || nickname
      city = prof.city || ''
      activity = (prof.activity as Activity) || 'walk'
    }
  } catch { /* non-fatal */ }

  setLocalIdentity({ id: data.user!.id, nickname, email: email as string, city, activity })
  applyRemember(remember)
  return { ok: true }
}

export async function logout() {
  try { await supabase?.auth.signOut() } catch {}
  try {
    localStorage.removeItem('stride_guest_profile')
    localStorage.removeItem('stride_ephemeral')
  } catch {}
}

// ── "Remember me" ──
// Supabase persists the session in localStorage by default. When the user opts
// OUT, we flag the session as ephemeral and drop it on the next browser launch.
export function applyRemember(remember: boolean) {
  try {
    if (remember) {
      localStorage.removeItem('stride_ephemeral')
    } else {
      localStorage.setItem('stride_ephemeral', '1')
      sessionStorage.setItem('stride_alive', '1')
    }
  } catch {}
}

// Called once on app startup: if a session was marked ephemeral and the browser
// has since been restarted (sessionStorage cleared), sign it out.
export async function enforceEphemeralSession() {
  if (!supabase) return
  try {
    if (localStorage.getItem('stride_ephemeral') !== '1') return
    if (sessionStorage.getItem('stride_alive') === '1') return
    await supabase.auth.signOut()
    localStorage.removeItem('stride_ephemeral')
    localStorage.removeItem('stride_guest_profile')
  } catch {}
}
