import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/integrations/supabase/getClient"
import type { Session } from "@supabase/supabase-js"

export function useAuthSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true
    let retries = 0

    const init = async () => {
      const client = await getSupabaseClient()

      const { data: listener } = client.auth.onAuthStateChange((_event, newSession) => {
        if (!active) return
        setSession(newSession)
        setIsLoading(false)
      })

      const tryGet = async () => {
        const { data } = await client.auth.getSession()
        if (!active) return
        if (data.session) {
          setSession(data.session)
          setIsLoading(false)
        } else if (retries < 5) {
          retries++
          setTimeout(tryGet, retries * 300)
        } else {
          setIsLoading(false)
        }
      }

      tryGet()

      return () => {
        active = false
        listener?.subscription.unsubscribe()
      }
    }

    init()
  }, [])

  return { session, isLoading, user: session?.user }
}
