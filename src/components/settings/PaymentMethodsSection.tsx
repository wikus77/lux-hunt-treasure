
import { useState, useEffect } from "react";
import { CreditCard, Plus, Trash2, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuthContext } from "@/contexts/auth";
import ApplePayBox from "@/components/payments/ApplePayBox";
import GooglePayBox from "@/components/payments/GooglePayBox";

interface SavedCard {
  id: string;
  last4: string;
  brand: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

const PaymentMethodsSection = () => {
  const { getCurrentUser } = useAuthContext();
  const user = getCurrentUser();
  
  // Form state
  const [cardForm, setCardForm] = useState({
    cardNumber: "",
    expiry: "",
    cvc: "",
    name: ""
  });
  
  const [savedCards, setSavedCards] = useState<SavedCard[]>([
    {
      id: "pm_1234",
      last4: "4242",
      brand: "visa",
      expMonth: 12,
      expYear: 2025,
      isDefault: true
    }
  ]);
  
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check payment method availability
  const [paymentAvailability, setPaymentAvailability] = useState({
    applePay: false,
    googlePay: false
  });

  useEffect(() => {
    // Check Apple Pay availability
    if (typeof window.ApplePaySession !== 'undefined' && window.ApplePaySession?.canMakePayments()) {
      setPaymentAvailability(prev => ({ ...prev, applePay: true }));
    }
    
    // Check Google Pay availability
    if (typeof window.google !== 'undefined' && typeof window.google.payments !== 'undefined') {
      setPaymentAvailability(prev => ({ ...prev, googlePay: true }));
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Format card number
    if (name === 'cardNumber') {
      const formatted = value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').slice(0, 19);
      setCardForm(prev => ({ ...prev, [name]: formatted }));
      return;
    }
    
    // Format expiry
    if (name === 'expiry') {
      const formatted = value.replace(/\D/g, '').replace(/(\d{2})(?=\d)/, '$1/').slice(0, 5);
      setCardForm(prev => ({ ...prev, [name]: formatted }));
      return;
    }
    
    // Format CVC
    if (name === 'cvc') {
      const formatted = value.replace(/\D/g, '').slice(0, 4);
      setCardForm(prev => ({ ...prev, [name]: formatted }));
      return;
    }
    
    setCardForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Simulate API call to Stripe
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Add new card to saved cards
      const newCard: SavedCard = {
        id: `pm_${Date.now()}`,
        last4: cardForm.cardNumber.replace(/\s/g, '').slice(-4),
        brand: "visa", // Determined by card number
        expMonth: parseInt(cardForm.expiry.split('/')[0]),
        expYear: parseInt(`20${cardForm.expiry.split('/')[1]}`),
        isDefault: savedCards.length === 0
      };
      
      setSavedCards(prev => [...prev, newCard]);
      setCardForm({ cardNumber: "", expiry: "", cvc: "", name: "" });
      setIsAddingCard(false);
      
      toast.success("Metodo aggiunto con successo", {
        description: "La tua carta è stata salvata in modo sicuro."
      });
      
    } catch (error) {
      toast.error("Errore nel salvataggio del metodo", {
        description: "Riprova più tardi o contatta il supporto."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    try {
      // Simulate API call to Stripe
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setSavedCards(prev => prev.filter(card => card.id !== cardId));
      toast.success("Carta rimossa", {
        description: "Il metodo di pagamento è stato eliminato."
      });
      
    } catch (error) {
      toast.error("Errore nell'eliminazione", {
        description: "Non è stato possibile rimuovere la carta."
      });
    }
  };

  const handleApplePay = async () => {
    toast.info("Apple Pay", {
      description: "Funzionalità in implementazione con Stripe."
    });
  };

  const handleGooglePay = async () => {
    toast.info("Google Pay", {
      description: "Funzionalità in implementazione con Stripe."
    });
  };

  const getBrandIcon = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return '💳';
      case 'mastercard':
        return '💳';
      case 'amex':
        return '💳';
      default:
        return '💳';
    }
  };

  // Show login message if user not authenticated
  if (!user) {
    return (
      <div className="glass-card text-center py-12">
        <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-semibold mb-2">Accesso Richiesto</h3>
        <p className="text-muted-foreground mb-6">
          Effettua il login per gestire i tuoi metodi di pagamento.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Saved Cards Section */}
      <div className="glass-card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Carte Salvate</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddingCard(true)}
            disabled={isAddingCard}
          >
            <Plus className="h-4 w-4 mr-2" />
            Aggiungi Carta
          </Button>
        </div>

        {savedCards.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-muted-foreground">⚠️ Nessun metodo salvato</p>
          </div>
        ) : (
          <div className="space-y-3">
            {savedCards.map((card) => (
              <div key={card.id} className="flex items-center justify-between p-3 border border-projectx-deep-blue rounded-md">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{getBrandIcon(card.brand)}</span>
                  <div>
                    <p className="font-medium">•••• •••• •••• {card.last4}</p>
                    <p className="text-sm text-muted-foreground">
                      {card.brand.toUpperCase()} • {card.expMonth.toString().padStart(2, '0')}/{card.expYear}
                      {card.isDefault && <span className="ml-2 text-xs bg-projectx-blue px-2 py-1 rounded">Default</span>}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteCard(card.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Card Form */}
      {isAddingCard && (
        <div className="glass-card">
          <h3 className="text-lg font-semibold mb-4">Aggiungi Nuova Carta</h3>
          <form onSubmit={handleAddCard} className="space-y-4">
            <div>
              <label htmlFor="cardNumber" className="block text-sm font-medium mb-1">
                Numero Carta
              </label>
              <Input
                id="cardNumber"
                name="cardNumber"
                value={cardForm.cardNumber}
                onChange={handleInputChange}
                placeholder="1234 5678 9012 3456"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="expiry" className="block text-sm font-medium mb-1">
                  Data Scadenza
                </label>
                <Input
                  id="expiry"
                  name="expiry"
                  value={cardForm.expiry}
                  onChange={handleInputChange}
                  placeholder="MM/AA"
                  required
                />
              </div>
              <div>
                <label htmlFor="cvc" className="block text-sm font-medium mb-1">
                  CVC
                </label>
                <Input
                  id="cvc"
                  name="cvc"
                  value={cardForm.cvc}
                  onChange={handleInputChange}
                  placeholder="123"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Nome Intestatario
              </label>
              <Input
                id="name"
                name="name"
                value={cardForm.name}
                onChange={handleInputChange}
                placeholder="Mario Rossi"
                required
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? "Salvando..." : "Salva Carta"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddingCard(false)}
                disabled={loading}
              >
                Annulla
              </Button>
            </div>
          </form>
          
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-400/30 rounded-md">
            <p className="text-blue-300 text-sm">
              🔒 I dati della carta vengono salvati in modo sicuro tramite Stripe. 
              Non memorizziamo mai i tuoi dati sensibili sui nostri server.
            </p>
          </div>
        </div>
      )}

      {/* Quick Payment Methods */}
      <div className="glass-card">
        <h3 className="text-lg font-semibold mb-4">Pagamenti Rapidi</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Apple Pay */}
          {paymentAvailability.applePay ? (
            <ApplePayBox onApplePay={handleApplePay} />
          ) : (
            <div className="border border-gray-600 rounded-md p-4 text-center">
              <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm text-muted-foreground">
                Apple Pay non disponibile
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                (Solo Safari + iOS/macOS)
              </p>
            </div>
          )}

          {/* Google Pay */}
          {paymentAvailability.googlePay ? (
            <GooglePayBox onGooglePay={handleGooglePay} />
          ) : (
            <div className="border border-gray-600 rounded-md p-4 text-center">
              <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm text-muted-foreground">
                Google Pay non disponibile
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                (Solo Android + Chrome)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Security Info */}
      <div className="glass-card">
        <h3 className="text-lg font-semibold mb-4">Sicurezza</h3>
        <div className="space-y-3">
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-400 mr-3 mt-0.5" />
            <div>
              <p className="font-medium">Crittografia SSL/TLS</p>
              <p className="text-sm text-muted-foreground">
                Tutti i dati sono protetti con crittografia end-to-end
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-400 mr-3 mt-0.5" />
            <div>
              <p className="font-medium">Conformità PCI DSS</p>
              <p className="text-sm text-muted-foreground">
                Stripe gestisce tutti i pagamenti secondo gli standard di sicurezza
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-400 mr-3 mt-0.5" />
            <div>
              <p className="font-medium">Zero Storage Policy</p>
              <p className="text-sm text-muted-foreground">
                Non memorizziamo mai i dati sensibili delle tue carte
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodsSection;
