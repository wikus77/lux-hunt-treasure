
import { useState } from "react";
import { ArrowLeft, CreditCard, Plus, Trash2, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";
import { useStripePayment } from "@/hooks/useStripePayment";
import { toast } from "sonner";

const PaymentMethods = () => {
  const navigate = useNavigate();
  const { paymentMethods, loading, deletePaymentMethod, setDefaultPaymentMethod } = usePaymentMethods();
  const { loading: stripeLoading } = useStripePayment();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const handleAddPaymentMethod = async () => {
    try {
      // This would typically open a Stripe setup flow
      toast.info("Funzionalità in arrivo", {
        description: "La funzionalità di aggiunta carta sarà disponibile presto"
      });
    } catch (error) {
      console.error('Error adding payment method:', error);
      toast.error("Errore nell'aggiunta del metodo di pagamento");
    }
  };

  const handleDeletePaymentMethod = async (paymentMethodId: string) => {
    try {
      setDeletingId(paymentMethodId);
      await deletePaymentMethod(paymentMethodId);
      toast.success("Metodo di pagamento rimosso");
    } catch (error) {
      console.error('Error deleting payment method:', error);
      toast.error("Errore nella rimozione del metodo di pagamento");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (paymentMethodId: string) => {
    try {
      await setDefaultPaymentMethod(paymentMethodId);
    } catch (error) {
      console.error('Error setting default payment method:', error);
      toast.error("Errore nell'impostazione del metodo predefinito");
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="pt-[calc(env(safe-area-inset-top)+64px)] px-4 pb-[calc(env(safe-area-inset-bottom)+80px)]">
        <header className="flex items-center border-b border-projectx-deep-blue pb-6 mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Metodi di Pagamento</h1>
        </header>

        <div className="glass-card rounded-xl mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <CreditCard className="mr-2 h-5 w-5 text-projectx-neon-blue" />
            I tuoi Metodi di Pagamento
          </h2>
          
          {loading ? (
            <div className="text-center py-8">
              <p className="text-white/70">Caricamento metodi di pagamento...</p>
            </div>
          ) : paymentMethods.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/70 mb-4">Nessun metodo di pagamento salvato</p>
              <p className="text-sm text-white/50 mb-6">Aggiungi una carta per acquistare BUZZ e abbonamenti</p>
            </div>
          ) : (
            <div className="space-y-3 mb-6">
              {paymentMethods.map((method) => (
                <div 
                  key={method.id} 
                  className={`p-4 rounded-xl border ${
                    method.is_default 
                      ? 'border-projectx-neon-blue bg-projectx-neon-blue/10' 
                      : 'border-white/20 bg-black/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-white/10">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">
                          •••• •••• •••• {method.last4}
                        </p>
                        <p className="text-sm text-white/60">
                          {method.brand.toUpperCase()} • Scade {method.exp_month}/{method.exp_year}
                        </p>
                      </div>
                      {method.is_default && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-projectx-neon-blue/20 rounded-full">
                          <Check className="h-3 w-3 text-projectx-neon-blue" />
                          <span className="text-xs text-projectx-neon-blue">Predefinita</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {!method.is_default && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSetDefault(method.id)}
                          className="rounded-xl"
                        >
                          Imposta come predefinita
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeletePaymentMethod(method.stripe_pm_id)}
                        disabled={deletingId === method.stripe_pm_id}
                        className="rounded-xl"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <Button 
            onClick={handleAddPaymentMethod}
            disabled={stripeLoading}
            className="w-full bg-gradient-to-r from-projectx-blue to-projectx-pink rounded-xl"
          >
            <Plus className="h-4 w-4 mr-2" />
            Aggiungi Metodo di Pagamento
          </Button>
        </div>

        <div className="glass-card rounded-xl">
          <h3 className="text-lg font-semibold mb-3">Informazioni Sicurezza</h3>
          <div className="space-y-2 text-sm text-white/70">
            <p>• I tuoi dati di pagamento sono protetti con crittografia end-to-end</p>
            <p>• M1SSION utilizza Stripe per processare i pagamenti in modo sicuro</p>
            <p>• Non salviamo mai i dati completi della carta sui nostri server</p>
            <p>• Puoi rimuovere i metodi di pagamento in qualsiasi momento</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethods;
