// ✅ File conforme M1SSION™ — BY JOSEPH MULE
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Lock, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simulated payment processing - BY JOSEPH MULE
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsProcessing(false);
    setIsSuccess(true);
    
    // Mock save plan to localStorage
    localStorage.setItem('subscription_plan', planName);
    
    toast({
      title: "Pagamento completato!",
      description: `Piano ${planName} attivato con successo.`,
    });

    // Redirect after success
    setTimeout(() => {
      navigate('/profile');
    }, 2000);
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