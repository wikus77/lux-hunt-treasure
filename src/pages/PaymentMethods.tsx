
import { useState, useEffect } from "react";
import { ArrowLeft, CreditCard, Plus, Trash2, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/contexts/auth";
import CardPaymentForm from "@/components/payments/CardPaymentForm";
import ApplePayBox from "@/components/payments/ApplePayBox";
import GooglePayBox from "@/components/payments/GooglePayBox";
import { useStripePayment } from "@/hooks/useStripePayment";

interface SavedCard {
  id: string;
  last4: string;
  brand: string;
  exp_month: number;
  exp_year: number;
}

const PaymentMethods = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthContext();
  const { detectPaymentMethodAvailability } = useStripePayment();
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [showAddCardForm, setShowAddCardForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const { applePayAvailable, googlePayAvailable } = detectPaymentMethodAvailability();

  // Simulated saved cards - in real app this would come from Stripe
  useEffect(() => {
    if (user) {
      // Placeholder for loading saved payment methods from Stripe
      setSavedCards([
        {
          id: "pm_1234567890",
          last4: "4242",
          brand: "visa",
          exp_month: 12,
          exp_year: 2025
        }
      ]);
    }
  }, [user]);

  const handleAddCard = async (cardData: any) => {
    setLoading(true);
    try {
      // Here you would integrate with Stripe to save the payment method
      console.log("Adding card:", cardData);
      
      toast({
        title: "✅ Metodo aggiunto con successo",
        description: "La tua carta è stata salvata correttamente."
      });
      
      setShowAddCardForm(false);
      // Refresh saved cards list
    } catch (error) {
      toast({
        title: "❌ Errore nel salvataggio del metodo",
        description: "Si è verificato un errore durante il salvataggio della carta.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    try {
      // Here you would call Stripe to detach the payment method
      console.log("Deleting card:", cardId);
      
      setSavedCards(prev => prev.filter(card => card.id !== cardId));
      
      toast({
        title: "Carta eliminata",
        description: "Il metodo di pagamento è stato rimosso."
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Non è stato possibile eliminare la carta.",
        variant: "destructive"
      });
    }
  };

  const handleApplePay = () => {
    toast({
      title: "Apple Pay",
      description: "Configurazione Apple Pay in corso..."
    });
  };

  const handleGooglePay = () => {
    toast({
      title: "Google Pay",
      description: "Configurazione Google Pay in corso..."
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black">
        <header className="px-4 py-6 flex items-center border-b border-projectx-deep-blue">
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

        <div className="p-4 text-center mt-20">
          <CreditCard className="h-16 w-16 mx-auto mb-4 text-gray-500" />
          <h2 className="text-lg font-semibold mb-2">Accesso Richiesto</h2>
          <p className="text-gray-400 mb-6">🔐 Effettua il login per gestire i tuoi metodi di pagamento.</p>
          <Button 
            onClick={() => navigate("/login")}
            className="bg-gradient-to-r from-projectx-blue to-projectx-pink"
          >
            Vai al Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-6">
      <header className="px-4 py-6 flex items-center border-b border-projectx-deep-blue">
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

      <div className="p-4">
        {/* Payment Methods Quick Access */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {applePayAvailable && <ApplePayBox onApplePay={handleApplePay} />}
          {googlePayAvailable && <GooglePayBox onGooglePay={handleGooglePay} />}
        </div>

        {/* Add Card Section */}
        <div className="glass-card mb-6">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center">
                <CreditCard className="mr-2 h-5 w-5 text-projectx-neon-blue" />
                Carte di Credito/Debito
              </h2>
              {!showAddCardForm && (
                <Button
                  onClick={() => setShowAddCardForm(true)}
                  className="bg-gradient-to-r from-projectx-blue to-projectx-pink"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Aggiungi Carta
                </Button>
              )}
            </div>

            {showAddCardForm && (
              <div className="border border-projectx-deep-blue rounded-lg p-4 mb-4">
                <h3 className="text-md font-medium mb-4">Inserisci i dati della carta</h3>
                <CardPaymentForm onSubmit={handleAddCard} />
                <Button
                  variant="outline"
                  onClick={() => setShowAddCardForm(false)}
                  className="w-full mt-3"
                >
                  Annulla
                </Button>
              </div>
            )}

            {/* Saved Cards List */}
            {savedCards.length > 0 ? (
              <div className="space-y-3">
                <h3 className="text-md font-medium">Carte Salvate</h3>
                {savedCards.map((card) => (
                  <div key={card.id} className="border border-gray-600 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <CreditCard className="h-6 w-6 mr-3 text-projectx-neon-blue" />
                      <div>
                        <p className="font-medium">
                          {card.brand.toUpperCase()} •••• {card.last4}
                        </p>
                        <p className="text-sm text-gray-400">
                          Scade: {card.exp_month.toString().padStart(2, '0')}/{card.exp_year}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteCard(card.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : !showAddCardForm && (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 mx-auto mb-3 text-gray-500" />
                <p className="text-gray-400">⚠️ Nessun metodo salvato</p>
                <p className="text-sm text-gray-500">Aggiungi una carta per iniziare</p>
              </div>
            )}
          </div>
        </div>

        {/* Security Info */}
        <div className="glass-card">
          <div className="p-4">
            <h3 className="text-md font-semibold mb-3 flex items-center">
              <Check className="h-5 w-5 mr-2 text-green-500" />
              Sicurezza
            </h3>
            <div className="space-y-2 text-sm text-gray-400">
              <p>🔒 I tuoi dati di pagamento sono protetti da crittografia SSL</p>
              <p>🛡️ Le informazioni sensibili sono gestite esclusivamente da Stripe</p>
              <p>💳 I numeri delle carte non vengono mai salvati sui nostri server</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethods;
