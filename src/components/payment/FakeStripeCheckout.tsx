// @ts-nocheck
// 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
// 🚫 SECURITY: This component is DISABLED in production
// Use real Stripe checkout via Edge Function for paid subscriptions
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Lock, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useWouterNavigation } from '@/hooks/useWouterNavigation';
import { supabase } from '@/integrations/supabase/client';

// 🔐 SECURITY: Block in production
const IS_PRODUCTION = import.meta.env.PROD || import.meta.env.MODE === 'production';

interface FakeStripeCheckoutProps {
  planName: string;
  planPrice: string;
  planFeatures: string[];
}

const FakeStripeCheckout: React.FC<FakeStripeCheckoutProps> = ({ 
  planName, 
  planPrice, 
  planFeatures 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });
  const { toast } = useToast();
  const { navigate } = useWouterNavigation();

  // 🚫 PRODUCTION BLOCK: Show error and redirect
  useEffect(() => {
    if (IS_PRODUCTION) {
      console.error('🚫 FakeStripeCheckout is DISABLED in production');
      toast({
        title: "⚠️ Metodo non disponibile",
        description: "Usa il checkout Stripe ufficiale per gli abbonamenti.",
        variant: "destructive",
      });
      setTimeout(() => navigate('/subscriptions'), 1500);
    }
  }, []);

  // TASK B — FLUSSO handleUpgrade(tier)
  const handlePayment = async () => {
    // 🚫 SECURITY: Block fake payments entirely
    if (IS_PRODUCTION) {
      toast({
        title: "🚫 Non disponibile",
        description: "Questo metodo di pagamento è disabilitato. Usa Stripe.",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // 🔐 SECURITY: In dev mode, only allow creating FREE subscription via RPC
      console.warn('⚠️ DEV MODE: Creating free subscription only');
      
      const { data, error } = await supabase.rpc('create_free_subscription');
      if (error) {
        throw new Error(`Subscription creation failed: ${error.message}`);
      }

      // Save to localStorage for immediate sync
      const subscriptionData = {
        plan: 'Base',
        price: '€0',
        activatedAt: new Date().toISOString(),
        features: ['Accesso base']
      };
      
      localStorage.setItem('active_subscription', JSON.stringify(subscriptionData));
      localStorage.setItem('subscription_plan', 'Base');
      window.dispatchEvent(new Event('storage'));
      
      setIsProcessing(false);
      setIsSuccess(true);
      
      toast({
        title: "✅ Account creato!",
        description: "Piano Base attivato. Per upgrade, usa Stripe.",
      });

      // Redirect to /profile after success with badge update
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
      
    } catch (error) {
      console.error('Payment error:', error);
      setIsProcessing(false);
      toast({
        title: "❌ Errore",
        description: "Si è verificato un errore. Riprova.",
        variant: "destructive",
      });
    }
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Pagamento Completato!</h2>
        <p className="text-white/60">Piano {planName} attivato correttamente</p>
        <p className="text-sm text-white/40 mt-2">Reindirizzamento in corso...</p>
      </motion.div>
    );
  }

  return (
    <Card className="bg-white/5 border-white/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <CreditCard className="h-5 w-5" />
          Dettagli di Pagamento
        </CardTitle>
        <CardDescription className="text-white/60">
          Completa il pagamento per attivare il piano {planName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Plan Summary */}
        <div className="p-4 bg-white/5 rounded-lg">
          <h3 className="font-semibold text-white mb-2">Piano Selezionato: {planName}</h3>
          <p className="text-2xl font-bold text-primary mb-2">{planPrice}/mese</p>
          <ul className="space-y-1">
            {planFeatures.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm text-white/80">
                <CheckCircle className="h-3 w-3 text-green-500" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Payment Form - MOCK */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cardNumber" className="text-white">Numero Carta</Label>
            <Input
              id="cardNumber"
              placeholder="1234 5678 9012 3456"
              value={cardData.number}
              onChange={(e) => setCardData(prev => ({...prev, number: e.target.value}))}
              className="bg-white/5 border-white/20 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry" className="text-white">Scadenza</Label>
              <Input
                id="expiry"
                placeholder="MM/AA"
                value={cardData.expiry}
                onChange={(e) => setCardData(prev => ({...prev, expiry: e.target.value}))}
                className="bg-white/5 border-white/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvc" className="text-white">CVC</Label>
              <Input
                id="cvc"
                placeholder="123"
                value={cardData.cvc}
                onChange={(e) => setCardData(prev => ({...prev, cvc: e.target.value}))}
                className="bg-white/5 border-white/20 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardName" className="text-white">Nome sul Titolare</Label>
            <Input
              id="cardName"
              placeholder="Mario Rossi"
              value={cardData.name}
              onChange={(e) => setCardData(prev => ({...prev, name: e.target.value}))}
              className="bg-white/5 border-white/20 text-white"
            />
          </div>
        </div>

        {/* Security Notice */}
        <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
          <Lock className="h-4 w-4 text-green-500" />
          <p className="text-xs text-green-400">
            Pagamento sicuro protetto da crittografia SSL
          </p>
        </div>

        {/* Payment Button */}
        <Button
          onClick={handlePayment}
          disabled={isProcessing || !cardData.number || !cardData.expiry || !cardData.cvc || !cardData.name}
          className="w-full bg-primary hover:bg-primary/90 h-12"
        >
          {isProcessing ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="h-4 w-4 border-2 border-white border-t-transparent rounded-full"
            />
          ) : (
            `Procedi con il pagamento - ${planPrice}/mese`
          )}
        </Button>

        <p className="text-xs text-white/40 text-center">
          Questo è un pagamento simulato per scopi dimostrativi
        </p>
      </CardContent>
    </Card>
  );
};

export default FakeStripeCheckout;