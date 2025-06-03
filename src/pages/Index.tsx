
import React from "react";

export default function Index() {
  const isCapacitor = typeof window !== "undefined" && !!(window as any).Capacitor;

  if (isCapacitor) {
    console.log("🛑 HARD BYPASS: Index.tsx neutralizzato su Capacitor");
    window.location.replace("/home");
    return null;
  }

  // 👇 Render normale solo se NON Capacitor
  return (
    <div style={{ color: "white", padding: 20 }}>
      <h1>Fallback Landing Page</h1>
      <p>Questa pagina dovrebbe essere visibile solo su browser.</p>
    </div>
  );
}
