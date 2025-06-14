
import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import type { Session } from '@supabase/supabase-js'

interface SessionInfo {
  hasSession: boolean
  userEmail?: string
  authState: string
  hasLocalStorage: boolean
}

export default function CompactLoginDebug() {
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    const logEntry = `${timestamp}: ${message}`
    console.log(`🧪 COMPACT DEBUG: ${logEntry}`)
    setLogs(prev => [...prev.slice(-4), logEntry]) // Keep only last 5 logs
  }

  const checkSession = async () => {
    try {
      addLog('Checking session...')
      
      const { data: sessionData, error } = await supabase.auth.getSession()
      
      if (error) {
        addLog(`❌ Session error: ${error.message}`)
        return
      }

      const session = sessionData.session
      const stored = localStorage.getItem('sb-vkjrqirvdvjbemsfzxof-auth-token')
      const hasToken = !!stored && stored.includes('access_token')

      const sessionInfo: SessionInfo = {
        hasSession: !!session,
        userEmail: session?.user?.email,
        authState: session ? 'AUTHENTICATED' : 'NOT_AUTHENTICATED',
        hasLocalStorage: hasToken
      }

      setSessionInfo(sessionInfo)

      if (session?.user) {
        addLog(`✅ Active: ${session.user.email}`)
      } else {
        addLog('❌ No session')
      }

    } catch (error: any) {
      addLog(`💥 Exception: ${error.message}`)
    }
  }

  const quickLogin = async () => {
    addLog('🧪 Quick developer login...')
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'wikus77@hotmail.it',
        password: 'Wikus190877!@#'
      })

      if (error) {
        addLog(`❌ Login failed: ${error.message}`)
      } else if (data.session) {
        addLog(`✅ Login success`)
        setTimeout(() => checkSession(), 1000)
      }
    } catch (error: any) {
      addLog(`💥 Login exception: ${error.message}`)
    }
  }

  const quickLogout = async () => {
    addLog('🚪 Quick logout...')
    
    try {
      await supabase.auth.signOut()
      localStorage.removeItem('sb-vkjrqirvdvjbemsfzxof-auth-token')
      addLog('✅ Logout complete')
      setTimeout(() => checkSession(), 1000)
    } catch (error: any) {
      addLog(`💥 Logout error: ${error.message}`)
    }
  }

  useEffect(() => {
    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      addLog(`🔄 Auth change: ${event}`)
      setTimeout(() => checkSession(), 500)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Only show in development or with debug param
  const isDevelopment = process.env.NODE_ENV === 'development'
  const hasDebugParam = new URLSearchParams(window.location.search).has('debug')
  
  if (!isDevelopment && !hasDebugParam) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-xs">
      <div className="bg-black/90 border border-green-500/50 rounded-lg p-3 text-xs font-mono">
        <div className="flex items-center justify-between mb-2">
          <span className="text-green-400 font-bold">🧪 COMPACT AUTH</span>
          <button 
            onClick={() => setLogs([])}
            className="text-gray-400 hover:text-white text-xs"
          >
            🗑️
          </button>
        </div>
        
        {sessionInfo && (
          <div className="mb-2 p-2 bg-gray-900/50 rounded">
            <div className={`font-bold ${sessionInfo.hasSession ? 'text-green-400' : 'text-red-400'}`}>
              {sessionInfo.authState}
            </div>
            {sessionInfo.userEmail && (
              <div className="text-cyan-300 truncate">📧 {sessionInfo.userEmail.split('@')[0]}</div>
            )}
            <div className={`text-xs ${sessionInfo.hasLocalStorage ? 'text-green-300' : 'text-red-300'}`}>
              💾 {sessionInfo.hasLocalStorage ? 'Token OK' : 'No Token'}
            </div>
          </div>
        )}

        <div className="space-y-1 mb-2 max-h-20 overflow-y-auto">
          {logs.map((log, index) => (
            <div key={index} className="text-green-300 break-words text-xs">
              {log.split(': ')[1]} {/* Show only message, not timestamp */}
            </div>
          ))}
        </div>

        <div className="flex gap-1">
          <button 
            onClick={checkSession}
            className="bg-blue-600 hover:bg-blue-700 px-1 py-1 rounded text-white text-xs"
          >
            ✓
          </button>
          <button 
            onClick={quickLogin}
            className="bg-green-600 hover:bg-green-700 px-1 py-1 rounded text-white text-xs"
          >
            🔑
          </button>
          <button 
            onClick={quickLogout}
            className="bg-red-600 hover:bg-red-700 px-1 py-1 rounded text-white text-xs"
          >
            🚪
          </button>
        </div>
      </div>
    </div>
  )
}
