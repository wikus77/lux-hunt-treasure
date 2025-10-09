"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Info = {
  swReady: boolean;
  swEndpoint?: string | null;
  swProvider?: "APPLE" | "FCM" | "ALTRO" | null;
  dbEndpoint?: string | null;
  dbProvider?: "APPLE" | "FCM" | "ALTRO" | null;
  dbIsActive?: boolean | null;
  match?: boolean | null;
  permission?: NotificationPermission;
  ua?: string;
  scope?: string | null;
  notes?: string[];
};

function detectProvider(endpoint?: string | null): "APPLE" | "FCM" | "ALTRO" | null {
  if (!endpoint) return null;
  const e = endpoint.toLowerCase();
  if (e.startsWith("https://webpush.push.apple.com") || e.startsWith("https://api.push.apple.com")) return "APPLE";
  if (e.startsWith("https://fcm.googleapis.com")) return "FCM";
  return "ALTRO";
}

export default function PushInspector({ userId }: { userId: string }) {
  const [info, setInfo] = useState<Info>({ swReady: false, permission: Notification?.permission, notes: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const notes: string[] = [];
      try {
        // 1) Service Worker / Browser
        const reg = await navigator.serviceWorker?.ready;
        const scope = reg?.scope ?? null;
        const sub = await reg?.pushManager?.getSubscription();
        const swEndpoint = sub?.endpoint ?? null;
        const swProvider = detectProvider(swEndpoint);

        // 2) DB: vista latest per l'utente
        const { data: v, error } = await supabase
          .from("v_latest_webpush_subscription")
          .select("sub_id, endpoint, created_at")
          .eq("user_id", userId)
          .limit(1)
          .maybeSingle();

        if (error) notes.push(`DB error: ${error.message}`);

        const dbEndpoint = v?.endpoint ?? null;
        const dbProvider = detectProvider(dbEndpoint);

        // 3) Se ho sub_id, leggo anche is_active dalla tabella grezza
        let dbIsActive: boolean | null = null;
        if (v?.sub_id) {
          const { data: s } = await supabase
            .from("webpush_subscriptions")
            .select("is_active")
            .eq("id", v.sub_id)
            .limit(1)
            .maybeSingle();
          dbIsActive = s?.is_active ?? null;
        }

        // 4) Confronto endpoint SW vs DB
        const match = !!swEndpoint && !!dbEndpoint && swEndpoint === dbEndpoint;

        // 5) Raccogli contesto
        const permission = Notification?.permission;
        const ua = navigator.userAgent;

        if (!swEndpoint) notes.push("SW subscription non trovata su questo device (getSubscription() = null).");
        if (!dbEndpoint) notes.push("Nessuna subscription Apple/FCM registrata in DB per l'utente.");
        if (swEndpoint && dbEndpoint && !match) notes.push("ATTENZIONE: endpoint SW ≠ endpoint DB (device non allineato al record più recente).");

        if (mounted) {
          setInfo({
            swReady: !!reg,
            swEndpoint,
            swProvider,
            dbEndpoint,
            dbProvider,
            dbIsActive,
            match,
            permission,
            ua,
            scope,
            notes,
          });
        }
      } catch (e: any) {
        if (mounted) setInfo((old) => ({ ...old, notes: [...(old.notes ?? []), `Runtime error: ${e?.message ?? e}`] }));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [userId]);

  const Badge = ({ label }: { label?: string | null }) => (
    <span className="px-2 py-0.5 rounded-full text-xs bg-slate-700/60">{label ?? "—"}</span>
  );

  return (
    <div className="mt-6 rounded-xl border border-slate-700/40 bg-slate-800/40 p-4">
      <h3 className="text-lg font-semibold mb-3">Audit flusso Push (read-only)</h3>
      {loading ? (
        <div className="text-sm opacity-80">⏳ Raccolta dati…</div>
      ) : (
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-40 opacity-70">Permesso iOS/Browser</span>
            <Badge label={info.permission} />
          </div>

          <div className="flex items-start gap-2">
            <span className="w-40 opacity-70">SW Endpoint (device)</span>
            <div className="flex-1 break-all">
              <div className="mb-1">{info.swEndpoint ?? "—"}</div>
              <div className="flex items-center gap-2">
                <span className="opacity-70">Provider</span>
                <Badge label={info.swProvider ?? "—"} />
              </div>
              <div className="opacity-70 mt-1">Scope: {info.scope ?? "—"}</div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <span className="w-40 opacity-70">DB Endpoint (latest)</span>
            <div className="flex-1 break-all">
              <div className="mb-1">{info.dbEndpoint ?? "—"}</div>
              <div className="flex items-center gap-2">
                <span className="opacity-70">Provider</span>
                <Badge label={info.dbProvider ?? "—"} />
                <span className="opacity-70">is_active</span>
                <Badge label={info.dbIsActive === true ? "TRUE" : info.dbIsActive === false ? "FALSE" : "—"} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-40 opacity-70">Match DB ↔ Device</span>
            <Badge label={info.match ? "MATCH" : "NO MATCH"} />
          </div>

          <div className="flex items-start gap-2">
            <span className="w-40 opacity-70">User-Agent</span>
            <div className="flex-1 break-all">{info.ua}</div>
          </div>

          {!!info.notes?.length && (
            <div className="mt-2 p-2 rounded bg-amber-500/10 border border-amber-400/20">
              <div className="font-medium mb-1">Note</div>
              <ul className="list-disc pl-5 space-y-1">
                {info.notes.map((n, i) => (<li key={i}>{n}</li>))}
              </ul>
            </div>
          )}
        </div>
      )}
      <div className="text-xs opacity-60 mt-3">Component read-only. Nessuna modifica alla catena push.</div>
    </div>
  );
}