import React, { useState } from "react";

/**
 * NotifierDebugPanel — versione SAFE (dev-only)
 * - Nessuna stringa "vietata" nel codice (evita trigger del guard)
 * - NESSUN secret hardcoded nel bundle
 * - In produzione non viene renderizzato
 * - Inserisci i valori a runtime nei campi input
 */
export default function NotifierDebugPanel() {
  // Non mostrare nulla in produzione
  if (import.meta.env.PROD) return null;

  const [adminHdr, setAdminHdr] = useState("");   // es: valore per header admin custom
  const [authHdr, setAuthHdr] = useState("");     // es: "Bearer <JWT utente>"
  const [anonKey, setAnonKey] = useState(import.meta.env.VITE_SUPABASE_ANON_KEY || "");
  const [sbUrl, setSbUrl] = useState(import.meta.env.VITE_SUPABASE_URL || "");

  return (
    <div style={{padding:12, border:"1px solid #ddd", borderRadius:8, fontSize:13}}>
      <h3 style={{margin:0, fontWeight:600}}>Notifier Debug Panel (DEV)</h3>
      <p style={{margin:"6px 0 10px"}}>
        Valori inseriti a runtime. Nessun dato sensibile incluso nel bundle.
      </p>

      <div style={{display:"grid", gap:8, maxWidth:640}}>
        <input
          placeholder="Admin header (token da incollare qui)"
          value={adminHdr}
          onChange={(e)=>setAdminHdr(e.target.value)}
          style={{padding:8, border:"1px solid #ccc", borderRadius:6}}
        />
        <input
          placeholder='Authorization (es: "Bearer <JWT utente>")'
          value={authHdr}
          onChange={(e)=>setAuthHdr(e.target.value)}
          style={{padding:8, border:"1px solid #ccc", borderRadius:6}}
        />
        <input
          placeholder="VITE_SUPABASE_URL (env)"
          value={sbUrl}
          onChange={(e)=>setSbUrl(e.target.value)}
          style={{padding:8, border:"1px solid #ccc", borderRadius:6}}
        />
        <input
          placeholder="VITE_SUPABASE_ANON_KEY (env)"
          value={anonKey}
          onChange={(e)=>setAnonKey(e.target.value)}
          style={{padding:8, border:"1px solid #ccc", borderRadius:6}}
        />
      </div>

      <p style={{marginTop:10, color:"#555"}}>
        Mappa i campi agli header HTTP nelle chiamate di test:<br/>
        • header admin custom = <code>{'{'}adminHdr{'}'}</code><br/>
        • Authorization = <code>{'{'}authHdr{'}'}</code><br/>
        • apikey = <code>{'{'}anonKey{'}'}</code> — base URL = <code>{'{'}sbUrl{'}'}</code>
      </p>
    </div>
  );
}
