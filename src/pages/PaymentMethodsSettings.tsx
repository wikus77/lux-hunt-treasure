
import React, { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import CardPaymentForm from '@/components/payments/CardPaymentForm';
import ApplePayBox from '@/components/payments/ApplePayBox';
import GooglePayBox from '@/components/payments/GooglePayBox';

interface PaymentMethod {
  id: string;
  card: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
}

const PaymentMethodsSettings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [savedMethods, setSavedMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPaymentMethods();
    }
  }, [user]);

  const fetchPaymentMethods = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('list-payment-methods');
      
      if (error) {
        console.error('Error fetching payment methods:', error);
        toast.error('Errore nel caricamento dei metodi di pagamento');
        return;
      }
      
      setSavedMethods(data?.methods || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Errore nel caricamento dei metodi di pagamento');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCard = async (cardData: any) => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('save-payment-method', {
        body: { cardData }
      });

      if (error) {
        console.error('Error saving payment method:', error);
        toast.error('Errore nel salvataggio del metodo');
        return;
      }

      toast.success('Metodo aggiunto con successo');
      setShowAddForm(false);
      await fetchPaymentMethods();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Errore nel salvataggio del metodo');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMethod = async (methodId: string) => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('delete-payment-method', {
        body: { methodId }
      });

      if (error) {
        console.error('Error deleting payment method:', error);
        toast.error('Errore nell\'eliminazione del metodo');
        return;
      }

      toast.success('Metodo eliminato con successo');
      await fetchPaymentMethods();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Errore nell\'eliminazione del metodo');
    } finally {
      setLoading(false);
    }
  };

  const handleApplePay = async () => {
    toast.info('Apple Pay in fase di configurazione');
  };

  const handleGooglePay = async () => {
    toast.info('Google Pay in fase di configurazione');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black">
        <header className="px-4 py-6 flex items-center border-b border-white/10">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-white">Metodi di Pagamento</h1>
        </header>

        <div className="p-6 text-center">
          <CreditCard className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-lg font-semibold text-white mb-2">
            Accesso Richiesto
          </h2>
          <p className="text-gray-400 mb-6">
            Effettua il login per gestire i tuoi metodi di pagamento.
          </p>
          <Button onClick={() => navigate('/login')}>
            Vai al Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <header className="px-4 py-6 flex items-center border-b border-white/10">
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold text-white">Metodi di Pagamento</h1>
      </header>

      <div className="p-4 space-y-6">
        {/* Pagamenti Rapidi */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Pagamenti Rapidi</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ApplePayBox onApplePay={handleApplePay} />
            <GooglePayBox onGooglePay={handleGooglePay} />
          </div>
        </section>

        {/* Aggiungi Carta */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">Carte di Credito/Debito</h2>
            {!showAddForm && (
              <Button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Aggiungi Carta
              </Button>
            )}
          </div>

          {showAddForm && (
            <div className="glass-card mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-white">Nuova Carta</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddForm(false)}
                >
                  Annulla
                </Button>
              </div>
              <CardPaymentForm onSubmit={handleAddCard} />
            </div>
          )}
        </section>

        {/* Carte Salvate */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Carte Salvate</h2>
          
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-400 mt-2">Caricamento...</p>
            </div>
          )}

          {!loading && savedMethods.length === 0 && (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-400">Nessun metodo salvato</p>
            </div>
          )}

          {!loading && savedMethods.length > 0 && (
            <div className="space-y-3">
              {savedMethods.map((method) => (
                <div
                  key={method.id}
                  className="glass-card flex justify-between items-center p-4"
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-6 w-6 text-blue-400" />
                    <div>
                      <p className="font-medium text-white">
                        {method.card.brand.toUpperCase()} •••• {method.card.last4}
                      </p>
                      <p className="text-sm text-gray-400">
                        Scade {method.card.exp_month.toString().padStart(2, '0')}/{method.card.exp_year}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteMethod(method.id)}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default PaymentMethodsSettings;
