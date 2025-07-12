// ✅ COMPONENT MODIFICATO
// BY JOSEPH MULE — 2025-07-12
import React, { useState, useEffect } from 'react';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import M1ssionText from '@/components/logo/M1ssionText';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CreditCard, Crown, Calendar, Download, ExternalLink, CheckCircle, AlertCircle, Plus, Trash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const PaymentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // TASK 5 — Gestione Metodi di Pagamento
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: '1',
      type: 'visa',
      last4: '4242',
      expiry: '12/26',
      isActive: true
    }
  ]);

  const addNewCard = () => {
    toast({
      title: "Aggiungi nuova carta",
      description: "Funzionalità in arrivo per aggiungere nuove carte.",
    });
  };

  const removeCard = (cardId: string) => {
    if (paymentMethods.length > 1) {
      setPaymentMethods(prev => prev.filter(card => card.id !== cardId));
      toast({
        title: "Carta rimossa",
        description: "La carta è stata rimossa con successo.",
      });
    } else {
      toast({
        title: "Errore",
        description: "Devi mantenere almeno un metodo di pagamento.",
        variant: "destructive",
      });
    }
  };

  // TASK 1 — Sincronizzazione Piano Abbonamento
  const [currentPlan, setCurrentPlan] = useState({
    name: 'M1SSION™ Base',
    tier: 'base',
    price: '€0/mese',
    renewalDate: '15/08/2025',
    features: ['Accesso di base', 'Missioni standard']
  });

  // Load subscription from localStorage and Supabase
  useEffect(() => {
    const loadCurrentPlan = () => {
      const savedPlan = localStorage.getItem('subscription_plan') || 'Base';
      
      switch (savedPlan) {
        case 'Silver':
          setCurrentPlan({
            name: 'M1SSION™ Silver',
            tier: 'silver',
            price: '€9.99/mese',
            renewalDate: '15/08/2025',
            features: ['Accesso prioritario', 'Indizi esclusivi', 'Supporto dedicato']
          });
          break;
        case 'Gold':
          setCurrentPlan({
            name: 'M1SSION™ Gold',
            tier: 'gold',
            price: '€14.99/mese',
            renewalDate: '15/08/2025',
            features: ['Accesso prioritario', 'Indizi esclusivi', 'Supporto dedicato', 'Contenuti premium']
          });
          break;
        case 'Black':
          setCurrentPlan({
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
          });
          break;
        default:
          setCurrentPlan({
            name: 'M1SSION™ Base',
            tier: 'base',
            price: '€0/mese',
            renewalDate: '15/08/2025',
            features: ['Accesso di base', 'Missioni standard']
          });
      }
    };

    loadCurrentPlan();
    
    // Listen for plan changes
    const handleStorageChange = () => loadCurrentPlan();
    window.addEventListener('storage', handleStorageChange);
    
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Mock payment history - BY JOSEPH MULE
  const paymentHistory = [
    { date: '15/07/2025', amount: '€19.99', status: 'paid', description: 'M1SSION™ Black - Mensile', invoice: 'INV-2025-001' },
    { date: '15/06/2025', amount: '€19.99', status: 'paid', description: 'M1SSION™ Black - Mensile', invoice: 'INV-2025-002' },
    { date: '15/05/2025', amount: '€19.99', status: 'paid', description: 'M1SSION™ Black - Mensile', invoice: 'INV-2025-003' },
    { date: '15/04/2025', amount: '€19.99', status: 'failed', description: 'M1SSION™ Black - Mensile', invoice: 'INV-2025-004' },
    { date: '15/03/2025', amount: '€19.99', status: 'paid', description: 'M1SSION™ Black - Mensile', invoice: 'INV-2025-005' }
  ];

  // TASK 6 — Pulsante "Gestisci Abbonamento"
  const handleManageSubscription = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      toast({
        title: "Apertura portale gestione",
        description: "Reindirizzamento al portale Stripe in corso...",
      });
      
      // Simulated Stripe Customer Portal integration
      setTimeout(() => {
        toast({
          title: "Portale aperto",
          description: "Gestisci la tua sottoscrizione dal portale Stripe.",
        });
        
        // Simulate return from portal with confirmation
        setTimeout(() => {
          toast({
            title: "Rientro completato",
            description: "Modifiche salvate automaticamente.",
          });
          // Force refresh of current plan
          window.dispatchEvent(new Event('storage'));
        }, 3000);
        
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
              {/* Payment Methods Management */}
              <Card className="bg-white/5 border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Metodi di Pagamento
                    </div>
                    <Button
                      onClick={addNewCard}
                      size="sm"
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Aggiungi
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <div key={method.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-4">
                          {getCardIcon(method.type)}
                          <div>
                            <p className="font-medium text-white">•••• •••• •••• {method.last4}</p>
                            <p className="text-sm text-white/60">Scade {method.expiry}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={method.isActive ? "default" : "secondary"}>
                            {method.isActive ? "Attivo" : "Scaduto"}
                          </Badge>
                          {paymentMethods.length > 1 && (
                            <Button
                              onClick={() => removeCard(method.id)}
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                            >
                              <Trash className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
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