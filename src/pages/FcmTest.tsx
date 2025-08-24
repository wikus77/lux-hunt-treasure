// © 2025 M1SSION™ NIYVORA KFT– Joseph MULÉ
import React, { useState, useEffect } from "react";
import { useFcm } from "@/hooks/useFcm";

export default function FcmTest() {
  const [log, setLog] = useState<string[]>([]);
  const { status, error, token, generate, isSupported, permission } = useFcm("web-test");
  
  const push = (l: string) => setLog((x) => [...x, l]);

  // Log FCM status changes
  useEffect(() => {
    if (status === 'loading') {
      push("🔄 Inizializzazione FCM...");
      push("• Carico Firebase v8 compat SDK...");
      push("• Registro Service Worker /firebase-messaging-sw.js...");
      push("• Richiedo permessi notifiche...");
      push("• Genero token con VAPID (22/08)...");
    } else if (status === 'success' && token) {
      push("✅ FCM configurato con successo!");
      push(`🔑 Token: ${token.substring(0, 20)}...`);
      push("💾 Token salvato su Supabase");
      push("🎯 M1SSION™ FCM Ready!");
    } else if (status === 'error' && error) {
      push(`❌ Errore FCM: ${error}`);
    }
  }, [status, error, token]);

  // Initial status check
  useEffect(() => {
    push("🔧 M1SSION™ FCM Test - Build 22/08/2025");
    push(`📱 Browser Support: ${isSupported ? '✅' : '❌'}`);
    push(`🔔 Permissions: ${permission || 'non richiesti'}`);
    if (token) {
      push(`🔑 Token cached: ${token.substring(0, 20)}...`);
    }
  }, [isSupported, permission, token]);

  const onClick = async () => {
    setLog([]); // Clear log for new attempt
    await generate();
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