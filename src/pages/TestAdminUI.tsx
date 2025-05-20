
import { useEffect } from 'react';

export default function TestAdminUI() {
  useEffect(() => {
    console.log("🟢 Rendering attivo");
  }, []);
  
  return (
    <div style={{ padding: "40px", backgroundColor: "#111", color: "#0f0", fontSize: "20px" }}>
      <h1>✅ COMPONENTI FUNZIONANO</h1>
      <p>Questa pagina conferma che tutto il rendering, layout e struttura sono OK.</p>
    </div>
  );
}
