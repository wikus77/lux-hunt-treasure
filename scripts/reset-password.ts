
// reset-password.ts - Script per reset password developer
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://vkjrqirvdvjbemsfzxof.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY non trovata nelle variabili d\'ambiente')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function resetDeveloperPassword() {
  console.log('🔧 RESET PASSWORD DEVELOPER - INIZIO')
  console.log('📧 Email: wikus77@hotmail.it')
  console.log('🔐 Nuova password: Wikus190877!@#')
  
  try {
    // Prima trova l'utente per ottenere l'ID
    const { data: users, error: fetchError } = await supabase.rpc('get_user_by_email', {
      email_param: 'wikus77@hotmail.it'
    })

    if (fetchError) {
      console.error('❌ Errore nel trovare l\'utente:', fetchError)
      return
    }

    if (!users || users.length === 0) {
      console.error('❌ Utente wikus77@hotmail.it non trovato nel database')
      return
    }

    const userId = users[0].id
    console.log('👤 ID Utente trovato:', userId)

    // Reset della password
    const { data, error } = await supabase.auth.admin.updateUserById(userId, {
      password: 'Wikus190877!@#'
    })

    if (error) {
      console.error('❌ Errore reset password:', error.message)
      console.error('📊 Dettagli errore:', error)
    } else {
      console.log('✅ PASSWORD AGGIORNATA CON SUCCESSO')
      console.log('📧 Email utente:', data.user?.email)
      console.log('🆔 ID utente:', data.user?.id)
      console.log('🔄 Password hash aggiornato in Supabase')
      
      // Verifica che l'utente sia confermato
      if (data.user?.email_confirmed_at) {
        console.log('✅ Email già confermata:', data.user.email_confirmed_at)
      } else {
        console.log('⚠️ Email non confermata, confermando...')
        const { error: confirmError } = await supabase.auth.admin.updateUserById(userId, {
          email_confirm: true
        })
        
        if (confirmError) {
          console.error('❌ Errore conferma email:', confirmError)
        } else {
          console.log('✅ Email confermata con successo')
        }
      }
    }
  } catch (error: any) {
    console.error('💥 ECCEZIONE durante reset password:', error.message)
    console.error('📊 Stack trace:', error.stack)
  }
}

async function verifyDeveloperRole() {
  console.log('🔍 VERIFICA RUOLO DEVELOPER')
  
  try {
    const { data: users } = await supabase.rpc('get_user_by_email', {
      email_param: 'wikus77@hotmail.it'
    })

    if (users && users.length > 0) {
      const userId = users[0].id
      
      // Verifica ruolo developer
      const { data: roles, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)

      if (roleError) {
        console.error('❌ Errore verifica ruoli:', roleError)
      } else if (roles && roles.length > 0) {
        console.log('👨‍💻 Ruoli utente:', roles.map(r => r.role))
        
        if (roles.some(r => r.role === 'developer')) {
          console.log('✅ Ruolo DEVELOPER confermato')
        } else {
          console.log('⚠️ Ruolo DEVELOPER mancante, aggiungendo...')
          
          const { error: insertError } = await supabase
            .from('user_roles')
            .insert({ user_id: userId, role: 'developer' })

          if (insertError && !insertError.message.includes('duplicate')) {
            console.error('❌ Errore aggiunta ruolo:', insertError)
          } else {
            console.log('✅ Ruolo DEVELOPER aggiunto con successo')
          }
        }
      } else {
        console.log('⚠️ Nessun ruolo trovato, aggiungendo DEVELOPER...')
        
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: 'developer' })

        if (insertError) {
          console.error('❌ Errore aggiunta ruolo:', insertError)
        } else {
          console.log('✅ Ruolo DEVELOPER aggiunto con successo')
        }
      }
    }
  } catch (error: any) {
    console.error('💥 ECCEZIONE durante verifica ruolo:', error)
  }
}

async function main() {
  console.log('🚀 SCRIPT RESET DEVELOPER - START')
  console.log('📅 Data:', new Date().toISOString())
  console.log('🌐 Supabase URL:', SUPABASE_URL)
  
  await resetDeveloperPassword()
  await verifyDeveloperRole()
  
  console.log('🏁 SCRIPT COMPLETATO')
  console.log('🧪 Ora testa il login con:')
  console.log('📧 Email: wikus77@hotmail.it')
  console.log('🔐 Password: Wikus190877!@#')
}

main().catch(console.error)
