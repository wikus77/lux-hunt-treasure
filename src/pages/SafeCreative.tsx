// @ts-nocheck
// © 2025 – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useWouterNavigation } from '@/hooks/useWouterNavigation';

interface LegalDocument {
  id: string;
  title: string;
  content_md: string;
  version: string;
  published_at: string;
}

export default function SafeCreative() {
  const { goBack } = useWouterNavigation();
  const [document, setDocument] = useState<LegalDocument | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLegalDocument();
  }, []);

  const loadLegalDocument = async () => {
    try {
      const { data, error } = await supabase
        .from('legal_documents')
        .select('*')
        .eq('type', 'safecreative')
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error loading SafeCreative document:', error);
      }

      setDocument(data);
    } catch (err) {
      console.error('Failed to load SafeCreative document:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    goBack();
  };

  const formatMarkdownContent = (content: string) => {
    return content
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold text-[#00D1FF] mb-3 mt-6">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-white mb-4 mt-8">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-white mb-6 mt-8">$1</h1>')
      .replace(/^\* (.+)$/gm, '<li class="text-white/80 mb-1">$1</li>')
      .replace(/^- (.+)$/gm, '<li class="text-white/80 mb-1">$1</li>')
      .replace(/\n\n/g, '</p><p class="text-white/80 leading-relaxed mb-4">')
      .replace(/^(.+)$/gm, '<p class="text-white/80 leading-relaxed mb-4">$1</p>')
      .replace(/<li[^>]*>.*<\/li>/gs, (match) => `<ul class="list-disc list-inside space-y-1 ml-4 mb-4">${match}</ul>`)
      .replace(/<\/ul><ul[^>]*>/g, '');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#1A1A2E] to-[#16213E] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00D1FF] mx-auto mb-4"></div>
          <p className="text-white/60">Caricamento documento SafeCreative...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#1A1A2E] to-[#16213E]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleBack}
            className="flex items-center text-[#00D1FF] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Indietro
          </button>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-[#00D1FF]/20 p-8">
            {document ? (
              <>
                <h1 className="text-3xl font-bold text-white mb-2 font-orbitron">
                  {document.title}
                </h1>
                
                <div className="text-sm text-white/60 mb-8 flex items-center gap-4">
                  <span>Versione {document.version}</span>
                  <span>•</span>
                  <span>
                    Pubblicato: {new Date(document.published_at).toLocaleDateString('it-IT')}
                  </span>
                </div>

                <div 
                  className="prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: formatMarkdownContent(document.content_md) 
                  }}
                />
              </>
            ) : (
              <div className="text-center py-12">
                <h1 className="text-2xl font-bold text-white mb-4">
                  Documento non trovato
                </h1>
                <p className="text-white/60 mb-6">
                  Il documento SafeCreative non è attualmente disponibile.
                </p>
                <button
                  onClick={handleBack}
                  className="inline-flex items-center px-6 py-3 bg-[#00D1FF]/20 text-[#00D1FF] 
                           rounded-lg hover:bg-[#00D1FF]/30 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Torna indietro
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}