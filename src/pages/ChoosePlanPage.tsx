// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Crown, Zap, Shield, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useProfileSubscription } from '@/hooks/profile/useProfileSubscription';
import { useStripeInAppPayment } from '@/hooks/useStripeInAppPayment';
import StripeInAppCheckout from '@/components/subscription/StripeInAppCheckout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';

const plans = [
  {
    id: 'Silver',
    name: 'Silver',
    price: '3.99',
    icon: <Shield className="w-8 h-8" />,
    earlyAccess: '2 ore prima',
    features: [
      'Tutti i vantaggi Base',
      '3 indizi premium aggiuntivi a settimana',
      'Accesso anticipato di 2 ore agli eventi',
      'Badge Silver nel profilo'
    ],
    color: 'from-slate-400 to-slate-600'
  },
  {
    id: 'Gold',
    name: 'Gold',
    price: '6.99',
    icon: <Crown className="w-8 h-8" />,
    earlyAccess: '12 ore prima',
    features: [
      'Tutti i vantaggi Silver',
      '4 indizi premium aggiuntivi a settimana',
      'Accesso anticipato di 12 ore agli eventi',
      'Partecipazione alle estrazioni Gold',
      'Badge Gold esclusivo nel profilo'
    ],
    popular: true,
    color: 'from-yellow-400 to-yellow-600'
  },
  {
    id: 'Black',
    name: 'Black',
    price: '9.99',
    icon: <Zap className="w-8 h-8" />,
    earlyAccess: '24 ore prima',
    features: [
      'Tutti i vantaggi Gold',
      'Accesso VIP anticipato di 24 ore agli eventi',
      '5 indizi premium aggiuntivi a settimana',
      'Badge Black esclusivo'
    ],
    color: 'from-gray-800 to-black'
  },
  {
    id: 'Titanium',
    name: 'Titanium',
    price: '29.99',
    icon: <Star className="w-8 h-8" />,
    earlyAccess: '48 ore prima',
    features: [
      'Tutti i vantaggi Black',
      '5 indizi premium aggiuntivi a settimana',
      'Accesso VIP anticipato di 48 ore agli eventi',
      'Supporto prioritario dedicato (24/7)',
      'Eventi esclusivi M1SSION™',
      'Badge Titanium esclusivo'
    ],
    premium: true,
    color: 'from-purple-400 to-purple-600'
  }
];

const ChoosePlanPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { getCurrentUser } = useUnifiedAuth();
  
  // 🚀 ADMIN BYPASS - Redirect admin immediately
  React.useEffect(() => {
    const user = getCurrentUser();
    if (user?.email === 'wikus77@hotmail.it') {
      console.log('🚀 ADMIN DETECTED in ChoosePlan - Redirecting to /home');
      setLocation('/home');
      return;
    }
  }, [getCurrentUser, setLocation]);
  
  const { 
    processSubscription, 
    showCheckout,
    paymentConfig, 
    closeCheckout, 
    handlePaymentSuccess 
  } = useStripeInAppPayment();
  
  const handlePlanSelection = async (planId: string) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    setSelectedPlan(planId);
    
    try {
      console.log('🛒 M1SSION™ Aprendo checkout in-app per piano:', planId);
      
      // Save selected plan to Supabase profiles
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ subscription_plan: planId })
          .eq('id', user.id);
      }
      
      // Process subscription with in-app Stripe modal
      await processSubscription(planId);
      
      console.log('✅ M1SSION™ Checkout modal aperto per piano:', planId);
      toast.success('Checkout aperto - completa il pagamento');
      
    } catch (error) {
      console.error('❌ Errore durante selezione piano:', error);
      toast.error('Errore durante la selezione del piano');
      setIsProcessing(false);
      setSelectedPlan('');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-red-500 bg-clip-text text-transparent">
            Scegli il Tuo Piano M1SSION™
          </h1>
          <p className="text-xl text-gray-300">
            Seleziona il piano di abbonamento per accedere alla missione
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: plans.indexOf(plan) * 0.1 }}
              className="relative"
            >
              <Card className={`bg-gray-900 border-gray-700 h-full ${
                plan.popular ? 'border-yellow-500 border-2' : 
                plan.premium ? 'border-purple-500 border-2' : ''
              }`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black">
                    Più Popolare
                  </Badge>
                )}
                {plan.premium && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white">
                    Premium
                  </Badge>
                )}
                
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center text-white`}>
                    {plan.icon}
                  </div>
                  <CardTitle className="text-2xl text-white">{plan.name}</CardTitle>
                  <CardDescription className="text-gray-400">
                    {plan.earlyAccess}
                  </CardDescription>
                  <div className="text-3xl font-bold text-white">
                    €{plan.price}
                    <span className="text-sm text-gray-400">/mese</span>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-gray-300">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                      {feature}
                    </div>
                  ))}
                  
                  <Button
                    onClick={() => handlePlanSelection(plan.id)}
                    disabled={isProcessing}
                    className={`w-full mt-6 ${
                      selectedPlan === plan.id ? 'opacity-50' : ''
                    } ${
                      plan.popular ? 'bg-yellow-500 hover:bg-yellow-600 text-black' :
                      plan.premium ? 'bg-purple-500 hover:bg-purple-600' :
                      'bg-white text-black hover:bg-gray-200'
                    }`}
                  >
                    {selectedPlan === plan.id ? 'Elaborazione...' : 'Seleziona Piano'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Footer Info */}
        <div className="text-center text-gray-400">
          <p className="mb-4">
            Tutti i piani includono accesso completo al gioco e indizi in base al piano di abbonamento scelto
          </p>
          <p className="text-sm">
            Puoi cancellare o modificare il tuo piano in qualsiasi momento
          </p>
        </div>
      </motion.div>

      {/* Stripe In-App Checkout Modal */}
      {showCheckout && paymentConfig && (
        <StripeInAppCheckout
          config={paymentConfig}
          onSuccess={(paymentIntentId) => {
            handlePaymentSuccess(paymentIntentId);
            setIsProcessing(false);
            setSelectedPlan('');
            // Redirect to verification page to handle race condition
            setTimeout(() => {
              setLocation('/subscription-verify');
            }, 500);
          }}
          onCancel={() => {
            closeCheckout();
            setIsProcessing(false);
            setSelectedPlan('');
          }}
        />
      )}
    </div>
  );
};

export default ChoosePlanPage;