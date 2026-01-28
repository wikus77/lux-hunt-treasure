// @ts-nocheck
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import BottomNavigation from "@/components/layout/BottomNavigation";
import { CircularBackButton } from "@/components/ui/CircularBackButton";

const Terms = () => {
  const [location, setLocation] = useLocation();
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLegalDocument();
  }, []);

  const loadLegalDocument = async () => {
    try {
      const { data, error } = await supabase
        .from('legal_documents')
        .select('*')
        .eq('type', 'terms_of_service')
        .eq('is_active', true)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading terms document:', error);
      }

      if (data) {
        setDocument(data);
      }
    } catch (error) {
      console.error('Error loading terms document:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setLocation('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#00D1FF] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Caricamento documento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90 text-white">
      <UnifiedHeader />
      
      {/* 🔧 FIX 28/01/2026: Layout come Info App */}
      <main className="pt-16 pb-20 px-4">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Header with Circular Back Button */}
          <div className="flex items-center gap-3 mb-4">
            <CircularBackButton onClick={handleBack} size="md" />
            <div>
              <h1 className="text-xl font-orbitron text-white">Termini di Servizio</h1>
              <p className="text-white/60 text-sm">Condizioni d'uso M1SSION™</p>
            </div>
          </div>
        
        <div 
          className="relative overflow-hidden rounded-[24px] p-6"
          style={{
            background: 'rgba(0, 0, 0, 0.05)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 2px 3px rgba(255, 255, 255, 0.05)'
          }}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-amber-500 opacity-90" />
          
          <h2 className="text-2xl font-bold mb-6">
            {document?.title || 'Termini e Condizioni'}
          </h2>
          
          {document ? (
            <div className="space-y-6 prose prose-invert max-w-none">
              <div 
                className="text-gray-300"
                dangerouslySetInnerHTML={{ __html: document.content_md.replace(/\n/g, '<br />') }}
              />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg mb-4">🚫 Documento non disponibile</p>
                <p className="text-gray-500 mb-6">Il documento richiesto non è attualmente disponibile.</p>
                <Button onClick={handleBack} className="bg-[#00D1FF] hover:bg-[#00B8E6] text-black">
                  Torna alla Home
                </Button>
              </div>
            </div>
          )}
          
          <div className="mt-8 text-center">
            <Button onClick={handleBack} className="bg-gradient-to-r from-m1ssion-blue to-m1ssion-pink">
              Torna alla Home
            </Button>
          </div>
        </div>
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default Terms;
