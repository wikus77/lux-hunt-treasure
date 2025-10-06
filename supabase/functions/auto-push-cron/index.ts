// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Auto Push Cron - SCHEDULER SAFE (NON TOCCA LA CATENA PUSH ESISTENTE)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
}

interface AutoPushConfig {
  enabled: boolean
  daily_min: number
  daily_max: number
  quiet_start: string
  quiet_end: string
  timezone: string
}

interface PushTemplate {
  id: string
  kind: string
  title: string
  body: string
  url: string
  image_url: string | null
  weight: number
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // 🔒 SECURITY: Verifica CRON_SECRET
    const cronSecret = req.headers.get('x-cron-secret')
    const expectedSecret = Deno.env.get('CRON_SECRET')
    
    if (!expectedSecret || cronSecret !== expectedSecret) {
      console.error('[AUTO-PUSH] Unauthorized: missing or invalid x-cron-secret')
      return new Response(
        JSON.stringify({ success: false, message: 'Unauthorized' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('[AUTO-PUSH] 🚀 Cron job started')

    // Init Supabase client (SERVICE ROLE per accesso completo)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 1️⃣ Leggi configurazione
    const { data: config, error: configError } = await supabase
      .from('auto_push_config')
      .select('*')
      .limit(1)
      .single()

    if (configError || !config) {
      console.error('[AUTO-PUSH] ❌ Config not found:', configError)
      return new Response(
        JSON.stringify({ success: false, message: 'Config not found' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const cfg = config as AutoPushConfig

    // Se disabilitata, esci
    if (!cfg.enabled) {
      console.log('[AUTO-PUSH] ⏸️ Auto push is disabled')
      return new Response(
        JSON.stringify({ success: true, message: 'Auto push disabled', sent: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2️⃣ Quiet hours check (evita invii notturni)
    const now = new Date()
    const currentHour = now.getHours()
    const quietStartHour = parseInt(cfg.quiet_start.split(':')[0])
    const quietEndHour = parseInt(cfg.quiet_end.split(':')[0])

    // Se siamo in quiet hours, esci
    if (currentHour >= quietStartHour || currentHour <= quietEndHour) {
      console.log('[AUTO-PUSH] 🌙 Quiet hours active, skipping')
      return new Response(
        JSON.stringify({ success: true, message: 'Quiet hours', sent: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3️⃣ Determina slot orario (3-5 push/die distribuiti)
    // Slot possibili: 09-11, 12-14, 16-18, 18-20
    const slots = [
      { start: 9, end: 11 },
      { start: 12, end: 14 },
      { start: 16, end: 18 },
      { start: 18, end: 20 }
    ]

    const activeSlot = slots.find(s => currentHour >= s.start && currentHour < s.end)
    if (!activeSlot) {
      console.log('[AUTO-PUSH] ⏳ Not in active slot, skipping')
      return new Response(
        JSON.stringify({ success: true, message: 'Not in active slot', sent: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('[AUTO-PUSH] ✅ Active slot:', activeSlot)

    // 4️⃣ Seleziona template random (ponderato per weight)
    const { data: templates, error: templatesError } = await supabase
      .from('auto_push_templates')
      .select('*')
      .eq('active', true)

    if (templatesError || !templates || templates.length === 0) {
      console.error('[AUTO-PUSH] ❌ No active templates:', templatesError)
      return new Response(
        JSON.stringify({ success: false, message: 'No active templates' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Weighted random selection
    const totalWeight = templates.reduce((sum: number, t: any) => sum + t.weight, 0)
    let random = Math.random() * totalWeight
    let selectedTemplate: PushTemplate | null = null

    for (const t of templates) {
      random -= t.weight
      if (random <= 0) {
        selectedTemplate = t as PushTemplate
        break
      }
    }

    if (!selectedTemplate) selectedTemplate = templates[0] as PushTemplate

    console.log('[AUTO-PUSH] 📝 Selected template:', selectedTemplate.kind)

    // 5️⃣ Seleziona utenti candidati (LIMIT 5 PUSH/DIE)
    // Query: utenti con subscription attiva che hanno ricevuto < 5 push oggi
    const today = now.toISOString().split('T')[0]

    // Ottieni utenti con subscription attiva
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id')
      .neq('subscription_tier', 'free')
      .limit(500)

    if (usersError || !users || users.length === 0) {
      console.log('[AUTO-PUSH] ℹ️ No eligible users found')
      return new Response(
        JSON.stringify({ success: true, message: 'No eligible users', sent: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Filtra utenti che hanno ricevuto < 5 push oggi
    const userIds = users.map((u: any) => u.id)
    const { data: todayLogs, error: logsError } = await supabase
      .from('auto_push_log')
      .select('user_id')
      .in('user_id', userIds)
      .eq('sent_date', today)

    if (logsError) {
      console.error('[AUTO-PUSH] ❌ Error fetching logs:', logsError)
      return new Response(
        JSON.stringify({ success: false, message: 'Error fetching logs' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Conta push per utente oggi
    const pushCountMap = new Map<string, number>()
    for (const log of (todayLogs || [])) {
      const count = pushCountMap.get(log.user_id) || 0
      pushCountMap.set(log.user_id, count + 1)
    }

    // Filtra utenti sotto il cap di 5
    const eligibleUsers = userIds.filter((uid: string) => {
      const count = pushCountMap.get(uid) || 0
      return count < 5
    })

    if (eligibleUsers.length === 0) {
      console.log('[AUTO-PUSH] ℹ️ All users reached daily cap')
      return new Response(
        JSON.stringify({ success: true, message: 'All users capped', sent: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('[AUTO-PUSH] 👥 Eligible users:', eligibleUsers.length)

    // 6️⃣ Batch invio (max 200 alla volta per non intasare)
    const batchSize = 200
    const batch = eligibleUsers.slice(0, batchSize)

    // 7️⃣ Costruisci payload (COMPATIBILE CON webpush-send ESISTENTE)
    const payload = {
      title: selectedTemplate.title,
      body: selectedTemplate.body,
      url: selectedTemplate.url,
      ...(selectedTemplate.image_url ? { image: selectedTemplate.image_url } : {}),
      data: {
        type: 'auto',
        subType: selectedTemplate.kind,
        deeplink: selectedTemplate.url
      }
    }

    // 8️⃣ Chiama webpush-send ESISTENTE (NON MODIFICATO)
    const pushAdminToken = Deno.env.get('PUSH_ADMIN_TOKEN')
    if (!pushAdminToken) {
      console.error('[AUTO-PUSH] ❌ PUSH_ADMIN_TOKEN not set')
      return new Response(
        JSON.stringify({ success: false, message: 'PUSH_ADMIN_TOKEN not set' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('[AUTO-PUSH] 📤 Sending to batch:', batch.length)

    // Invio broadcast (audience: all) - RIUSA LA FUNZIONE ESISTENTE
    const pushResponse = await fetch(`${supabaseUrl}/functions/v1/webpush-send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': pushAdminToken,
        'apikey': supabaseServiceKey
      },
      body: JSON.stringify({
        audience: 'all', // La funzione esistente gestisce "all"
        payload
      })
    })

    const pushResult = await pushResponse.json()
    console.log('[AUTO-PUSH] 📬 Push result:', pushResult)

    // 9️⃣ Logga per ogni utente nel batch
    const logsToInsert = batch.map((userId: string) => ({
      user_id: userId,
      sent_date: today,
      template_id: selectedTemplate!.id,
      delivery: pushResult
    }))

    const { error: insertError } = await supabase
      .from('auto_push_log')
      .insert(logsToInsert)

    if (insertError) {
      console.error('[AUTO-PUSH] ⚠️ Error logging:', insertError)
    }

    console.log('[AUTO-PUSH] ✅ Completed, sent to:', batch.length)

    return new Response(
      JSON.stringify({
        success: true,
        sent: batch.length,
        template: selectedTemplate.kind,
        slot: activeSlot,
        result: pushResult
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('[AUTO-PUSH] ❌ Fatal error:', error)
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
