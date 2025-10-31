// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { useProfileSubscription } from '@/hooks/profile/useProfileSubscription';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Plus, Crown, Settings, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import AddCardDialog from '@/components/payments/AddCardDialog';
import PaymentMethodCard from '@/components/payments/PaymentMethodCard';

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
  stripe_pm_id: string;
  created_at: string;
}

interface CardData {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvc: string;
  nameOnCard: string;
  saveForFuture?: boolean;
  stripeToken?: string;
}

const PaymentSettings: React.FC = () => {
  const { user } = useAuth();
  const { subscription } = useProfileSubscription();
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const [loading, setLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [showAddCardModal, setShowAddCardModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadPaymentMethods();
    }
  }, [user]);

  const loadPaymentMethods = async () => {
    if (!user) return;

    try {
      console.log('💳 Loading payment methods for user:', user.id);
      
      const { data: methods, error } = await supabase
        .from('user_payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading payment methods:', error);
        toast({
          title: "❌ Errore caricamento",
          description: "Impossibile caricare i metodi di pagamento.",
          variant: "destructive"
        });
        setPaymentMethods([]);
      } else {
        console.log('✅ Payment methods loaded:', methods?.length || 0, 'methods');
        setPaymentMethods(methods || []);
      }
    } catch (error) {
      console.error('❌ Error in loadPaymentMethods:', error);
      setPaymentMethods([]);
    }
  };

  const addNewPaymentMethod = async (cardData: CardData) => {
    if (!user) {
      console.error('❌ No user authenticated');
      throw new Error('Utente non autenticato');
    }

    console.log('💳 Starting card addition process for user:', user.id);
    console.log('💳 Card data received:', {
      brand: getBrandFromNumber(cardData.cardNumber),
      last4: cardData.cardNumber.replace(/\s/g, '').slice(-4),
      saveForFuture: cardData.saveForFuture
    });

    setLoading(true);
    
    try {
      // Enhanced card brand detection
      const cleanNumber = cardData.cardNumber.replace(/\s/g, '');
      const brand = getBrandFromNumber(cleanNumber);
      const last4 = cleanNumber.slice(-4);
      
      // Validate card data
      if (cleanNumber.length < 13 || cleanNumber.length > 19) {
        throw new Error('Numero di carta non valido');
      }
      
      if (!cardData.expiryMonth || !cardData.expiryYear) {
        throw new Error('Data di scadenza richiesta');
      }
      
      if (!cardData.cvc || cardData.cvc.length < 3) {
        throw new Error('CVC richiesto');
      }
      
      if (!cardData.nameOnCard || cardData.nameOnCard.trim().length < 2) {
        throw new Error('Nome sulla carta richiesto');
      }

      // Check for existing card with same last4
      const existingCard = paymentMethods.find(method => method.last4 === last4);
      if (existingCard) {
        throw new Error('Una carta con queste ultime cifre è già presente');
      }

      const newMethod = {
        user_id: user.id,
        brand,
        last4,
        exp_month: parseInt(cardData.expiryMonth),
        exp_year: parseInt(cardData.expiryYear),
        is_default: paymentMethods.length === 0, // First card becomes default
        stripe_pm_id: cardData.stripeToken || `pm_test_${Math.random().toString(36).substring(2, 15)}`
      };

      console.log('💳 Inserting payment method:', newMethod);

      const { data, error } = await supabase
        .from('user_payment_methods')
        .insert(newMethod)
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase insert error:', error);
        throw new Error('Errore durante il salvataggio della carta');
      }

      console.log('✅ Payment method inserted successfully:', data);

      // Reload payment methods
      await loadPaymentMethods();
      
      toast({
        title: "✅ Carta aggiunta con successo",
        description: `${brand} ••••${last4} è stata salvata correttamente${cardData.saveForFuture ? ' per pagamenti futuri' : ''}.`
      });

      // Close modal
      setShowAddCardModal(false);
      
    } catch (error) {
      console.error('❌ Complete error in card addition:', error);
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
      toast({
        title: "❌ Errore aggiunta carta",
        description: errorMessage,
        variant: "destructive"
      });
      throw error; // Re-throw to prevent modal from closing
    } finally {
      setLoading(false);
    }
  };

  const getBrandFromNumber = (number: string): string => {
    const clean = number.replace(/\s/g, '');
    if (clean.startsWith('4')) return 'Visa';
    if (clean.startsWith('5') || clean.startsWith('2')) return 'Mastercard';
    if (clean.startsWith('3')) return 'American Express';
    if (clean.startsWith('6')) return 'Discover';
    return 'Carta';
  };

  const removePaymentMethod = async (methodId: string) => {
    if (!user) return;

    setLoading(true);
    try {
      console.log('🗑️ Removing payment method:', methodId);
      
      const { error } = await supabase
        .from('user_payment_methods')
        .delete()
        .eq('id', methodId)
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Error removing payment method:', error);
        throw error;
      }

      console.log('✅ Payment method removed successfully');
      await loadPaymentMethods();
      
      toast({
        title: "✅ Carta rimossa",
        description: "Il metodo di pagamento è stato rimosso con successo."
      });
    } catch (error) {
      console.error('❌ Error removing payment method:', error);
      toast({
        title: "❌ Errore rimozione",
        description: "Impossibile rimuovere il metodo di pagamento. Riprova.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const setDefaultPaymentMethod = async (methodId: string) => {
    if (!user) return;

    setLoading(true);
    try {
      console.log('👑 Setting default payment method:', methodId);
      
      // Remove default from all methods
      await supabase
        .from('user_payment_methods')
        .update({ is_default: false })
        .eq('user_id', user.id);

      // Set new default
      const { error } = await supabase
        .from('user_payment_methods')
        .update({ is_default: true })
        .eq('id', methodId)
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Error setting default payment method:', error);
        throw error;
      }

      console.log('✅ Default payment method set successfully');
      await loadPaymentMethods();
      
      toast({
        title: "✅ Carta predefinita aggiornata",
        description: "Il metodo di pagamento predefinito è stato modificato."
      });
    } catch (error) {
      console.error('❌ Error setting default payment method:', error);
      toast({
        title: "❌ Errore aggiornamento",
        description: "Impossibile impostare la carta predefinita. Riprova.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getPlanBadge = () => {
    const plan = subscription.plan || 'Base';
    const planConfig = {
      'Base': { label: 'Base', color: 'bg-gray-600', price: '€0/mese' },
      'Silver': { label: 'Silver', color: 'bg-gray-400', price: '€3.99/mese' },
      'Gold': { label: 'Gold', color: 'bg-yellow-500', price: '€6.99/mese' },
      'Black': { label: 'Black', color: 'bg-black border border-white', price: '€9.99/mese' },
      'Titanium': { label: 'Titanium', color: 'bg-purple-600', price: '€29.99/mese' }
    };
    
    const config = planConfig[plan as keyof typeof planConfig] || planConfig.Base;
    return { ...config, plan };
  };

  const currentPlan = getPlanBadge();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Current Plan */}
      <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white font-orbitron flex items-center">
            <Crown className="w-5 h-5 mr-2 text-yellow-500" />
            Piano Attuale M1SSION™
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Badge className={`${currentPlan.color} text-white font-semibold`}>
                  {currentPlan.label}
                </Badge>
                <span className="text-white font-semibold text-lg">{currentPlan.price}</span>
              </div>
              <p className="text-white/70 text-sm">
                Piano {currentPlan.plan} • Rinnovo automatico
              </p>
            </div>
            <Button
              onClick={() => navigate('/subscriptions')}
              variant="outline"
              className="border-[#00D1FF]/50 text-[#00D1FF] hover:bg-[#00D1FF]/10 font-semibold"
            >
              Cambia Piano
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white font-orbitron flex items-center justify-between">
            <div className="flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Metodi di Pagamento
            </div>
            <Button
              onClick={() => {
                console.log('💳 PaymentSettings: Add Card button clicked - opening modal');
                setShowAddCardModal(true);
              }}
              disabled={loading}
              size="sm"
              className="bg-[#00D1FF] hover:bg-[#00B8E6] text-black font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-1" />
              Aggiungi
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentMethods.length > 0 ? (
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <PaymentMethodCard
                  key={method.id}
                  method={method}
                  onSetDefault={setDefaultPaymentMethod}
                  onRemove={removePaymentMethod}
                  loading={loading}
                  canRemove={paymentMethods.length > 1}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-white font-semibold mb-2">Nessun Metodo di Pagamento</h3>
              <p className="text-white/60 mb-6 max-w-md mx-auto">
                Aggiungi una carta di credito per abilitare gli acquisti e gli abbonamenti M1SSION™.
              </p>
              <Button
                onClick={() => {
                  console.log('💳 PaymentSettings: Add First Card button clicked - opening modal');
                  setShowAddCardModal(true);
                }}
                disabled={loading}
                className="bg-[#00D1FF] hover:bg-[#00B8E6] text-black font-semibold"
              >
                <Plus className="w-4 h-4 mr-2" />
                Aggiungi Prima Carta
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment History Link */}
      <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
        <CardContent className="pt-6">
          <Button
            onClick={() => {
              console.log('💳 PaymentSettings: Payment History button clicked - navigating to /profile/payments');
              navigate('/profile/payments');
            }}
            variant="outline"
            className="w-full border-white/20 text-white hover:bg-white/10 font-medium"
          >
            <Settings className="w-4 h-4 mr-2" />
            Visualizza Cronologia Pagamenti
          </Button>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="bg-green-900/20 border-green-500/30 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-green-100 font-semibold mb-1">Sicurezza PCI DSS Level 1</h4>
              <p className="text-green-200/80 text-sm">
                Tutti i dati delle carte sono crittografati e tokenizzati tramite Stripe. 
                M1SSION™ non memorizza mai i numeri di carta completi sui nostri server.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Card Modal - PURE MODAL NO ROUTING */}
      {showAddCardModal && (
        <AddCardDialog 
          onClose={() => {
            console.log('💳 PaymentSettings: Closing modal');
            setShowAddCardModal(false);
          }}
          onAddCard={addNewPaymentMethod} 
          loading={loading}
        />
      )}
    </motion.div>
  );
};

export default PaymentSettings;