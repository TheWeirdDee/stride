export const COMMITMENT_CONTRACT = process.env.NEXT_PUBLIC_COMMITMENT_CONTRACT as `0x${string}`
export const REWARD_POOL_CONTRACT = process.env.NEXT_PUBLIC_REWARD_POOL_CONTRACT as `0x${string}`
export const CUSD_ADDRESS = (process.env.NEXT_PUBLIC_CUSD_ADDRESS || '0x765DE816845861e75A25fCA122bb6898B8B1282a') as `0x${string}`

export const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 42220)
export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://forno.celo.org'

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Stride'
export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? ''

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

export const MIN_STAKE_CUSD = 0.01
export const GRACE_PERIOD_SECONDS = 60

