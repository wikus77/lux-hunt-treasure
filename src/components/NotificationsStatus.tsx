import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Props = { userId: string };

export default function NotificationsStatus({ userId }: Props) {
  const [enabled, setEnabled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("v_latest_webpush_subscription")
        .select("endpoint")
        .eq("user_id", userId)
        .limit(1)
        .maybeSingle();
      if (!mounted) return;
      if (error) {
        console.warn("status load error", error);
        setEnabled(false);
      } else {
        setEnabled(!!data);
      }
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [userId]);

  return (
    <div>
      {/* BLOCCO SOLO LETTURA: non cambiare la chain */}
      <label className="toggle">
        <input type="checkbox" checked={enabled} readOnly />
        <span>Notifiche Push su questo dispositivo</span>
      </label>
      {loading && <small>Verifico stato…</small>}
      {!loading && enabled && <small>Connesso ✅</small>}
      {!loading && !enabled && <small>Non connesso ❌</small>}
    </div>
  );
}