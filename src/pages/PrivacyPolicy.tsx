// @ts-nocheck
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const PrivacyPolicy = () => {
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
        .eq('type', 'privacy_policy')
        .eq('is_active', true)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading privacy document:', error);
      }

      if (data) {
        setDocument(data);
      }
    } catch (error) {
      console.error('Error loading privacy document:', error);
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
    <div className="min-h-screen flex flex-col bg-black text-white p-4 pt-20">
      <div className="container mx-auto max-w-4xl">
        <Button variant="outline" className="mb-8" onClick={handleBack}>
          <ArrowLeft className="mr-2 w-4 h-4" /> Torna alla Home
        </Button>
        
        <h1 className="text-3xl font-bold mb-6">
          {document?.title || 'Privacy Policy'}
        </h1>
        
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
        
        <div className="mt-10 mb-10 text-center">
          <Button onClick={handleBack} className="bg-gradient-to-r from-m1ssion-blue to-m1ssion-pink">
            Torna alla Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
