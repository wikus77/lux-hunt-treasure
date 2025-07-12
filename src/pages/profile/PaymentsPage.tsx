// ✅ Update By JOSEPH MULE – 12/07/2025 – Header fix
import React, { useState } from 'react';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import M1ssionText from '@/components/logo/M1ssionText';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CreditCard, Crown, Calendar, Download, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const PaymentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for current payment method - BY JOSEPH MULE
  const currentPaymentMethod = {
    type: 'visa',
    last4: '4242',
    expiry: '12/26',
    isActive: true
  };

  // Mock data for current plan - BY JOSEPH MULE
  const currentPlan = {
    name: 'M1SSION™ Black',
    tier: 'premium',
    price: '€19.99/mese',
    renewalDate: '15/08/2025',
    features: [
      'Accesso illimitato a tutte le missioni',
      'Buzz giornalieri illimitati',
      'Supporto prioritario 24/7',
      'Badge esclusivi M1SSION™',
      'Accesso anticipato nuove funzioni'
    ]
  };

  // Mock payment history - BY JOSEPH MULE
  const paymentHistory = [
    { date: '15/07/2025', amount: '€19.99', status: 'paid', description: 'M1SSION™ Black - Mensile', invoice: 'INV-2025-001' },
    { date: '15/06/2025', amount: '€19.99', status: 'paid', description: 'M1SSION™ Black - Mensile', invoice: 'INV-2025-002' },
    { date: '15/05/2025', amount: '€19.99', status: 'paid', description: 'M1SSION™ Black - Mensile', invoice: 'INV-2025-003' },
    { date: '15/04/2025', amount: '€19.99', status: 'failed', description: 'M1SSION™ Black - Mensile', invoice: 'INV-2025-004' },
    { date: '15/03/2025', amount: '€19.99', status: 'paid', description: 'M1SSION™ Black - Mensile', invoice: 'INV-2025-005' }
  ];

  const handleManageSubscription = async () => {
    setIsLoading(true);
    try {
      // Stripe Customer Portal integration
      toast({
        title: "Apertura portale gestione",
        description: "Reindirizzamento al portale Stripe in corso...",
      });
      
      // Simulated redirect to Stripe portal
      setTimeout(() => {
        toast({
          title: "Portale aperto",
          description: "Gestisci la tua sottoscrizione dal portale Stripe.",
        });
        setIsLoading(false);
      }, 2000);
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile aprire il portale di gestione.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const downloadInvoice = (invoiceId: string) => {
    toast({
      title: "Download avviato",
      description: `Scaricamento fattura ${invoiceId}...`,
    });
  };

  const getCardIcon = (type: string) => {
    // Placeholder per icone circuiti - BY JOSEPH MULE
    return <CreditCard className="h-8 w-8" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <div 
      className="bg-gradient-to-b from-[#131524]/70 to-black w-full"
      style={{ 
        height: '100dvh',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <header 
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl"
        style={{
          height: '72px',
          paddingTop: 'env(safe-area-inset-top, 47px)',
          background: "rgba(19, 21, 33, 0.55)",
          backdropFilter: "blur(12px)"
        }}
      >
        <UnifiedHeader leftComponent={<M1ssionText />} />
      </header>
      
      <motion.main 
        className="text-white"
        style={{
          paddingTop: 'calc(72px + env(safe-area-inset-top, 47px))',
          paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 34px))',
          height: '100dvh',
          overflowY: 'auto',
          position: 'relative',
          zIndex: 0
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="glass-card mx-2 sm:mx-4 mt-2 sm:mt-4 mb-20">
          <div className="p-3 sm:p-6">
            {/* Header with back button */}
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/profile')}
                className="p-2 hover:bg-white/10"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold">Metodi di Pagamento</h1>
            </div>
            
            <div className="space-y-6">
              {/* Current Payment Method */}
              <Card className="bg-white/5 border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <CreditCard className="h-5 w-5" />
                    Metodo di Pagamento Attuale
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-4">
                      {getCardIcon(currentPaymentMethod.type)}
                      <div>
                        <p className="font-medium text-white">•••• •••• •••• {currentPaymentMethod.last4}</p>
                        <p className="text-sm text-white/60">Scade {currentPaymentMethod.expiry}</p>
                      </div>
                    </div>
                    <Badge variant={currentPaymentMethod.isActive ? "default" : "secondary"}>
                      {currentPaymentMethod.isActive ? "Attivo" : "Scaduto"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Current Plan */}
              <Card className="bg-white/5 border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Crown className="h-5 w-5" />
                    Piano Attuale
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{currentPlan.name}</h3>
                        <p className="text-white/60">{currentPlan.price}</p>
                      </div>
                      <Badge className="bg-primary">Premium</Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 text-white/60">
                      <Calendar className="h-4 w-4" />
                      <span>Rinnovo automatico il {currentPlan.renewalDate}</span>
                    </div>

                    <div className="space-y-2">
                      <p className="font-medium text-white">Vantaggi inclusi:</p>
                      <ul className="space-y-1">
                        {currentPlan.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm text-white/80">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button 
                        onClick={handleManageSubscription}
                        disabled={isLoading}
                        className="flex-1 bg-primary hover:bg-primary/90"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        {isLoading ? 'Caricamento...' : 'Gestisci Abbonamento'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment History */}
              <Card className="bg-white/5 border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Calendar className="h-5 w-5" />
                    Cronologia Pagamenti
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    I tuoi ultimi pagamenti e fatture
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {paymentHistory.map((payment, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(payment.status)}
                          <div>
                            <p className="font-medium text-white">{payment.description}</p>
                            <p className="text-sm text-white/60">{payment.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-white">{payment.amount}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => downloadInvoice(payment.invoice)}
                            className="h-8 w-8 p-0"
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </motion.main>
    </div>
  );
};

export default PaymentsPage;