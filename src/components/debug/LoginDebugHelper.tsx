
// LoginDebugHelper.tsx - Componente per debug sessione live
import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import type { Session, User } from '@supabase/supabase-js'

interface SessionDebugInfo {
  hasSession: boolean
  userEmail?: string
  userId?: string
  accessToken?: string
  refreshToken?: string
  expiresAt?: number
  isExpired?: boolean
  authState: string
}

export default function LoginDebugHelper() {
  const [debugInfo, setDebugInfo] = useState<SessionDebugInfo | null>(null)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    const logEntry = `${timestamp}: ${message}`
    console.log(`🧪 SESSION DEBUG: ${logEntry}`)
    setLogs(prev => [...prev.slice(-9), logEntry]) // Mantieni solo gli ultimi 10 log
  }

  const checkSession = async () => {
    try {
      addLog('Controllo sessione Supabase...')
      
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        addLog(`❌ Errore getSession: ${sessionError.message}`)
        return
      }

      const session = sessionData.session
      const user = session?.user

      const debugInfo: SessionDebugInfo = {
        hasSession: !!session,
        userEmail: user?.email,
        userId: user?.id,
        accessToken: session?.access_token ? `${session.access_token.substring(0, 20)}...` : undefined,
        refreshToken: session?.refresh_token ? `${session.refresh_token.substring(0, 20)}...` : undefined,
        expiresAt: session?.expires_at,
        isExpired: session?.expires_at ? Date.now() / 1000 > session.expires_at : undefined,
        authState: session ? 'AUTHENTICATED' : 'NOT_AUTHENTICATED'
      }

      setDebugInfo(debugInfo)

      if (session && user) {
        addLog(`✅ Sessione attiva per: ${user.email}`)
        addLog(`🆔 User ID: ${user.id}`)
        addLog(`⏰ Scade: ${session.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : 'N/A'}`)
        
        if (debugInfo.isExpired) {
          addLog('⚠️ Token SCADUTO - refresh necessario')
        }
      } else {
        addLog('❌ Nessuna sessione attiva')
      }

      // Verifica localStorage
      const storedSession = localStorage.getItem('sb-vkjrqirvdvjbemsfzxof-auth-token')
      if (storedSession) {
        try {
          const parsed = JSON.parse(storedSession)
          addLog(`💾 Token localStorage: presente (${parsed.access_token ? 'con access_token' : 'senza access_token'})`)
        } catch {
          addLog('💾 Token localStorage: formato non valido')
        }
      } else {
        addLog('💾 Token localStorage: assente')
      }

    } catch (error: any) {
      addLog(`💥 Eccezione checkSession: ${error.message}`)
    }
  }

  const testDeveloperLogin = async () => {
    addLog('🧪 TEST LOGIN DEVELOPER...')
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'wikus77@hotmail.it',
        password: 'Wikus190877!@#'
      })

      if (error) {
        addLog(`❌ Login fallito: ${error.message}`)
      } else if (data.session) {
        addLog(`✅ Login riuscito: ${data.user?.email}`)
        addLog(`🔑 Token ricevuto: ${data.session.access_token.substring(0, 20)}...`)
        
        // Forza aggiornamento debug info
        setTimeout(() => checkSession(), 1000)
      } else {
        addLog('⚠️ Login completato ma senza sessione')
      }
    } catch (error: any) {
      addLog(`💥 Eccezione login: ${error.message}`)
    }
  }

  const forceLogout = async () => {
    addLog('🚪 LOGOUT FORZATO...')
    
    try {
      await supabase.auth.signOut()
      localStorage.removeItem('sb-vkjrqirvdvjbemsfzxof-auth-token')
      addLog('✅ Logout completato')
      
      setTimeout(() => checkSession(), 1000)
    } catch (error: any) {
      addLog(`💥 Errore logout: ${error.message}`)
    }
  }

  useEffect(() => {
    checkSession()

    // Listener per cambiamenti di stato auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      addLog(`🔄 Auth state change: ${event}`)
      if (session?.user) {
        addLog(`👤 User: ${session.user.email}`)
      }
      
      setTimeout(() => checkSession(), 500)
    })

    // Controllo periodico ogni 30 secondi
    const interval = setInterval(checkSession, 30000)

    return () => {
      subscription.unsubscribe()
      clearInterval(interval)
    }
  }, [])

  // Renderizza solo in modalità debug (se in development o se presente parametro URL)
  const isDevelopment = process.env.NODE_ENV === 'development'
  const hasDebugParam = new URLSearchParams(window.location.search).has('debug')
  
  if (!isDevelopment && !hasDebugParam) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-black/90 border border-green-500/50 rounded-lg p-4 text-xs font-mono">
        <div className="flex items-center justify-between mb-2">
          <span className="text-green-400 font-bold">🧪 SESSION DEBUG</span>
          <button 
            onClick={() => setLogs([])}
            className="text-gray-400 hover:text-white"
          >
            🗑️
          </button>
        </div>
        
        {debugInfo && (
          <div className="mb-3 p-2 bg-gray-900/50 rounded">
            <div className={`font-bold ${debugInfo.hasSession ? 'text-green-400' : 'text-red-400'}`}>
              {debugInfo.authState}
            </div>
            {debugInfo.userEmail && (
              <div className="text-cyan-300">📧 {debugInfo.userEmail}</div>
            )}
            {debugInfo.isExpired && (
              <div className="text-yellow-400">⚠️ TOKEN SCADUTO</div>
            )}
          </div>
        )}

        <div className="space-y-1 mb-3 max-h-32 overflow-y-auto">
          {logs.map((log, index) => (
            <div key={index} className="text-green-300 break-words">
              {log}
            </div>
          ))}
        </div>

        <div className="flex gap-1">
          <button 
            onClick={checkSession}
            className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-white text-xs"
          >
            🔍 Check
          </button>
          <button 
            onClick={testDeveloperLogin}
            className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-white text-xs"
          >
            🔑 Login
          </button>
          <button 
            onClick={forceLogout}
            className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-white text-xs"
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </div>
  )
}
