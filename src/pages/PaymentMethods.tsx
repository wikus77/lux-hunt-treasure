
import { useState } from "react";
import { ArrowLeft, CreditCard, AppleIcon, GlobeIcon } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const PaymentMethods = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<string>("card");
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardholderName: "",
    expiryDate: "",
    cvv: ""
  });

  // Recupera l’indizio passato dalla ClueCard, se presente
  const clue = location.state?.clue;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleIndizioDopoPagamento = () => {
    if (clue) {
      // Genera notifica con l’indizio acquistato
      const notification = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        title: "Indizio Sbloccato!",
        description: clue.description,
        date: new Date().toISOString(),
        read: false
      };
      const existingNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      existingNotifications.push(notification);
      localStorage.setItem('notifications', JSON.stringify(existingNotifications));
    }
  };

  const handlePaymentCompleted = () => {
    toast({
      title: "Pagamento Completato",
      description: clue
        ? "Hai sbloccato un nuovo indizio! Vieni a leggerlo nella sezione Notifiche."
        : "Il tuo metodo di pagamento è stato salvato con successo.",
    });
    handleIndizioDopoPagamento();
    setTimeout(() => {
      if (clue) {
        navigate("/notifications");
      } else {
        navigate("/settings");
      }
    }, 1200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handlePaymentCompleted();
  };

  const handleApplePay = () => {
    toast({
      title: "Apple Pay",
      description: "Pagamento con Apple Pay in elaborazione..."
    });
    setTimeout(() => {
      handlePaymentCompleted();
    }, 2000);
  };

  const handleGooglePay = () => {
    toast({
      title: "Google Pay",
      description: "Pagamento con Google Pay in elaborazione..."
    });
    setTimeout(() => {
      handlePaymentCompleted();
    }, 2000);
  };

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
        <div className="glass-card mb-6">
          <div className="flex justify-between mb-6">
            <button 
              className={`flex flex-col items-center justify-center p-4 rounded-md w-1/3 ${paymentMethod === 'card' ? 'bg-projectx-deep-blue' : 'bg-gray-800'}`}
              onClick={() => setPaymentMethod('card')}
            >
              <CreditCard className="h-6 w-6 mb-2" />
              <span className="text-sm">Carta</span>
            </button>
            
            <button 
              className={`flex flex-col items-center justify-center p-4 rounded-md w-1/3 ${paymentMethod === 'apple' ? 'bg-projectx-deep-blue' : 'bg-gray-800'}`}
              onClick={() => setPaymentMethod('apple')}
            >
              <AppleIcon className="h-6 w-6 mb-2" />
              <span className="text-sm">Apple Pay</span>
            </button>
            
            <button 
              className={`flex flex-col items-center justify-center p-4 rounded-md w-1/3 ${paymentMethod === 'google' ? 'bg-projectx-deep-blue' : 'bg-gray-800'}`}
              onClick={() => setPaymentMethod('google')}
            >
              <GlobeIcon className="h-6 w-6 mb-2" />
              <span className="text-sm">Google Pay</span>
            </button>
          </div>

          {paymentMethod === 'card' && (
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="cardNumber" className="block text-sm font-medium mb-1">
                    Numero della Carta
                  </label>
                  <Input
                    id="cardNumber"
                    name="cardNumber"
                    value={cardDetails.cardNumber}
                    onChange={handleInputChange}
                    placeholder="1234 5678 9012 3456"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="cardholderName" className="block text-sm font-medium mb-1">
                    Nome del Titolare
                  </label>
                  <Input
                    id="cardholderName"
                    name="cardholderName"
                    value={cardDetails.cardholderName}
                    onChange={handleInputChange}
                    placeholder="Mario Rossi"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="expiryDate" className="block text-sm font-medium mb-1">
                      Data di Scadenza
                    </label>
                    <Input
                      id="expiryDate"
                      name="expiryDate"
                      value={cardDetails.expiryDate}
                      onChange={handleInputChange}
                      placeholder="MM/AA"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="cvv" className="block text-sm font-medium mb-1">
                      CVV
                    </label>
                    <Input
                      id="cvv"
                      name="cvv"
                      value={cardDetails.cvv}
                      onChange={handleInputChange}
                      placeholder="123"
                      required
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-projectx-blue to-projectx-pink"
                >
                  Salva Carta
                </Button>
              </div>
            </form>
          )}

          {paymentMethod === 'apple' && (
            <div className="text-center p-4">
              <div className="border border-projectx-deep-blue rounded-md p-6 mb-4">
                <AppleIcon className="h-12 w-12 mx-auto mb-4" />
                <p className="mb-6">Paga in modo rapido e sicuro con Apple Pay</p>
                <Button 
                  onClick={handleApplePay}
                  className="w-full bg-black text-white border border-white"
                >
                  Paga con Apple Pay
                </Button>
              </div>
            </div>
          )}

          {paymentMethod === 'google' && (
            <div className="text-center p-4">
              <div className="border border-projectx-deep-blue rounded-md p-6 mb-4">
                <GlobeIcon className="h-12 w-12 mx-auto mb-4" />
                <p className="mb-6">Paga in modo rapido e sicuro con Google Pay</p>
                <Button 
                  onClick={handleGooglePay}
                  className="w-full bg-white text-black"
                >
                  Paga con Google Pay
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentMethods;
