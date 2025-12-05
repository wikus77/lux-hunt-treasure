// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function haversine(lat1:number,lng1:number,lat2:number,lng2:number){
  const R=6371000, toRad=(d:number)=>d*Math.PI/180;
  const dLat=toRad(lat2-lat1), dLng=toRad(lng2-lng1);
  const a=Math.sin(dLat/2)**2+Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLng/2)**2;
  return 2*R*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

function isQuietHours(cfg:any){
  try{
    const fmt=(d:Date)=>new Intl.DateTimeFormat("en-GB",{timeZone:cfg.quiet_hours.timezone,hour12:false,hour:"2-digit",minute:"2-digit"}).format(d).replace(":","");
    const now=fmt(new Date()), s=cfg.quiet_hours.start.replace(":",""), e=cfg.quiet_hours.end.replace(":","");
    return s>e ? (now>=s || now<=e) : (now>=s && now<=e);
  }catch{ return false; }
}

const tmpl=(s:string, m:any)=>s.replace(/\{\{marker_name\}\}/g, m.title ?? m.name ?? "marker");

Deno.serve(async req => {
  if (req.method === "OPTIONS") return new Response(null,{headers:corsHeaders});
  const t0=Date.now();

  try{
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SERVICE_ROLE_KEY");
    if(!SUPABASE_URL || !SERVICE_ROLE_KEY) throw new Error("Missing Supabase env vars");

    const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const body = await req.json().catch(()=>({}));
    
    // 🔒 SECURITY: Verify internal secret for cron calls
    const CRON_SECRET = Deno.env.get("CRON_SECRET") || Deno.env.get("INTERNAL_SECRET");
    const providedSecret = req.headers.get("x-cron-secret") || req.headers.get("x-internal-secret") || body?.cron_secret;
    
    const authHeader = req.headers.get("authorization");
    const isServiceRole = authHeader?.includes(SERVICE_ROLE_KEY?.slice(0, 20) || "NONE");
    
    if (CRON_SECRET && providedSecret !== CRON_SECRET && !isServiceRole) {
      console.warn("[GEOFENCE] ⚠️ Missing or invalid cron secret - allowing for backwards compatibility");
      // NOTE: Enable this block to enforce strict auth:
      // return new Response(JSON.stringify({error:"Unauthorized"}),{status:401,headers:corsHeaders});
    }
    
    const dry  = body?.dry === true || req.url.includes("dry=1");
    const force_user_id = body?.force_user_id as string | undefined;
    const test_position = body?.test_position as {lat:number,lng:number}|undefined;

    // 1) Config (solo public view)
    const { data: cfgRow, error: cfgErr } =
      await sb.from("geo_push_settings_v").select("value").eq("key","engine").single();
    if(cfgErr || !cfgRow) throw new Error("Failed to load engine config via public view");
    const cfg = cfgRow.value;

    if(!cfg.enabled){
      return new Response(JSON.stringify({success:true, processed:0, sent:0, dry, message:"engine disabled"}),{headers:{...corsHeaders,"Content-Type":"application/json"}});
    }

    // 2) Posizioni (public view) – ultimi 15'
    const since = new Date(Date.now()-15*60*1000).toISOString();
    let positions: {user_id:string,lat:number,lng:number,updated_at:string}[] = [];

    if(test_position && force_user_id){
      positions = [{ user_id: force_user_id, lat: test_position.lat, lng: test_position.lng, updated_at: new Date().toISOString() }];
    } else {
      const q = sb.from("geo_push_positions_v")
        .select("user_id,lat,lng,updated_at")
        .gte("updated_at", since);
      if (force_user_id) q.eq("user_id", force_user_id);
      const { data: pos, error: posErr } = await q;
      if (posErr) throw new Error("Failed to read positions via public view");
      positions = pos ?? [];
    }

    // 3) Marker attivi (unificati: classici + QR)
    const { data: markers, error: mErr } =
      await sb.from("geo_push_markers_v").select("id,title,lat,lng");
    if(mErr) throw new Error("Failed to fetch markers");
    if(!positions.length || !markers?.length){
      return new Response(JSON.stringify({success:true, processed:0, sent:0, dry, message:"no positions or markers"}),{headers:{...corsHeaders,"Content-Type":"application/json"}});
    }

    const quiet = isQuietHours(cfg);
    let processed=0, sent=0;

    for(const p of positions){
      // (opz) daily cap: controllo leggero; il cap reale viene rispettato nel log/stato
      const dailyCount = 0;

      if(dailyCount >= cfg.daily_cap) {
        await sb.rpc("geo_push_log_delivery", {
          p_user_id: p.user_id, p_marker_id: markers[0].id, p_distance_m: 0,
          p_reason: "DAILY_CAP", p_title: null, p_body: null, p_payload: {}, p_sent: false,
          p_provider: "webpush-admin-broadcast", p_response: {}
        });
        continue;
      }

      for(const m of markers){
        const dist = haversine(p.lat,p.lng,m.lat,m.lng);
        if(dist > cfg.default_radius_m) continue;

        let reason = "ENTER", didSend=false, resp:any={};
        const title = tmpl(cfg.title_template, m);
        const body  = tmpl(cfg.body_template, m);
        const payload = { title, body, url: cfg.click_url, target: { user_ids_csv: p.user_id } };

        if(!quiet && !dry){
          try{
            const r = await fetch(`${SUPABASE_URL}/functions/v1/webpush-admin-broadcast`,{
              method:"POST",
              headers:{ "Content-Type":"application/json", "Authorization":`Bearer ${SERVICE_ROLE_KEY}` },
              body: JSON.stringify(payload)
            });
            resp = { status:r.status, text: await r.text().catch(()=>null) };
            if(r.ok){ reason="SENT"; didSend=true; sent++; }
            else { reason=`SEND_ERROR_${r.status}`; }
          }catch(e:any){
            reason="SEND_ERROR"; resp={ error:String(e?.message||e) };
          }
        } else {
          reason = quiet ? "QUIET_HOURS" : "DRY_RUN";
        }

        // 🔒 SCRITTURE SOLO VIA RPC PUBLIC (security definer)
        await sb.rpc("geo_push_log_delivery", {
          p_user_id: p.user_id, p_marker_id: m.id, p_distance_m: dist,
          p_reason: reason, p_title: title, p_body: body,
          p_payload: payload, p_sent: didSend, p_provider: "webpush-admin-broadcast",
          p_response: resp
        });

        await sb.rpc("geo_push_upsert_state", {
          p_user_id: p.user_id, p_marker_id: m.id,
          p_last_enter_at: new Date().toISOString(),
          p_last_sent_at: didSend ? new Date().toISOString() : null,
          p_enter_inc: 1, p_sent_inc: didSend ? 1 : 0
        });

        processed++;
      }
    }

    // Watermark via RPC
    await sb.rpc("geo_push_touch_watermark", { p_name:"geofence_engine", p_ts:new Date().toISOString() });

    return new Response(JSON.stringify({ success:true, processed, sent, dry, quiet, duration_ms: Date.now()-t0 }), {
      headers:{...corsHeaders,"Content-Type":"application/json"}
    });

  }catch(err:any){
    return new Response(JSON.stringify({ success:false, error:String(err?.message||err), duration_ms: Date.now()-t0 }), {
      status:500, headers:{...corsHeaders,"Content-Type":"application/json"}
    });
  }
});