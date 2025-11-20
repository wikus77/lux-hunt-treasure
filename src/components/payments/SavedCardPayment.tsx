// @ts-nocheck
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ Saved Card Payment Component with Auto-Prefill

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { PaymentConfig } from '@/hooks/useStripeInAppPayment';
import AddCardDialog from './AddCardDialog';
import { useStripeMode } from '@/hooks/useStripeMode';
// 🔥 FIX CRITICO: Rimuovo import diretto per prevenire "getStripe is not defined"
// Uso dynamic import da stripeFallback che gestisce gli errori

interface SavedCard {
  id: string;
  stripe_pm_id: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
}

interface SavedCardPaymentProps {
  config: PaymentConfig;
  onSuccess: (paymentIntentId: string) => void;
  onCancel: () => void;
}

const SavedCardPayment: React.FC<SavedCardPaymentProps> = ({
  config,
  onSuccess,
  onCancel
}) => {
  const [savedCard, setSavedCard] = useState<SavedCard | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [useManualEntry, setUseManualEntry] = useState(false);
  const { user } = useAuthContext();
  const { mode: stripeMode, loading: modeLoading } = useStripeMode();

  // Load saved default card
  useEffect(() => {
    const loadDefaultCard = async () => {
      if (!user) return;

      try {
        console.log('🔍 M1SSION™ Loading default card for user:', user.id);
        
        const { data, error } = await supabase
          .from('user_payment_methods')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_default', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('❌ M1SSION™ Error loading saved card:', error);
          return;
        }

        if (data) {
          setSavedCard(data);
          console.log('✅ M1SSION™ Default card loaded:', { 
            brand: data.brand, 
            last4: data.last4 
          });
        } else {
          console.log('ℹ️ M1SSION™ No default card found');
        }
      } catch (error) {
        console.error('❌ M1SSION™ Error in loadDefaultCard:', error);
      }
    };

    loadDefaultCard();
  }, [user]);

  const processPaymentWithSavedCard = async () => {
    if (!savedCard || !user) return;

    setLoading(true);
    try {
      console.log('🚀 M1SSION™ Processing payment with saved card:', savedCard.stripe_pm_id);

      console.log('🔧 M1SSION™ Using Stripe mode:', stripeMode);

      // Call the correct edge function with the exact body format
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          amount: config.amount, // Already in cents
          currency: 'eur',
          payment_type: 'buzz_map',
          plan: 'one_time'
        }
      });

      if (error) {
        console.error('❌ M1SSION™ Payment error:', error);
        
        // Handle specific error codes
        if (error.code === 'not_authenticated' || error.message?.includes('401')) {
          toast.error('Devi accedere per usare questa funzione.');
          // TODO: Open login modal
          return;
        } else if (error.code === 'card_declined') {
          toast.error(`Carta rifiutata: ${error.message}`);
          return;
        } else {
          toast.error(`Errore pagamento: ${error.message || 'Errore sconosciuto'} (${error.code || 'unknown'})`);
          return;
        }
      }

      // Read client_secret from server response (always prefer client_secret over clientSecret)
      const clientSecret = data?.client_secret || data?.clientSecret;
      if (clientSecret && savedCard?.stripe_pm_id) {
        console.debug('✅ M1SSION™ Payment intent created:', {
          functionName: 'create-payment-intent',
          amount: config.amount,
          mode: data?.mode,
          paymentIntentId: data?.paymentIntentId || data?.payment_intent_id
        });
        
        // Use stripe.confirmCardPayment with saved payment method
        const stripe = await (await import('@/lib/stripeFallback')).getStripeSafe();
        if (!stripe) {
          throw new Error('Stripe non inizializzato');
        }
        
        const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: savedCard.stripe_pm_id
        });
        
        if (confirmError) {
          console.error('❌ M1SSION™ Stripe confirmation error:', confirmError);
          throw new Error(confirmError.message || 'Errore nella conferma del pagamento');
        }
        
        if (paymentIntent?.status === 'succeeded') {
          console.log('✅ M1SSION™ Payment succeeded');
          
          // Dispatch success event
          window.dispatchEvent(new CustomEvent('paymentIntentSucceeded', {
            detail: { paymentIntentId: paymentIntent.id }
          }));
          
          onSuccess(paymentIntent.id);
        } else if (paymentIntent?.status === 'requires_action') {
          console.log('🔄 M1SSION™ Payment requires additional action');
          toast.info('Autenticazione aggiuntiva richiesta');
        } else {
          throw new Error(`Stato pagamento non gestito: ${paymentIntent?.status}`);
        }
      } else if (data?.payment_intent_id) {
        console.log('✅ M1SSION™ Payment succeeded immediately');
        onSuccess(data.payment_intent_id);
      }
    } catch (error) {
      console.error('❌ M1SSION™ Payment processing error:', error);
      toast.error('Errore nel processare il pagamento');
    } finally {
      setLoading(false);
    }
  };

  const getCardIcon = (brand: string) => {
    const colors: Record<string, string> = {
      visa: 'bg-blue-600',
      mastercard: 'bg-red-600',
      amex: 'bg-green-600',
      discover: 'bg-orange-600',
      default: 'bg-gray-600'
    };
    
    return (
      <div className={`w-8 h-6 rounded ${colors[brand.toLowerCase()] || colors.default} flex items-center justify-center text-white text-xs font-bold`}>
        {brand.slice(0, 2).toUpperCase()}
      </div>
    );
  };

  const handleCardSaved = async (cardData: any) => {
    try {
      console.log('💳 M1SSION™ Saving new card:', cardData);
      
      // Save card to Supabase user_payment_methods
      const { data, error } = await supabase
        .from('user_payment_methods')
        .insert({
          user_id: user!.id,
          stripe_pm_id: cardData.stripeToken || `pm_${Math.random().toString(36).substring(2, 15)}`,
          brand: cardData.cardNumber?.charAt(0) === '4' ? 'visa' : 'mastercard',
          last4: cardData.cardNumber?.replace(/\s/g, '').slice(-4) || '0000',
          exp_month: parseInt(cardData.expiryMonth),
          exp_year: parseInt(cardData.expiryYear),
          is_default: cardData.saveForFuture || true
        });

      if (error) throw error;

      console.log('✅ M1SSION™ Card saved successfully');
      toast.success('Carta salvata con successo!');
      
      setShowAddCard(false);
      // Reload saved card
      window.location.reload();
    } catch (error) {
      console.error('❌ M1SSION™ Error saving card:', error);
      toast.error('Errore nel salvare la carta');
    }
  };

  if (showAddCard) {
    return (
      <AddCardDialog
        onClose={() => setShowAddCard(false)}
        onAddCard={handleCardSaved}
        loading={loading}
      />
    );
  }

  // If user chooses manual entry or no saved card, show fallback
  if (useManualEntry || !savedCard) {
    return (
      <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30 max-h-[85vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="text-center text-white">
            💳 {config.type === 'subscription' ? `Abbonamento ${config.plan}` : config.type === 'buzz_map' ? 'BUZZ MAPPA' : 'BUZZ Payment'}
          </CardTitle>
          <div className="text-center text-gray-300">
            <div className="text-xl font-bold">
              €{(config.amount / 100).toFixed(2)}
              {config.type === 'subscription' ? '/mese' : ''}
            </div>
            <div className="text-sm">{config.description}</div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-gray-400">
            <CreditCard className="w-12 h-12 mx-auto mb-3" />
            <p className="mb-4">Nessuna carta salvata trovata</p>
            <Button
              onClick={() => setShowAddCard(true)}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Aggiungi Carta
            </Button>
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Annulla
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30 max-h-[85vh] overflow-y-auto">
      <CardHeader>
        <CardTitle className="text-center text-white">
          💳 {config.type === 'subscription' ? `Abbonamento ${config.plan}` : config.type === 'buzz_map' ? 'BUZZ MAPPA' : 'BUZZ Payment'}
        </CardTitle>
        <div className="text-center text-gray-300">
          <div className="text-xl font-bold">
            €{(config.amount / 100).toFixed(2)}
            {config.type === 'subscription' ? '/mese' : ''}
          </div>
          <div className="text-sm">{config.description}</div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Saved Card Display */}
        <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getCardIcon(savedCard.brand)}
              <div>
                <div className="text-white font-medium">
                  **** **** **** {savedCard.last4}
                </div>
                <div className="text-gray-400 text-sm">
                  {savedCard.brand.charAt(0).toUpperCase() + savedCard.brand.slice(1)} • {savedCard.exp_month.toString().padStart(2, '0')}/{savedCard.exp_year.toString().slice(-2)}
                </div>
              </div>
            </div>
            <div className="text-green-400 text-sm font-medium">
              ✓ Predefinita
            </div>
          </div>
        </div>

        {/* Payment Actions */}
        <div className="space-y-3">
          <Button
            onClick={processPaymentWithSavedCard}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {loading ? 'Elaborazione...' : `Usa questa carta - €${(config.amount / 100).toFixed(2)}`}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setShowAddCard(true)}
            className="w-full"
            disabled={loading}
          >
            <Plus className="w-4 h-4 mr-2" />
            Usa altra carta
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1"
            disabled={loading}
          >
            Annulla
          </Button>
        </div>
        
        <div className="text-xs text-gray-400 text-center">
          🔒 Pagamento sicuro elaborato da Stripe
        </div>
      </CardContent>
    </Card>
  );
};

export default SavedCardPayment;

/*
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * M1SSION™ - Auto-Prefill Payment with Saved Cards
 */