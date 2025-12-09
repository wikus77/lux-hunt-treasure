// @ts-nocheck
// © 2025 – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Calendar, Mail } from 'lucide-react';
import { useWouterNavigation } from '@/hooks/useWouterNavigation';
import { supabase } from '@/integrations/supabase/client';

interface LegalDocument {
  id: string;
  title: string;
  content_md: string;
  version: string;
  published_at: string;
}

const GameRules: React.FC = () => {
  const { navigate } = useWouterNavigation();
  const [document, setDocument] = useState<LegalDocument | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGameRules();
  }, []);

  const loadGameRules = async () => {
    try {
      const { data, error } = await supabase
        .from('legal_documents')
        .select('*')
        .eq('type', 'game_rules')
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error loading game rules:', error);
        return;
      }

      setDocument(data);
    } catch (error) {
      console.error('Error loading game rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatMarkdownContent = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-[#00D1FF] mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-[#00D1FF] mt-6 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-white mb-4">$1</h1>')
      .replace(/^- (.*$)/gim, '<li class="text-white/80 ml-4 mb-1">• $1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li class="text-white/80 ml-4 mb-1 list-decimal">$1</li>')
      .replace(/\n/g, '<br>');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1426] via-[#1a1d3a] to-[#0B1426] p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button
            onClick={() => navigate('/settings/legal')}
            variant="ghost"
            size="sm"
            className="mr-4 text-white/70 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Indietro
          </Button>
          <h1 className="text-2xl font-orbitron font-bold text-white">Regolamento M1SSION™</h1>
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card 
            className="relative overflow-hidden rounded-[24px]"
            style={{
              background: 'rgba(0, 0, 0, 0.05)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 2px 3px rgba(255, 255, 255, 0.05)'
            }}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-amber-500 opacity-90" />
            <CardHeader>
              <CardTitle className="text-white font-orbitron flex items-center">
                <FileText className="w-6 h-6 mr-3 text-[#00D1FF]" />
                {loading ? 'Caricamento...' : document?.title || 'Regolamento del Gioco'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#00D1FF] border-t-transparent"></div>
                  <span className="ml-3 text-white/70">Caricamento documento...</span>
                </div>
              ) : document ? (
                <>
                  <div 
                    className="prose prose-invert max-w-none text-white/80 leading-relaxed"
                    dangerouslySetInnerHTML={{ 
                      __html: formatMarkdownContent(document.content_md) 
                    }}
                  />
                  
                  {/* Document Info */}
                  <div className="mt-8 pt-6 border-t border-white/10">
                    <div className="flex flex-wrap gap-6 text-sm text-white/60">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        Versione: {document.version}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        Pubblicato: {new Date(document.published_at).toLocaleDateString('it-IT')}
                      </div>
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2" />
                        Contatti: contact@m1ssion.com
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-white/30" />
                  <h3 className="text-xl font-semibold text-white mb-2">Documento non disponibile</h3>
                  <p className="text-white/60 mb-6">
                    Il regolamento del gioco non è attualmente disponibile.
                  </p>
                  <Button
                    onClick={loadGameRules}
                    variant="outline"
                    className="border-[#00D1FF]/50 text-[#00D1FF] hover:bg-[#00D1FF]/10"
                  >
                    Riprova
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate('/privacy-policy')}
            variant="ghost"
            size="sm"
            className="text-[#00D1FF] hover:bg-[#00D1FF]/10"
          >
            Privacy Policy
          </Button>
          <Button
            onClick={() => navigate('/terms')}
            variant="ghost"
            size="sm"
            className="text-[#00D1FF] hover:bg-[#00D1FF]/10"
          >
            Termini di Servizio
          </Button>
          <Button
            onClick={() => navigate('/cookie-policy')}
            variant="ghost"
            size="sm"
            className="text-[#00D1FF] hover:bg-[#00D1FF]/10"
          >
            Cookie Policy
          </Button>
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            size="sm"
            className="border-[#00D1FF]/50 text-[#00D1FF] hover:bg-[#00D1FF]/10"
          >
            Torna alla Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GameRules;