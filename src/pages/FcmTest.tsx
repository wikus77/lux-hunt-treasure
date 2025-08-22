// © 2025 M1SSION™ NIYVORA KFT– Joseph MULÉ
import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { initFcmAndGetToken } from "@/lib/push/initFcm";

const supabase = createClient(
  "https://vkjrqirvdvjbemsfzxof.supabase.co",
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export default function FcmTest() {
  const [log, setLog] = useState<string[]>([]);
  const push = (l: string) => setLog((x) => [...x, l]);

  const onClick = async () => {
    try {
      push("• Genero token…");
      const token = await initFcmAndGetToken();
      if (!token) { push("✖ Nessun token"); alert("Nessun token"); return; }
      push("✔ Token ottenuto, salvo su Supabase…");
      const user_id = "web-test"; // opzionale: sostituisci con utente reale se loggato
      const { error } = await supabase.from("push_tokens").upsert({ user_id, token, platform: "web" }, { onConflict: "user_id,token" });
      if (error) throw error;
      push("✔ Token salvato");
      alert("OK! Token salvato.");
    } catch (e:any) {
      console.error(e); push("✖ Errore: " + (e?.message || e));
      alert("Errore: " + (e?.message || e));
    }
  };

  return (
    <main style={{padding:24}}>
      <h1>🔔 M1SSION™ — Test Push (isolato)</h1>
      <p>Questa pagina serve SOLO per attivare le push senza toccare la tua UI.</p>
      <button onClick={onClick}>Attiva e salva token</button>
      <pre style={{marginTop:16,background:"#111",color:"#0f0",padding:16,borderRadius:8}}>
{log.join("\n")}
      </pre>
    </main>
  );
}