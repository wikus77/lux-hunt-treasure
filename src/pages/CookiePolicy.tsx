// @ts-nocheck

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Cookie, Settings, Shield, Info } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface LegalDocument {
  id: string;
  title: string;
  content_md: string;
  version: string;
  published_at: string;
}

const CookiePolicy = () => {
  const [location, setLocation] = useLocation();
  const [document, setDocument] = useState<LegalDocument | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCookiePolicy();
  }, []);

  const loadCookiePolicy = async () => {
    try {
      const { data, error } = await supabase
        .from('legal_documents')
        .select('*')
        .eq('type', 'cookie_policy')
        .eq('is_active', true)
        .order('published_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading cookie policy:', error);
      }

      if (data) {
        setDocument(data);
      }
    } catch (error) {
      console.error('Error loading cookie policy:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatMarkdownContent = (content: string) => {
    return content
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-orbitron font-bold text-white mb-4">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold text-[#00D1FF] mb-3 mt-6">$2</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-[#00D1FF] mb-3">$3</h3>')
      .replace(/^\* (.*$)/gim, '<li class="text-white/80 mb-1">$1</li>')
      .replace(/^\- (.*$)/gim, '<li class="text-white/80 mb-1">$1</li>')
      .replace(/\n\n/g, '</p><p class="text-white/80 mb-4">')
      .replace(/^(?!<[h|l|p])(.*$)/gim, '<p class="text-white/80 mb-4">$1</p>');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#131524]/70 to-black text-white">
      <div className="container mx-auto max-w-4xl px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center space-x-4 mb-8">
            <Button 
              variant="outline" 
              className="border-white/20 text-white hover:bg-white/10"
              onClick={() => setLocation('/')}
            >
              <ArrowLeft className="mr-2 w-4 h-4" /> 
              Torna alla Home
            </Button>
          </div>

          {/* Main Content Card */}
          <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
            <CardHeader className="border-b border-white/10">
              <CardTitle className="flex items-center text-white font-orbitron">
                <Cookie className="w-6 h-6 mr-3 text-[#00D1FF]" />
                <div>
                  <h1 className="text-2xl">Cookie Policy M1SSION™</h1>
                  <p className="text-white/70 text-sm font-normal">
                    Informazioni sui cookie utilizzati nell'app
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00D1FF] mx-auto mb-4"></div>
                  <p className="text-white/60">Caricamento...</p>
                </div>
              ) : document ? (
                <div 
                  className="prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: formatMarkdownContent(document.content_md) 
                  }}
                />
              ) : (
                <div className="text-center py-8">
                  <Cookie className="w-12 h-12 text-[#00D1FF] mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-white mb-2">Cookie Policy</h2>
                  <p className="text-white/80 mb-6">
                    Questa pagina descrive l'utilizzo dei cookie nell'app M1SSION™.
                  </p>
                  
                  <div className="space-y-6 text-left max-w-2xl mx-auto">
                    <section>
                      <h3 className="text-lg font-semibold text-[#00D1FF] mb-3 flex items-center">
                        <Info className="w-5 h-5 mr-2" />
                        Cosa sono i Cookie
                      </h3>
                      <p className="text-white/80 mb-4">
                        I cookie sono piccoli file di testo memorizzati sul tuo dispositivo quando utilizzi la nostra app. 
                        Ci aiutano a fornire una migliore esperienza utente e a capire come viene utilizzata l'applicazione.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold text-[#00D1FF] mb-3">Tipi di Cookie utilizzati</h3>
                      
                      <div className="space-y-4">
                        <div className="bg-[#00D1FF]/10 p-4 rounded-lg border border-[#00D1FF]/20">
                          <h4 className="font-semibold text-white mb-2">🔒 Cookie Essenziali</h4>
                          <p className="text-white/70 text-sm">
                            Necessari per il funzionamento base dell'app. Include autenticazione, 
                            sicurezza e funzionalità core. Non possono essere disabilitati.
                          </p>
                        </div>

                        <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
                          <h4 className="font-semibold text-white mb-2">📊 Cookie Analitici</h4>
                          <p className="text-white/70 text-sm">
                            Ci aiutano a capire come utilizzi l'app per migliorare l'esperienza utente. 
                            Include analisi dell'utilizzo e performance.
                          </p>
                        </div>

                        <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-500/20">
                          <h4 className="font-semibold text-white mb-2">📢 Cookie di Marketing</h4>
                          <p className="text-white/70 text-sm">
                            Utilizzati per personalizzare contenuti e comunicazioni basate sui tuoi interessi 
                            nell'app M1SSION™.
                          </p>
                        </div>

                        <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
                          <h4 className="font-semibold text-white mb-2">⚙️ Cookie di Preferenze</h4>
                          <p className="text-white/70 text-sm">
                            Ricordano le tue impostazioni e preferenze per personalizzare l'esperienza 
                            nelle sessioni future.
                          </p>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold text-[#00D1FF] mb-3 flex items-center">
                        <Settings className="w-5 h-5 mr-2" />
                        Gestione delle Preferenze
                      </h3>
                      <p className="text-white/80 mb-4">
                        Puoi gestire le tue preferenze sui cookie in qualsiasi momento dalle impostazioni 
                        dell'app o dal banner dei cookie che appare al primo accesso.
                      </p>
                      
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button 
                          className="bg-gradient-to-r from-[#00D1FF] to-[#7B2BF9] hover:opacity-90"
                          onClick={() => setLocation('/settings')}
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Vai alle Impostazioni
                        </Button>
                      </div>
                    </section>
                  </div>
                </div>
              )}

              {/* Document info */}
              {document && (
                <div className="mt-8 pt-6 border-t border-white/10">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm text-white/60 space-y-2 sm:space-y-0">
                    <div>
                      <p>Versione: {document.version}</p>
                      <p>Ultimo aggiornamento: {new Date(document.published_at).toLocaleDateString('it-IT')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-xs">© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Footer Actions */}
          <div className="text-center space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="outline" 
                className="border-white/20 text-white hover:bg-white/10"
                onClick={() => setLocation('/privacy-policy')}
              >
                <Shield className="w-4 h-4 mr-2" />
                Privacy Policy
              </Button>
              
              <Button 
                variant="outline" 
                className="border-white/20 text-white hover:bg-white/10"
                onClick={() => setLocation('/terms')}
              >
                <Info className="w-4 h-4 mr-2" />
                Termini di Servizio
              </Button>
            </div>
            
            <Button 
              className="bg-gradient-to-r from-[#00D1FF] to-[#7B2BF9] hover:opacity-90"
              onClick={() => setLocation('/')}
            >
              Torna alla Home
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CookiePolicy;
