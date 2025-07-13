import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types'

const SUPABASE_URL = 'https://vkjrqirvdvjbemsfzxof.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk'

let cachedClient: SupabaseClient<Database> | null = null

export async function getSupabaseClient(): Promise<SupabaseClient<Database>> {
  if (cachedClient) return cachedClient

  cachedClient = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    }
  })

  return cachedClient
}
