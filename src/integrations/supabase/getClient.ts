import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Preferences } from '@capacitor/preferences'
import type { Database } from './types'

const SUPABASE_URL = 'https://vkjrqirvdvjbemsfzxof.supabase.co'
const SUPABASE_PUBLISHABLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

let cachedClient: SupabaseClient<Database> | null = null

export async function getSupabaseClient(): Promise<SupabaseClient<Database>> {
  if (cachedClient) return cachedClient

  const nativeStorage = {
    getItem: async (key: string) => {
      const { value } = await Preferences.get({ key })
      return value
    },
    setItem: async (key: string, value: string) => {
      await Preferences.set({ key, value })
    },
    removeItem: async (key: string) => {
      await Preferences.remove({ key })
    },
  }

  cachedClient = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: nativeStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'm1ssion_auth_session'
    }
  })

  return cachedClient
}
