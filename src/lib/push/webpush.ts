// @ts-nocheck
// src/lib/push/webpush.ts
import { supabase } from '@/integrations/supabase/client'

export type WebPushSubscriptionPayload = {
  endpoint: string
  keys: { p256dh: string; auth: string }
}

export function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i)
  return outputArray
}

/**
 * Ritorna true se la subscription è di tipo Web Push (endpoint URL) e NON un FCM registration token.
 */
export function looksLikeWebPushEndpoint(value: string | null | undefined) {
  return !!value && value.startsWith('https://fcm.googleapis.com/fcm/send/')
}

/**
 * Effettua subscribe Web Push standard e salva in DB via RPC upsert_webpush_subscription.
 * Richiede:
 *  - serviceWorkerRegistration pronto
 *  - VAPID public key base64url (stringa che inizia con 'B...')
 */
export async function subscribeWebPushAndSave({
  userId,
  swReg,
  vapidPublicKey,
  platform = 'desktop',
}: {
  userId: string
  swReg: ServiceWorkerRegistration
  vapidPublicKey: string
  platform?: 'ios' | 'android' | 'desktop' | 'web' | 'unknown'
}) {
  const appServerKey = urlBase64ToUint8Array(vapidPublicKey)

  // Subscribe
  const sub = await swReg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: appServerKey as unknown as BufferSource,
  })

  const payload: WebPushSubscriptionPayload = {
    endpoint: sub.endpoint,
    keys: {
      p256dh: (sub.toJSON().keys?.p256dh as string) ?? '',
      auth: (sub.toJSON().keys?.auth as string) ?? '',
    },
  }

  if (!payload.endpoint || !payload.keys.p256dh || !payload.keys.auth) {
    throw new Error('Invalid Web Push subscription: missing endpoint/keys')
  }

  // Save to webpush_subscriptions table
  const { data, error } = await supabase
    .from('webpush_subscriptions')
    .upsert({
      user_id: userId,
      endpoint: payload.endpoint,
      keys: payload.keys,
      device_info: { platform },
      is_active: true,
      last_used_at: new Date().toISOString()
    }, {
      onConflict: 'endpoint'
    })
    .select()
    .single()

  if (error) throw error

  return { subscription: payload, db: data }
}

export function toDisplayableWebPush(sub?: WebPushSubscriptionPayload | null) {
  if (!sub) return { endpointPrefix: 'N/A', p256dhShort: '', authShort: '' }
  const endpointPrefix = sub.endpoint.slice(0, 36) + '...'
  const p256dhShort = sub.keys.p256dh.slice(0, 8) + '…'
  const authShort = sub.keys.auth.slice(0, 8) + '…'
  return { endpointPrefix, p256dhShort, authShort }
}