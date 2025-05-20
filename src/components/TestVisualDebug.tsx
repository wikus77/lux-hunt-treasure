
import React from 'react';

export default function TestVisualDebug() {
  console.log("🟢 COMPONENTE DEBUG VISIVO ESEGUITO");
  return (
    <div style={{ padding: "20px", background: "#222", color: "#0f0" }}>
      <h1>✅ Debug attivo</h1>
      <p>Questa è una conferma visiva. Il rendering funziona.</p>
    </div>
  );
}
