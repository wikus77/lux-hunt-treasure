// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
// Chat Push Notify - V8 NATIVE PUSH SUPPORT
// Invia a ENTRAMBI: webpush_subscriptions (PWA) + push_tokens (iOS/Android native)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import webpush from "npm:web-push@3.6.7";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============================================================================
// 🆕 NATIVE PUSH HELPER - Chiama send-native-push per iOS/Android
// ============================================================================
async function sendNativePushToUser(
  userId: string,
  title: string,
  body: string,
  data: Record<string, any>
): Promise<{ sent: number; failed: number }> {
  const ADMIN_PUSH_SECRET = Deno.env.get("ADMIN_PUSH_SECRET");
  const SB_URL = Deno.env.get("SUPABASE_URL");
  
  if (!ADMIN_PUSH_SECRET || !SB_URL) {
    console.log(`[CHAT-PUSH] ⚠️ Native push skipped: missing ADMIN_PUSH_SECRET or SUPABASE_URL`);
    return { sent: 0, failed: 0 };
  }

  try {
    const response = await fetch(`${SB_URL}/functions/v1/send-native-push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-secret': ADMIN_PUSH_SECRET,
      },
      body: JSON.stringify({
        title,
        body,
        data,
        targetUserId: userId,
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log(`[CHAT-PUSH] 📱 Native sent to ${userId.slice(0,8)}...: ${result.sent} sent`);
      return { sent: result.sent || 0, failed: result.failed || 0 };
    } else {
      console.log(`[CHAT-PUSH] ⚠️ Native failed for ${userId.slice(0,8)}...: ${result.error}`);
      return { sent: 0, failed: 1 };
    }
  } catch (error: any) {
    console.error(`[CHAT-PUSH] ❌ Native error for ${userId.slice(0,8)}...:`, error.message);
    return { sent: 0, failed: 1 };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const srk = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(url, srk);
    
    const body = await req.json();
    const { conversation_id, sender_id, message_preview } = body;
    
    if (!conversation_id || !sender_id) {
      console.log("[CHAT-PUSH] Missing params, skipping");
      return new Response(JSON.stringify({ ok: true, skipped: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[CHAT-PUSH] Processing:", { conversation_id, sender_id });

    // Get conversation
    const { data: conv } = await supabase
      .from("chat_conversations")
      .select("type, name")
      .eq("id", conversation_id)
      .single();

    // Get sender
    const { data: sender } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", sender_id)
      .single();

    const senderName = sender?.username || "Agente";

    // Get members
    const { data: members } = await supabase
      .from("chat_members")
      .select("user_id, muted")
      .eq("conversation_id", conversation_id);

    const isSelfChat = members?.length === 1;
    const recipientIds = members
      ?.filter(m => !m.muted && (isSelfChat || m.user_id !== sender_id))
      .map(m => m.user_id) || [];

    console.log("[CHAT-PUSH] Recipients:", recipientIds.length, "isSelfChat:", isSelfChat);

    if (recipientIds.length === 0) {
      return new Response(JSON.stringify({ ok: true, sent: 0, reason: "no_recipients" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const title = conv?.type === "group" 
      ? `💬 ${conv.name || "Gruppo"}` 
      : `💬 ${senderName}`;
    const bodyText = message_preview || "Nuovo messaggio";

    // VAPID setup
    const vapidContact = Deno.env.get("VAPID_CONTACT");
    const vapidPublic = Deno.env.get("VAPID_PUBLIC_KEY");
    const vapidPrivate = Deno.env.get("VAPID_PRIVATE_KEY");

    if (!vapidContact || !vapidPublic || !vapidPrivate) {
      console.error("[CHAT-PUSH] VAPID keys not configured!");
      return new Response(JSON.stringify({ ok: false, error: "VAPID not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    webpush.setVapidDetails(vapidContact, vapidPublic, vapidPrivate);

    // Get subscriptions from webpush_subscriptions (same as webpush-send)
    const { data: subs, error: subsError } = await supabase
      .from("webpush_subscriptions")
      .select("user_id, endpoint, keys")
      .in("user_id", recipientIds)
      .eq("is_active", true);

    if (subsError) {
      console.error("[CHAT-PUSH] DB error:", subsError);
      return new Response(JSON.stringify({ ok: false, error: subsError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[CHAT-PUSH] WebPush subs found:", subs?.length || 0);

    const payload = JSON.stringify({
      title,
      body: bodyText,
      url: `/notifications?chat=${conversation_id}`,
      icon: "/icon-512.png",
      badge: "/icon-192.png",
      tag: `chat_${conversation_id}`,
      renotify: true,
      data: {
        conversation_id,
        type: 'chat_message'
      }
    });

    let webpushSent = 0;
    let webpushFailed = 0;

    // ════════════════════════════════════════════════════════════════════
    // STEP 0: Check which users have native tokens (to avoid duplicates!)
    // ════════════════════════════════════════════════════════════════════
    const { data: nativeTokens } = await supabase
      .from("push_tokens")
      .select("user_id")
      .in("user_id", recipientIds)
      .eq("is_active", true);
    
    const usersWithNativeToken = new Set((nativeTokens || []).map(t => t.user_id));
    console.log(`[CHAT-PUSH] Users with native tokens: ${usersWithNativeToken.size}/${recipientIds.length}`);

    // ════════════════════════════════════════════════════════════════════
    // STEP 1: Send WebPush (PWA) - ONLY to users WITHOUT native token
    // ════════════════════════════════════════════════════════════════════
    for (const s of subs || []) {
      // Skip if user has native token (they'll get native push instead)
      if (usersWithNativeToken.has(s.user_id)) {
        console.log(`[CHAT-PUSH] ⏭️ Skipping webpush for ${s.user_id} (has native token)`);
        continue;
      }
      
      try {
        // Costruisci oggetto subscription corretto per webpush
        const subscription = {
          endpoint: s.endpoint,
          keys: {
            p256dh: s.keys?.p256dh || s.keys?.['p256dh'],
            auth: s.keys?.auth || s.keys?.['auth']
          }
        };
        
        if (!subscription.endpoint || !subscription.keys.p256dh || !subscription.keys.auth) {
          console.warn("[CHAT-PUSH] ⚠️ Invalid subscription for:", s.user_id);
          continue;
        }
        
        await webpush.sendNotification(subscription, payload);
        webpushSent++;
        console.log("[CHAT-PUSH] ✅ WebPush sent to:", s.user_id);
      } catch (e: any) {
        webpushFailed++;
        console.error("[CHAT-PUSH] ❌ WebPush error:", e?.statusCode || e?.message || e);
        // Cleanup expired subscriptions (410 = expired)
        if (e?.statusCode === 410) {
          await supabase
            .from("webpush_subscriptions")
            .update({ is_active: false })
            .eq("endpoint", s.endpoint);
        }
      }
    }

    // ════════════════════════════════════════════════════════════════════
    // STEP 2: Send Native Push (iOS/Android) - ONLY to users WITH native token
    // ════════════════════════════════════════════════════════════════════
    let nativeSent = 0;
    let nativeFailed = 0;
    
    // Send to each recipient that has a native token
    for (const userId of recipientIds) {
      // Only send native if user has native token
      if (!usersWithNativeToken.has(userId)) {
        continue;
      }
      
      const nativeResult = await sendNativePushToUser(
        userId,
        title,
        bodyText,
        {
          conversation_id,
          type: 'chat_message',
          route: `/notifications?chat=${conversation_id}`
        }
      );
      nativeSent += nativeResult.sent;
      nativeFailed += nativeResult.failed;
    }

    const totalSent = webpushSent + nativeSent;
    const totalFailed = webpushFailed + nativeFailed;
    
    console.log(`[CHAT-PUSH] Done: webpush=${webpushSent}, native=${nativeSent}, failed=${totalFailed}`);

    return new Response(JSON.stringify({ 
      ok: true, 
      webpush_sent: webpushSent,
      native_sent: nativeSent,
      total_sent: totalSent,
      failed: totalFailed,
      recipients: recipientIds.length
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[CHAT-PUSH] Error:", error);
    return new Response(JSON.stringify({ ok: false, error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
