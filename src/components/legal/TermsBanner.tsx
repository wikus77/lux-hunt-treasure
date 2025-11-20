// @ts-nocheck
// © 2025 M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Check, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

const TermsBanner: React.FC = () => {
  const { user } = useUnifiedAuth();
  const { toast } = useToast();
  const [location] = useLocation();
  const [showBanner, setShowBanner] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Only show banner on homepage and only once per user
    if (location === '/') {
      checkTermsConsent();
    }
  }, [user, location]);

  const checkTermsConsent = async () => {
    try {
      if (user) {
        // For authenticated users, check database
        const { data: consentData, error: consentError } = await supabase
          .from('user_consents')
          .select('terms_accepted')
          .eq('user_id', user.id)
          .single();

        if (consentError && consentError.code !== 'PGRST116') {
          console.error('Error loading terms consent:', consentError);
        }

        if (consentData?.terms_accepted) {
          console.log('📜 Terms already accepted, skipping banner');
          return;
        }
      } else {
        // For anonymous users, check localStorage
        const savedTermsConsent = localStorage.getItem('terms_accepted');
        
        if (savedTermsConsent === 'true') {
          console.log('📜 Terms already accepted (anonymous), skipping banner');
          return;
        }
      }

      // Show banner if no consent found
      console.log('📜 Showing terms banner for first time');
      setShowBanner(true);
    } catch (error) {
      console.error('Error checking terms consent:', error);
      setShowBanner(true);
    }
  };

  const handleAcceptTerms = async () => {
    setLoading(true);
    try {
      await saveTermsConsent(true);
      setShowBanner(false);
      
      toast({
        title: "📜 Termini accettati",
        description: "Benvenuto in M1SSION™! Buona fortuna, agente!"
      });
    } catch (error) {
      console.error('Error accepting terms:', error);
      toast({
        title: "❌ Errore",
        description: "Impossibile salvare il consenso. Riprova.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveTermsConsent = async (accepted: boolean) => {
    try {
      if (user) {
        // Save to database for authenticated users
        const { error } = await supabase
          .from('user_consents')
          .upsert({
            user_id: user.id,
            terms_accepted: accepted
          }, { onConflict: 'user_id' });

        if (error) throw error;

        console.log('📜 Terms consent saved to database');
      } else {
        // Save to localStorage for anonymous users
        localStorage.setItem('terms_accepted', accepted.toString());
        console.log('📜 Terms consent saved to localStorage');
      }
    } catch (error) {
      console.error('Error saving terms consent:', error);
      throw error;
    }
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-end md:items-center md:justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="w-full max-w-md"
        >
          <Card className="bg-gradient-to-br from-[#131524] to-[#1a1d3a] border-[#00D1FF]/30">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-white">
                <FileText className="w-5 h-5 mr-2 text-[#00D1FF]" />
                Termini di Gioco
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-white/80 text-sm">
                Accetta per partecipare a M1SSION™ e confermare di aver letto e compreso il Regolamento ufficiale.
              </p>
              
              <div className="flex flex-col space-y-2">
                <Button
                  onClick={handleAcceptTerms}
                  disabled={loading}
                  className="bg-gradient-to-r from-[#00D1FF] to-[#7B2BF9] hover:opacity-90"
                >
                  <Check className="w-4 h-4 mr-2" />
                  {loading ? 'Salvataggio...' : 'Accetta Termini'}
                </Button>
                
                <Button
                  onClick={() => window.open('/terms', '_blank')}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Leggi Regolamento
                </Button>
              </div>
              
              <p className="text-xs text-white/60 text-center">
                Consulta il{' '}
                <button 
                  onClick={() => window.open('/terms', '_blank')}
                  className="text-[#00D1FF] hover:underline"
                >
                  Regolamento completo
                </button>
                {' '}per tutti i dettagli
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TermsBanner;