
import React, { useEffect } from 'react';

export default function AdminPrizes() {
  useEffect(() => {
    console.log("🟢 Pagina /admin/prizes caricata");
  }, []);
  
  return (
    <div className="container mx-auto py-10">
      <div style={{ padding: "30px", backgroundColor: "#111", color: "#0f0" }}>
        <h1 className="text-3xl font-bold">✅ PAGINA /admin/prizes FUNZIONANTE</h1>
        <p className="mt-4">Questa è una versione di test per confermare che il routing e il layout funzionano.</p>
      </div>
    </div>
  );
}
