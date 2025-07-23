// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Star, Zap, Shield, CheckCircle, Copy } from 'lucide-react';
import { useLocation } from 'wouter';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PostRegistrationFlowProps {
  agentCode?: string;
}

const PostRegistrationFlow: React.FC<PostRegistrationFlowProps> = ({ agentCode }) => {
  const [, setLocation] = useLocation();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, getCurrentUser } = useUnifiedAuth();

  useEffect(() => {
    const loadUserProfile = async () => {
      if (isAuthenticated) {
        const user = getCurrentUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          setUserProfile(profile);
        }
      }
      setLoading(false);
    };

    loadUserProfile();
  }, [isAuthenticated, getCurrentUser]);

  const handleChoosePlan = () => {
    const finalAgentCode = agentCode || userProfile?.agent_code;
    if (finalAgentCode) {
      localStorage.setItem('tempAgentCode', finalAgentCode);
    }
    setLocation('/choose-plan' + (finalAgentCode ? `?agent_code=${finalAgentCode}` : ''));
  };

  const handleCopyAgentCode = () => {
    const finalAgentCode = agentCode || userProfile?.agent_code;
    if (finalAgentCode) {
      navigator.clipboard.writeText(finalAgentCode);
      toast.success('Codice Agente copiato!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#131524] to-black flex items-center justify-center">
        <div className="text-white">Caricamento...</div>
      </div>
    );
  }

  const finalAgentCode = agentCode || userProfile?.agent_code;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#131524] to-black text-white p-4">
      <div className="max-w-2xl mx-auto py-8 space-y-6">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold">
            Benvenuto Agente <span className="text-cyan-400">{finalAgentCode}</span>!
          </h1>
          
          <p className="text-white/70 text-lg">
            La tua pre-registrazione è stata completata con successo.
            Ora scegli il piano che meglio si adatta al tuo stile di missione.
          </p>
        </motion.div>

        {/* Agent Code Display */}
        {finalAgentCode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-black/30 border border-cyan-500/30 p-6 text-center">
              <p className="text-white/70 text-sm mb-2">Il tuo Codice Agente:</p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl font-mono text-cyan-400 font-bold">
                  {finalAgentCode}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyAgentCode}
                  className="text-cyan-400 hover:text-cyan-300"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Mission Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 p-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <h3 className="text-xl font-bold text-white">Pre-registrazione Completata</h3>
            </div>
            
            <div className="space-y-3 text-center">
              <p className="text-green-400 font-semibold">✅ Codice Agente attivato</p>
              <p className="text-green-400 font-semibold">✅ 100 crediti gratuiti assegnati</p>
              <p className="text-green-400 font-semibold">✅ Accesso alla community M1SSION™</p>
            </div>
          </Card>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white/5 border border-white/20 p-6">
            <h3 className="text-xl font-bold text-white mb-4 text-center">
              Prossimi Passi
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-black font-bold text-sm">1</span>
                </div>
                <div>
                  <p className="text-white font-semibold">Scegli il tuo Piano</p>
                  <p className="text-white/70 text-sm">
                    Seleziona il piano di abbonamento che meglio si adatta alle tue esigenze di agente.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-black font-bold text-sm">2</span>
                </div>
                <div>
                  <p className="text-white font-semibold">Attendi il Lancio</p>
                  <p className="text-white/70 text-sm">
                    Le missioni inizieranno ufficialmente il 19 Agosto 2025 alle 07:00.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-black font-bold text-sm">3</span>
                </div>
                <div>
                  <p className="text-white font-semibold">Inizia a Cacciare</p>
                  <p className="text-white/70 text-sm">
                    Usa BUZZ per sbloccare aree e trova i premi nascosti nel mondo reale.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <Button
            onClick={handleChoosePlan}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-4 text-lg"
          >
            <Crown className="w-5 h-5 mr-2" />
            🚀 Scegli il tuo Piano Agente
          </Button>
          
          <Button
            onClick={() => setLocation('/how-it-works')}
            variant="outline"
            className="w-full border-white/20 text-white/80 hover:text-white hover:bg-white/10 py-3"
          >
            📖 Come Funziona M1SSION™
          </Button>
        </motion.div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center pt-6"
        >
          <p className="text-white/50 text-sm">
            © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default PostRegistrationFlow;