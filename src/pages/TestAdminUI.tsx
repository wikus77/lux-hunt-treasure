
import React, { useEffect } from 'react';
import AdminPrizeManager from '@/components/admin/prizeManager/AdminPrizeManager';

export default function TestAdminUI() {
  useEffect(() => {
    console.log("🟢 Rendering attivo");
  }, []);
  
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8 text-white">Gestione Premi</h1>
      <div className="mb-6" style={{ padding: "20px", backgroundColor: "#111", color: "#0f0" }}>
        <h2 className="text-xl">✅ COMPONENTI FUNZIONANO</h2>
        <p>Interfaccia di gestione premi attiva</p>
      </div>
      <AdminPrizeManager />
    </div>
  );
}
