"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Props = { userId: string };

function getProviderFromEndpoint(endpoint: string): string {
  if (endpoint.includes('webpush.push.apple.com') || endpoint.includes('api.push.apple.com')) {
    return "Apple";
  }
  if (endpoint.includes('fcm.googleapis.com')) {
    return "FCM";
  }
  return "Altro";
}

export default function NotificationsStatus({ userId }: Props) {
  const [enabled, setEnabled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [providerLabel, setProviderLabel] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("push_tokens")
        .select("token")
        .eq("user_id", userId)
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();
      if (!mounted) return;
      if (error) {
        console.warn("status load error", error);
        setEnabled(false);
        setProviderLabel("");
      } else {
        const isConnected = !!data;
        setEnabled(isConnected);
        setProviderLabel(isConnected ? getProviderFromEndpoint(data.token) : "");
      }
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [userId]);

  return (
    <div className="p-4 border border-border rounded-lg bg-card">
      <h3 className="text-sm font-medium mb-3">Stato Notifiche Push</h3>
      {/* BLOCCO SOLO LETTURA: non cambiare la chain */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2">
          <input 
            type="checkbox" 
            checked={enabled} 
            readOnly 
            className="h-4 w-4"
            style={{ pointerEvents: 'none' }}
          />
          <span className="text-sm">Notifiche Push su questo dispositivo</span>
        </label>
        {!loading && enabled && providerLabel && (
          <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-md">
            {providerLabel}
          </span>
        )}
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        {loading && "Verifico stato…"}
        {!loading && enabled && "Connesso ✅"}
        {!loading && !enabled && "Non connesso ❌"}
      </div>
    </div>
  );
}