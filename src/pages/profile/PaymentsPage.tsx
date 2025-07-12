// FILE CREATO — BY JOSEPH MULE
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Plus, Trash2, Shield, Calendar, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import BottomNavigation from '@/components/layout/BottomNavigation';

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
}

export const PaymentsPage: React.FC = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load payment methods
  useEffect(() => {
    const loadPaymentMethods = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('user_payment_methods')
          .select('*')
          .eq('user_id', user.id)
          .order('is_default', { ascending: false });

        if (error) {
          console.error('Error loading payment methods:', error);
          toast.error('Errore nel caricamento dei metodi di pagamento');
          return;
        }

        setPaymentMethods(data || []);
      } catch (err) {
        console.error('Error:', err);
        toast.error('Errore di connessione');
      } finally {
        setLoading(false);
      }
    };

    loadPaymentMethods();
  }, [user]);

  const handleAddPaymentMethod = () => {
    toast.info('Funzionalità in arrivo - Integrazione Stripe');
  };

  const handleDeletePaymentMethod = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_payment_methods')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) {
        console.error('Error deleting payment method:', error);
        toast.error('Errore nella rimozione del metodo di pagamento');
        return;
      }

      setPaymentMethods(prev => prev.filter(pm => pm.id !== id));
      toast.success('Metodo di pagamento rimosso');
    } catch (err) {
      console.error('Error:', err);
      toast.error('Errore di connessione');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      // Set all as non-default first
      await supabase
        .from('user_payment_methods')
        .update({ is_default: false })
        .eq('user_id', user?.id);

      // Set selected as default
      const { error } = await supabase
        .from('user_payment_methods')
        .update({ is_default: true })
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) {
        console.error('Error setting default payment method:', error);
        toast.error('Errore nell\'impostazione del metodo predefinito');
        return;
      }

      // Update local state
      setPaymentMethods(prev => 
        prev.map(pm => ({ ...pm, is_default: pm.id === id }))
      );
      toast.success('Metodo predefinito aggiornato');
    } catch (err) {
      console.error('Error:', err);
      toast.error('Errore di connessione');
    }
  };

  const getCardIcon = (brand: string) => {
    const iconClass = "w-8 h-8";
    switch (brand.toLowerCase()) {
      case 'visa':
        return <div className={`${iconClass} bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold`}>VISA</div>;
      case 'mastercard':
        return <div className={`${iconClass} bg-red-600 rounded flex items-center justify-center text-white text-xs font-bold`}>MC</div>;
      case 'amex':
        return <div className={`${iconClass} bg-green-600 rounded flex items-center justify-center text-white text-xs font-bold`}>AMEX</div>;
      default:
        return <CreditCard className={`${iconClass} text-gray-400`} />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-[#00D1FF] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <motion.div 
      className="bg-gradient-to-b from-[#131524]/70 to-black w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ 
        height: '100dvh',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Fixed Header */}
      <header 
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          height: '72px',
          paddingTop: 'env(safe-area-inset-top, 47px)',
          background: 'rgba(19, 21, 33, 0.55)',
          backdropFilter: 'blur(12px)'
        }}
      >
        <UnifiedHeader />
      </header>
      
      {/* Main scrollable content */}
      <main
        style={{
          paddingTop: 'calc(72px + env(safe-area-inset-top, 47px) + 40px)',
          paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 34px))',
          height: '100dvh',
          overflowY: 'auto',
          position: 'relative',
          zIndex: 0
        }}
      >
        <div className="container mx-auto max-w-2xl p-4 space-y-6">
          <motion.h1
            className="text-3xl font-orbitron font-bold text-center mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <span className="text-white">METODI DI PAGAMENTO</span>
          </motion.h1>

          {/* Add Payment Method */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="glass-card">
              <CardContent className="p-6">
                <Button
                  onClick={handleAddPaymentMethod}
                  className="w-full bg-[#00D1FF] hover:bg-[#00B8E6] text-black flex items-center justify-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Aggiungi Metodo di Pagamento
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Payment Methods List */}
          {paymentMethods.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-4"
            >
              {paymentMethods.map((method, index) => (
                <Card key={method.id} className="glass-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {getCardIcon(method.brand)}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium">
                              {method.brand.toUpperCase()} •••• {method.last4}
                            </span>
                            {method.is_default && (
                              <Badge variant="secondary" className="text-xs">
                                Predefinito
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center text-gray-400 text-sm">
                            <Calendar className="w-4 h-4 mr-1" />
                            Scade {method.exp_month.toString().padStart(2, '0')}/{method.exp_year}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {!method.is_default && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSetDefault(method.id)}
                          >
                            Imposta come predefinito
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeletePaymentMethod(method.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="glass-card">
                <CardContent className="p-8 text-center">
                  <CreditCard className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold text-white mb-2">Nessun metodo di pagamento</h3>
                  <p className="text-gray-400 mb-4">Aggiungi una carta di credito per effettuare acquisti</p>
                  <Button onClick={handleAddPaymentMethod} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Aggiungi Carta
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Security Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="glass-card border-yellow-400/20">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-yellow-400" />
                  Sicurezza dei Pagamenti
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <AlertTriangle className="w-4 h-4 mt-0.5 mr-3 text-yellow-400" />
                    <div>
                      <p className="text-white text-sm font-medium">Protezione SSL</p>
                      <p className="text-gray-400 text-xs">Tutti i pagamenti sono protetti con crittografia SSL</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Shield className="w-4 h-4 mt-0.5 mr-3 text-yellow-400" />
                    <div>
                      <p className="text-white text-sm font-medium">Compliance PCI</p>
                      <p className="text-gray-400 text-xs">I tuoi dati di pagamento sono gestiti in modo sicuro</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
      
      <BottomNavigation />
    </motion.div>
  );
};

export default PaymentsPage;