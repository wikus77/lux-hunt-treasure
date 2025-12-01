// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
// Chat Push Notify - V7 STABILE
// Usa webpush_subscriptions come webpush-send (FUNZIONANTE)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import webpush from "npm:web-push@3.6.7";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const srk = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SERVICE_ROLE_KEY")!;
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
      url: "/notifications",
      icon: "/icon-512.png",
      badge: "/icon-192.png",
      tag: `chat_${conversation_id}`,
      renotify: true
    });

    let sent = 0;
    let failed = 0;

    for (const s of subs || []) {
      try {
        // s.keys è JSONB: { p256dh, auth }
        await webpush.sendNotification(s, payload);
        sent++;
        console.log("[CHAT-PUSH] ✅ Sent to:", s.user_id);
      } catch (e: any) {
        failed++;
        console.error("[CHAT-PUSH] ❌ Error:", e?.statusCode || e?.message || e);
      }
    }

    console.log(`[CHAT-PUSH] Done: ${sent} sent, ${failed} failed`);

    return new Response(JSON.stringify({ ok: true, sent, failed, total: subs?.length || 0 }), {
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
