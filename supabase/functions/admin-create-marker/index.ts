// © 2026 M1SSION™ – Joseph MULÉ – NIYVORA KFT
// Edge Function: admin-create-marker
// Permette agli admin di creare marker + reward via service role (bypassa RLS markers_no_insert)

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
import { withCors } from "../_shared/cors.ts";

type Json = Record<string, any>;

const url = Deno.env.get("SUPABASE_URL")!;
const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(withCors(async (req) => {
  try {
    const body = await req.json().catch(() => ({}));

    // 1. Autenticazione utente
    const userClient = createClient(url, anon, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });

    const { data: auth } = await userClient.auth.getUser();
    const user_id = auth?.user?.id;
    if (!user_id) {
      return jsonResponse({ ok: false, error: "UNAUTHORIZED" }, 401);
    }

    // 2. Verifica ruolo admin
    const admin = createClient(url, service);
    const { data: profile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", user_id)
      .maybeSingle();

    if (!profile || !['admin', 'owner'].includes(profile.role)) {
      console.error(`admin-create-marker: ❌ FORBIDDEN - user:${user_id.slice(-8)} role:${profile?.role || 'none'}`);
      return jsonResponse({ ok: false, error: "FORBIDDEN", detail: "Admin role required" }, 403);
    }

    console.log(`admin-create-marker: ✅ Admin verified - user:${user_id.slice(-8)} role:${profile.role}`);

    // 3. Validazione input
    const { lat, lng, title, reward_type, reward_payload, min_zoom, visible_hours } = body;

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return jsonResponse({ ok: false, error: "INVALID_COORDINATES", detail: "lat and lng must be numbers" }, 400);
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return jsonResponse({ ok: false, error: "INVALID_COORDINATES", detail: "lat/lng out of range" }, 400);
    }

    // 4. Creare marker (service role bypassa RLS)
    const now = new Date();
    const visibleTo = new Date(now.getTime() + (visible_hours || 720) * 60 * 60 * 1000); // default 30 giorni

    const { data: marker, error: markerError } = await admin
      .from("markers")
      .insert({
        lat,
        lng,
        title: title || 'Reward Marker',
        active: true,
        visible_from: now.toISOString(),
        visible_to: visibleTo.toISOString()
      })
      .select()
      .single();

    if (markerError) {
      console.error(`admin-create-marker: ❌ MARKER_INSERT_FAILED:`, markerError);
      return jsonResponse({ ok: false, error: "MARKER_INSERT_FAILED", detail: markerError.message }, 500);
    }

    console.log(`admin-create-marker: ✅ Marker created - id:${marker.id}`);

    // 5. Creare reward associato
    const payloadWithZoom = {
      ...(reward_payload || {}),
      min_zoom: min_zoom ?? 14  // Default 14 per visibilità normale
    };

    const { error: rewardError } = await admin
      .from("marker_rewards")
      .insert({
        marker_id: marker.id,  // UUID del marker appena creato
        reward_type: (reward_type || 'm1u').toLowerCase(),
        payload: payloadWithZoom,
        description: `Reward ${reward_type || 'm1u'} - created by admin`
      });

    if (rewardError) {
      console.error(`admin-create-marker: ⚠️ REWARD_INSERT_FAILED (marker created):`, rewardError);
      // Non rollback marker, ma segnala errore
      return jsonResponse({ 
        ok: true, 
        partial: true,
        marker_id: marker.id,
        warning: "Marker created but reward insert failed",
        error_detail: rewardError.message
      }, 200);
    }

    console.log(`admin-create-marker: ✅ Reward created for marker:${marker.id}`);

    return jsonResponse({
      ok: true,
      marker_id: marker.id,
      reward_type: reward_type || 'm1u',
      min_zoom: payloadWithZoom.min_zoom,
      visible_until: visibleTo.toISOString()
    }, 200);

  } catch (e) {
    console.error(`admin-create-marker: ❌ INTERNAL_ERROR:`, e);
    return jsonResponse({ ok: false, error: "INTERNAL_ERROR", detail: String(e?.message ?? e) }, 500);
  }
}));

function jsonResponse(payload: Json, status = 200) {
  return new Response(JSON.stringify(payload), { 
    status, 
    headers: { "content-type": "application/json" }
  });
}
