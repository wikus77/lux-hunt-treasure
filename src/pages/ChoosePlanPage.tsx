// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Crown, Star, Zap, Shield } from 'lucide-react';
import { useStripeInAppPayment } from '@/hooks/useStripeInAppPayment';
import { useUserSyncContext } from '@/components/user/UserSyncProvider';
import { toast } from 'sonner';
import StripeInAppCheckout from '@/components/subscription/StripeInAppCheckout';

interface PlanFeature {
  name: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  currency: string;
  icon: React.ReactNode;
  popular?: boolean;
  features: PlanFeature[];
  description: string;
  earlyAccessHours: number;
}

const ChoosePlanPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const [selectedPlan, setSelectedPlan] = useState<string>('Silver');
  const [agentCode, setAgentCode] = useState<string>('');
  
  const { 
    showCheckout, 
    paymentConfig, 
    processSubscription, 
    closeCheckout, 
    handlePaymentSuccess,
    loading 
  } = useStripeInAppPayment();
  
  const { handlePlanUpgrade, logAction } = useUserSyncContext();

  useEffect(() => {
    // Estrai agent code dall'URL o localStorage
    const params = new URLSearchParams(window.location.search);
    const codeFromUrl = params.get('agent_code');
    const codeFromStorage = localStorage.getItem('tempAgentCode');
    
    const code = codeFromUrl || codeFromStorage || 'AG-XXXX';
    setAgentCode(code);
    
    // Log della visualizzazione pagina
    logAction('choose_plan_viewed', {
      agent_code: code,
      source: codeFromUrl ? 'url' : 'storage'
    });
  }, [logAction]);

  const plans: Plan[] = [
    {
      id: 'Base',
      name: 'Base',
      price: 0,
      currency: 'EUR',
      icon: <Shield className="w-6 h-6" />,
      description: 'Accesso base alle missioni',
      earlyAccessHours: 0,
      features: [
        { name: '1 indizio per missione', included: true },
        { name: 'Accesso alle missioni pubbliche', included: true },
        { name: 'Supporto community', included: true },
        { name: 'Accesso anticipato', included: false },
        { name: 'Strumenti Intelligence', included: false },
        { name: 'BUZZ Map premium', included: false }
      ]
    },
    {
      id: 'Silver',
      name: 'Silver',
      price: 3.99,
      currency: 'EUR',
      icon: <Star className="w-6 h-6" />,
      description: 'Esperienza potenziata con vantaggi esclusivi',
      earlyAccessHours: 2,
      features: [
        { name: '3 indizi per missione', included: true },
        { name: 'Accesso anticipato 2h', included: true },
        { name: 'BUZZ Map base', included: true },
        { name: 'Supporto priority', included: true },
        { name: 'Strumenti Intelligence avanzati', included: false },
        { name: 'Premi esclusivi', included: false }
      ]
    },
    {
      id: 'Gold',
      name: 'Gold',
      price: 7.99,
      currency: 'EUR',
      icon: <Crown className="w-6 h-6" />,
      popular: true,
      description: 'Il piano più popolare per agenti seri',
      earlyAccessHours: 24,
      features: [
        { name: '5 indizi per missione', included: true },
        { name: 'Accesso anticipato 24h', included: true },
        { name: 'BUZZ Map premium', included: true },
        { name: 'Strumenti Intelligence', included: true },
        { name: 'Supporto VIP', included: true },
        { name: 'Badge esclusivo', included: true }
      ]
    },
    {
      id: 'Black',
      name: 'Black',
      price: 12.99,
      currency: 'EUR',
      icon: <Zap className="w-6 h-6" />,
      description: 'Accesso elite con vantaggi massimi',
      earlyAccessHours: 48,
      features: [
        { name: '10 indizi per missione', included: true },
        { name: 'Accesso anticipato 48h', included: true },
        { name: 'BUZZ Map illimitato', included: true },
        { name: 'Tutti gli strumenti Intelligence', included: true },
        { name: 'Supporto dedicato', included: true },
        { name: 'Premi esclusivi Black', included: true }
      ]
    },
    {
      id: 'Titanium',
      name: 'Titanium',
      price: 19.99,
      currency: 'EUR',
      icon: <Crown className="w-6 h-6 text-purple-400" />,
      description: 'Esperienza definitiva per agenti elite',
      earlyAccessHours: 72,
      features: [
        { name: 'Indizi illimitati', included: true },
        { name: 'Accesso anticipato 72h', included: true },
        { name: 'BUZZ Map premium illimitato', included: true },
        { name: 'Strumenti Intelligence elite', included: true },
        { name: 'Supporto VIP 24/7', included: true },
        { name: 'Premi esclusivi Titanium', included: true }
      ]
    }
  ];

  const handlePlanSelection = async (planId: string) => {
    if (planId === 'Base') {
      try {
        await handlePlanUpgrade('Base');
        toast.success('Piano Base attivato!');
        setLocation('/home');
      } catch (error) {
        toast.error('Errore durante l\'attivazione del piano Base');
      }
      return;
    }

    await logAction('plan_selection_attempted', { 
      plan: planId,
      agent_code: agentCode 
    });

    try {
      await processSubscription(planId);
      
      await logAction('plan_payment_initiated', { 
        plan: planId,
        agent_code: agentCode 
      });
      
    } catch (error) {
      console.error('Errore durante il pagamento:', error);
      toast.error('Errore durante il processo di pagamento');
      
      await logAction('plan_payment_failed', { 
        plan: planId,
        agent_code: agentCode,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const handlePaymentComplete = async (paymentIntentId: string) => {
    try {
      await handlePaymentSuccess(paymentIntentId);
      
      await logAction('plan_payment_completed', { 
        plan: paymentConfig?.plan,
        agent_code: agentCode,
        payment_intent_id: paymentIntentId
      });

      toast.success(`🎉 Piano ${paymentConfig?.plan} attivato con successo!`);
      
      // Reindirizza alla home dopo un breve delay
      setTimeout(() => {
        setLocation('/home');
      }, 2000);
      
    } catch (error) {
      console.error('Errore durante la finalizzazione del pagamento:', error);
      toast.error('Errore durante la finalizzazione del pagamento');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#131524] to-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation('/')}
          className="text-white/70 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="text-center">
          <h1 className="text-xl font-bold">Scegli il tuo Piano</h1>
          <p className="text-sm text-white/70">Agente {agentCode}</p>
        </div>
        <div className="w-10" />
      </div>

      {/* Welcome Message */}
      <motion.div 
        className="p-6 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold mb-2">
          Benvenuto Agente <span className="text-cyan-400">{agentCode}</span>!
        </h2>
        <p className="text-white/70">
          Scegli il piano che meglio si adatta al tuo stile di gioco
        </p>
      </motion.div>

      {/* Plans Grid */}
      <div className="px-4 pb-6 space-y-4">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              className={`relative p-4 cursor-pointer transition-all border-2 ${
                selectedPlan === plan.id 
                  ? 'border-cyan-400 bg-cyan-400/10' 
                  : 'border-white/20 bg-white/5'
              } ${plan.popular ? 'ring-2 ring-yellow-400/50' : ''}`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {plan.popular && (
                <Badge className="absolute -top-2 left-4 bg-yellow-400 text-black">
                  Più Popolare
                </Badge>
              )}
              
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-lg">
                    {plan.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{plan.name}</h3>
                    <p className="text-sm text-white/70">{plan.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {plan.price === 0 ? 'Gratis' : `€${plan.price}`}
                  </div>
                  {plan.price > 0 && (
                    <div className="text-sm text-white/70">/mese</div>
                  )}
                </div>
              </div>

              {plan.earlyAccessHours > 0 && (
                <div className="mb-3 p-2 bg-green-500/20 rounded-lg border border-green-500/30">
                  <p className="text-sm text-green-400 font-semibold">
                    🚀 Accesso anticipato: {plan.earlyAccessHours}h prima
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-2 mb-4">
                {plan.features.map((feature, featureIndex) => (
                  <div 
                    key={featureIndex}
                    className={`flex items-center gap-2 text-sm ${
                      feature.included ? 'text-white' : 'text-white/50'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${
                      feature.included ? 'bg-green-400' : 'bg-white/30'
                    }`} />
                    {feature.name}
                  </div>
                ))}
              </div>

              {selectedPlan === plan.id && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlanSelection(plan.id);
                  }}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                >
                  {loading ? 'Elaborazione...' : 
                   plan.price === 0 ? 'Attiva Piano Gratuito' : 'Scegli questo Piano'}
                </Button>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Stripe Checkout Modal */}
      {showCheckout && paymentConfig && (
        <StripeInAppCheckout
          config={paymentConfig}
          onSuccess={handlePaymentComplete}
          onCancel={closeCheckout}
        />
      )}
    </div>
  );
};

export default ChoosePlanPage;