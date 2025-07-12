// 🔐 BY JOSEPH MULE — Capacitor iOS Compatible
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { useProfileSubscription } from '@/hooks/profile/useProfileSubscription';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CreditCard, Plus, Trash2, Crown, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import AddCardDialog from '@/components/payments/AddCardDialog';

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
}

const PaymentSettings: React.FC = () => {
  const { user } = useAuth();
  const { subscription } = useProfileSubscription();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  useEffect(() => {
    loadPaymentMethods();
  }, [user]);

  const loadPaymentMethods = async () => {
    if (!user) return;

    try {
      const { data: methods } = await supabase
        .from('user_payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      setPaymentMethods(methods || []);
    } catch (error) {
      console.error('Error loading payment methods:', error);
    }
  };

  const addNewPaymentMethod = async (cardData: {
    cardNumber: string;
    expiryMonth: string;
    expiryYear: string;
    cvc: string;
    nameOnCard: string;
  }) => {
    if (!user) return;

    setLoading(true);
    try {
      // Extract card brand from number (mock logic)
      const firstDigit = cardData.cardNumber.replace(/\s/g, '')[0];
      const brand = firstDigit === '4' ? 'Visa' : firstDigit === '5' ? 'Mastercard' : 'Visa';
      
      const newMethod = {
        brand,
        last4: cardData.cardNumber.replace(/\s/g, '').slice(-4),
        exp_month: parseInt(cardData.expiryMonth),
        exp_year: parseInt(cardData.expiryYear),
        is_default: paymentMethods.length === 0
      };

      const { data, error } = await supabase
        .from('user_payment_methods')
        .insert({
          user_id: user.id,
          ...newMethod,
          stripe_pm_id: `pm_${Math.random().toString(36).substring(2, 15)}`
        })
        .select()
        .single();

      if (error) throw error;

      await loadPaymentMethods();
      
      toast({
        title: "✅ Carta aggiunta con successo",
        description: `${brand} ••••${newMethod.last4} è stata salvata correttamente.`
      });
    } catch (error) {
      console.error('Error adding payment method:', error);
      toast({
        title: "❌ Errore aggiunta carta",
        description: "Impossibile aggiungere il metodo di pagamento. Riprova.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const removePaymentMethod = async (methodId: string) => {
    if (!user) return;

    setLoading(true);
    try {
      await supabase
        .from('user_payment_methods')
        .delete()
        .eq('id', methodId)
        .eq('user_id', user.id);

      await loadPaymentMethods();
      
      toast({
        title: "✅ Carta rimossa",
        description: "Il metodo di pagamento è stato rimosso con successo."
      });
    } catch (error) {
      console.error('Error removing payment method:', error);
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
      // Remove default from all methods
      await supabase
        .from('user_payment_methods')
        .update({ is_default: false })
        .eq('user_id', user.id);

      // Set new default
      await supabase
        .from('user_payment_methods')
        .update({ is_default: true })
        .eq('id', methodId)
        .eq('user_id', user.id);

      await loadPaymentMethods();
      
      toast({
        title: "✅ Carta predefinita aggiornata",
        description: "Il metodo di pagamento predefinito è stato modificato."
      });
    } catch (error) {
      console.error('Error setting default payment method:', error);
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
      'Base': { label: 'Starter', color: 'bg-gray-600', price: 'Gratuito' },
      'Silver': { label: 'Elite', color: 'bg-gray-400', price: '€2.99/mese' },
      'Gold': { label: 'Elite+', color: 'bg-yellow-500', price: '€6.99/mese' },
      'Black': { label: 'M1SSION+', color: 'bg-black border border-white', price: '€14.99/mese' }
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
            <Crown className="w-5 h-5 mr-2" />
            Piano Attuale
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Badge className={`${currentPlan.color} text-white`}>
                  {currentPlan.label}
                </Badge>
                <span className="text-white font-semibold">{currentPlan.price}</span>
              </div>
              <p className="text-white/70 text-sm">
                Piano {currentPlan.plan} • Rinnovo automatico
              </p>
            </div>
            <Button
              onClick={() => navigate('/subscriptions')}
              variant="outline"
              className="border-[#00D1FF]/50 text-[#00D1FF] hover:bg-[#00D1FF]/10"
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
            <AddCardDialog onAddCard={addNewPaymentMethod} loading={loading} />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentMethods.length > 0 ? (
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-white/10"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-6 bg-white rounded flex items-center justify-center">
                      <span className="text-black text-xs font-bold">
                        {method.brand.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        •••• •••• •••• {method.last4}
                      </p>
                      <p className="text-white/70 text-sm">
                        Scade {method.exp_month.toString().padStart(2, '0')}/{method.exp_year}
                        {method.is_default && (
                          <Badge className="ml-2 bg-green-600 text-white text-xs">
                            Predefinita
                          </Badge>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {!method.is_default && (
                      <Button
                        onClick={() => setDefaultPaymentMethod(method.id)}
                        disabled={loading}
                        size="sm"
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10 text-xs"
                      >
                        Imposta predefinita
                      </Button>
                    )}
                    
                    {paymentMethods.length > 1 && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                            disabled={loading}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-black/90 border-red-500/20">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">Rimuovi Carta</AlertDialogTitle>
                            <AlertDialogDescription className="text-white/70">
                              Sei sicuro di voler rimuovere questa carta di credito? 
                              Questa azione non può essere annullata.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-white/10 text-white border-white/20">
                              Annulla
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => removePaymentMethod(method.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Rimuovi Carta
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 text-white/30 mx-auto mb-4" />
              <p className="text-white/70 mb-4">Nessun metodo di pagamento salvato</p>
              <AddCardDialog onAddCard={addNewPaymentMethod} loading={loading}>
                <Button
                  disabled={loading}
                  className="bg-[#00D1FF] hover:bg-[#00B8E6] text-black"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Aggiungi Prima Carta
                </Button>
              </AddCardDialog>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment History Link */}
      <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
        <CardContent className="pt-6">
          <Button
            onClick={() => navigate('/profile/payments')}
            variant="outline"
            className="w-full border-white/20 text-white hover:bg-white/10"
          >
            <Settings className="w-4 h-4 mr-2" />
            Visualizza Cronologia Pagamenti
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PaymentSettings;