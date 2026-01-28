// @ts-nocheck
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// 🔧 CREATED 28/01/2026: Dedicated Payment Methods page for Settings
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  CreditCard, 
  Plus, 
  ArrowLeft, 
  Smartphone,
  Shield,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import BottomNavigation from '@/components/layout/BottomNavigation';

// Platform detection
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const isAndroid = /Android/.test(navigator.userAgent);
const isCapacitor = !!(window as any).Capacitor;

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
  stripe_pm_id: string;
  created_at: string;
}

interface PlatformPaymentStatus {
  applePay: 'not_available' | 'not_configured' | 'configured';
  googlePay: 'not_available' | 'not_configured' | 'configured';
}

const PaymentMethodsPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [platformStatus, setPlatformStatus] = useState<PlatformPaymentStatus>({
    applePay: isIOS || isCapacitor ? 'not_configured' : 'not_available',
    googlePay: isAndroid ? 'not_configured' : 'not_available'
  });

  useEffect(() => {
    if (user) {
      loadPaymentMethods();
    }
  }, [user]);

  const loadPaymentMethods = async () => {
    if (!user) return;

    try {
      setLoading(true);
      console.log('💳 Loading payment methods for user:', user.id);
      
      const { data: methods, error } = await supabase
        .from('user_payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading payment methods:', error);
        setPaymentMethods([]);
      } else {
        console.log('✅ Payment methods loaded:', methods?.length || 0);
        setPaymentMethods(methods || []);
      }
    } catch (error) {
      console.error('❌ Error in loadPaymentMethods:', error);
      setPaymentMethods([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplePaySetup = () => {
    // Analytics tracking
    console.log('📊 Analytics: Apple Pay setup clicked');
    
    toast({
      title: "🍎 Apple Pay",
      description: "La configurazione di Apple Pay sarà disponibile a breve. Resta sintonizzato!",
    });
  };

  const handleGooglePaySetup = () => {
    // Analytics tracking
    console.log('📊 Analytics: Google Pay setup clicked');
    
    toast({
      title: "🤖 Google Pay",
      description: "La configurazione di Google Pay sarà disponibile a breve. Resta sintonizzato!",
    });
  };

  const handleAddCard = () => {
    // Analytics tracking
    console.log('📊 Analytics: Add card clicked');
    
    toast({
      title: "💳 Aggiungi Carta",
      description: "La gestione delle carte sarà disponibile a breve tramite il tuo provider di pagamento sicuro.",
    });
  };

  const getBrandIcon = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return '💳 Visa';
      case 'mastercard':
        return '💳 Mastercard';
      case 'american express':
        return '💳 Amex';
      default:
        return '💳 Carta';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0b0f] via-[#1a1b2e] to-[#0a0b0f]">
      <UnifiedHeader />
      
      <div className="pt-[calc(env(safe-area-inset-top,0px)+80px)] pb-[calc(env(safe-area-inset-bottom,0px)+100px)] px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 max-w-lg mx-auto"
        >
          {/* 🔧 FIX 28/01/2026: Back button BELOW header, navigate to /settings */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/settings')}
              className="p-2 hover:bg-white/10 rounded-xl"
            >
              <ArrowLeft className="h-5 w-5 text-white" />
            </Button>
            <h1 className="text-xl font-orbitron text-white">Metodi di Pagamento</h1>
          </div>

          {/* Platform Payment Methods */}
          <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white font-orbitron flex items-center text-base">
                <Smartphone className="w-5 h-5 mr-2 text-[#00D1FF]" />
                Pagamenti Piattaforma
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Apple Pay */}
              {(isIOS || isCapacitor || true) && ( // Show on all platforms for demo
                <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg">🍎</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">Apple Pay</p>
                      <p className="text-white/60 text-xs">
                        {platformStatus.applePay === 'not_available' 
                          ? 'Non disponibile su questo dispositivo'
                          : platformStatus.applePay === 'configured'
                          ? 'Configurato'
                          : 'Non configurato'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleApplePaySetup}
                    disabled={platformStatus.applePay === 'not_available'}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    {platformStatus.applePay === 'configured' ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : platformStatus.applePay === 'not_available' ? (
                      'N/D'
                    ) : (
                      <>
                        <Clock className="w-4 h-4 mr-1" />
                        In arrivo
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Google Pay */}
              {(isAndroid || true) && ( // Show on all platforms for demo
                <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                      <span className="text-lg">🤖</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">Google Pay</p>
                      <p className="text-white/60 text-xs">
                        {platformStatus.googlePay === 'not_available' 
                          ? 'Non disponibile su questo dispositivo'
                          : platformStatus.googlePay === 'configured'
                          ? 'Configurato'
                          : 'Non configurato'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGooglePaySetup}
                    disabled={platformStatus.googlePay === 'not_available'}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    {platformStatus.googlePay === 'configured' ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : platformStatus.googlePay === 'not_available' ? (
                      'N/D'
                    ) : (
                      <>
                        <Clock className="w-4 h-4 mr-1" />
                        In arrivo
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Credit/Debit Cards */}
          <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white font-orbitron flex items-center justify-between text-base">
                <div className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-[#00D1FF]" />
                  Carte Salvate
                </div>
                <Button
                  onClick={handleAddCard}
                  disabled={loading}
                  size="sm"
                  className="bg-[#00D1FF] hover:bg-[#00B8E6] text-black font-semibold"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Aggiungi
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-2 border-[#00D1FF] border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-white/60">Caricamento...</p>
                </div>
              ) : paymentMethods.length > 0 ? (
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <div 
                      key={method.id}
                      className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-white/10"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {method.brand} ••••{method.last4}
                          </p>
                          <p className="text-white/60 text-xs">
                            Scade {method.exp_month}/{method.exp_year}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {method.is_default && (
                          <Badge className="bg-green-600/20 text-green-400 text-xs">
                            Predefinita
                          </Badge>
                        )}
                        <ChevronRight className="w-4 h-4 text-white/40" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="w-16 h-16 text-white/20 mx-auto mb-4" />
                  <h3 className="text-white font-semibold mb-2">Nessuna Carta Salvata</h3>
                  <p className="text-white/60 mb-4 text-sm max-w-xs mx-auto">
                    Aggiungi una carta per abilitare acquisti rapidi di crediti M1U e contenuti premium.
                  </p>
                  <Button
                    onClick={handleAddCard}
                    disabled={loading}
                    className="bg-[#00D1FF] hover:bg-[#00B8E6] text-black font-semibold"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Aggiungi Carta
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* In-App Purchases Notice */}
          <Card className="bg-blue-900/20 border-blue-500/30 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <Smartphone className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-blue-100 font-semibold mb-1">Acquisti In-App</h4>
                  <p className="text-blue-200/80 text-sm">
                    Per acquisti di crediti M1U e contenuti digitali, utilizziamo i sistemi di pagamento ufficiali 
                    {isIOS ? " Apple (App Store)" : isAndroid ? " Google (Play Store)" : " dello store"} 
                    per garantire la massima sicurezza.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <Card className="bg-green-900/20 border-green-500/30 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-green-100 font-semibold mb-1">Sicurezza Garantita</h4>
                  <p className="text-green-200/80 text-sm">
                    I dati delle tue carte sono protetti con crittografia end-to-end. 
                    M1SSION™ non memorizza mai i numeri completi delle carte sui nostri server.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment History Link */}
          <Button
            onClick={() => navigate('/profile/payments-history')}
            variant="outline"
            className="w-full border-white/20 text-white hover:bg-white/10 font-medium"
          >
            📜 Visualizza Cronologia Pagamenti
          </Button>
        </motion.div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default PaymentMethodsPage;
