
import React, { useEffect } from 'react';
import AdminPrizeManager from '@/components/admin/prizeManager/AdminPrizeManager';
import { supabase } from '@/integrations/supabase/client';

export default function TestAdminUI() {
  useEffect(() => {
    console.log("🟢 Rendering attivo");
    
    // Check auth status on mount
    supabase.auth.getSession().then(({ data }) => {
      console.log("🔑 Session check:", data.session ? "Session found" : "No session");
    });
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🔄 Auth event:", event);
      console.log("🔑 User ID:", session?.user?.id || "None");
    });
    
    return () => {
      subscription.unsubscribe();
    };
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
