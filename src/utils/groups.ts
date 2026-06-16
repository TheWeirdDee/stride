import { supabase } from '@/utils/supabase'
import type { Activity } from '@/utils/challenges'

export type { Activity }

export interface Group {
  id: string
  creator_wallet: string
  name: string
  description: string | null
  activity: Activity
  city: string | null
  cover_url: string | null
  created_at: string
}

export interface GroupMember {
  id: string
  group_id: string
  wallet_address: string
  joined_at: string
}

export async function fetchGroups(activity?: Activity): Promise<Group[]> {
  if (!supabase) return []
  let q = supabase.from('groups').select('*').order('created_at', { ascending: false })
  if (activity) q = q.eq('activity', activity)
  const { data, error } = await q
  if (error) {
    console.warn('[groups] not reachable yet:', error.message || error.code || 'unknown', '— run supabase/schema.sql.')
    return []
  }
  return (data as Group[]) || []
}

export async function fetchGroup(id: string): Promise<Group | null> {
  if (!supabase) return null
  const { data } = await supabase.from('groups').select('*').eq('id', id).maybeSingle()
  return (data as Group) || null
}

export async function fetchMembers(groupId: string): Promise<GroupMember[]> {
  if (!supabase) return []
  const { data } = await supabase
    .from('group_members')
    .select('*')
    .eq('group_id', groupId)
    .order('joined_at', { ascending: true })
  return (data as GroupMember[]) || []
}

export async function memberCount(groupId: string): Promise<number> {
  if (!supabase) return 0
  const { count } = await supabase
    .from('group_members')
    .select('*', { count: 'exact', head: true })
    .eq('group_id', groupId)
  return count || 0
}

export interface CreateGroupInput {
  creatorId: string
  name: string
  description?: string
  activity: Activity
  city?: string
  coverFile?: File | null
}

export async function createGroup(input: CreateGroupInput): Promise<Group | null> {
  if (!supabase) return null

  let coverUrl: string | null = null
  if (input.coverFile) {
    try {
      const ext = input.coverFile.name.split('.').pop() || 'png'
      const path = `groups/${input.creatorId}/${crypto.randomUUID()}.${ext}`
      const { error: upErr } = await supabase.storage
        .from('challenge-covers')
        .upload(path, input.coverFile, { upsert: true, contentType: input.coverFile.type })
      if (upErr) console.error('Group cover upload failed:', upErr)
      else coverUrl = supabase.storage.from('challenge-covers').getPublicUrl(path).data.publicUrl
    } catch (e) {
      console.error('Group cover upload error:', e)
    }
  }

  const { data, error } = await supabase
    .from('groups')
    .insert({
      creator_wallet: input.creatorId,
      name: input.name,
      description: input.description || null,
      activity: input.activity,
      city: input.city || null,
      cover_url: coverUrl,
    })
    .select('*')
    .single()

  if (error) {
    console.error('createGroup failed:', error.message || error)
    return null
  }

  await joinGroup(data.id, input.creatorId)
  return data as Group
}

export async function joinGroup(groupId: string, walletId: string): Promise<boolean> {
  if (!supabase) return false
  const { error } = await supabase
    .from('group_members')
    .upsert({ group_id: groupId, wallet_address: walletId }, { onConflict: 'group_id,wallet_address' })
  if (error) {
    console.error('joinGroup failed:', error.message || error)
    return false
  }
  return true
}

export async function leaveGroup(groupId: string, walletId: string): Promise<boolean> {
  if (!supabase) return false
  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('wallet_address', walletId)
  return !error
}

export async function deleteGroup(id: string): Promise<boolean> {
  if (!supabase) return false
  const { error } = await supabase.from('groups').delete().eq('id', id)
  return !error
}
