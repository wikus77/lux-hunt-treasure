// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
// 🔧 v4: Bottom sheet with INLINE Stripe checkout (no navigation)
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { createPortal } from 'react-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useAuth } from '@/hooks/use-auth';
import { useWouterNavigation } from '@/hooks/useWouterNavigation';
import { Settings, LogOut, Crown, X, User, ChevronDown, Zap, ArrowLeft, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProfileAvatar from '@/components/profile/ProfileAvatar';
import { useToast } from '@/hooks/use-toast';
import { toast as sonnerToast } from 'sonner';
import PulseEnergyBadge from '@/components/pulse/PulseEnergyBadge';
import PulseEnergyProgressBar from '@/components/pulse/PulseEnergyProgressBar';
import { usePulseEnergy } from '@/hooks/usePulseEnergy';
import { useProfileSubscription } from '@/hooks/profile/useProfileSubscription';
import { supabase } from '@/integrations/supabase/client';
import { getPriceCents, getDisplayPrice } from '@/lib/constants/pricingConfig';
import { getStripeSafe } from '@/lib/stripeFallback';

const stripePromise = getStripeSafe();

interface ProfileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  profileImage?: string | null;
}

// Plan config for inline display
const PLANS = [
  { id: 'Silver', emoji: '🥈', color: 'from-gray-300 to-gray-500', borderColor: 'border-gray-400/50', textColor: 'text-gray-300' },
  { id: 'Gold', emoji: '🥇', color: 'from-amber-400 to-amber-600', borderColor: 'border-amber-400/50', textColor: 'text-amber-300' },
  { id: 'Black', emoji: '⚫', color: 'from-gray-700 to-gray-900', borderColor: 'border-gray-600/50', textColor: 'text-gray-400' },
  { id: 'Titanium', emoji: '💎', color: 'from-purple-500 to-cyan-500', borderColor: 'border-purple-400/50', textColor: 'text-purple-300' },
];

// 🔧 Inline checkout form component
interface InlineCheckoutFormProps {
  plan: string;
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
  onCancel: () => void;
  userEmail: string;
}

const InlineCheckoutForm: React.FC<InlineCheckoutFormProps> = ({
  plan,
  amount,
  onSuccess,
  onCancel,
  userEmail
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Create payment intent
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        console.log('🔥 M1SSION™ ProfileBottomSheet: Creating payment intent for:', plan);

        const { data, error } = await supabase.functions.invoke('create-payment-intent', {
          body: {
            amount: amount,
            currency: 'eur',
            payment_type: 'subscription',
            plan: plan,
            description: `Abbonamento ${plan} - M1SSION™`
          }
        });

        if (error) {
          console.error('❌ Payment intent error:', error);
          setError('Errore nel sistema di pagamento');
          return;
        }

        const clientSecretValue = data?.client_secret || data?.clientSecret;
        if (clientSecretValue) {
          setClientSecret(clientSecretValue);
          console.log('✅ Payment intent created:', data?.payment_intent_id);
        } else {
          console.error('❌ No client secret received:', data);
          setError('Configurazione pagamento fallita');
        }
      } catch (err) {
        console.error('❌ Payment intent failed:', err);
        setError('Errore nel sistema di pagamento');
      }
    };

    createPaymentIntent();
  }, [plan, amount]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      sonnerToast.error('Sistema di pagamento non pronto');
      return;
    }

    setLoading(true);
    setError('');

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('Elemento carta non trovato');
      setLoading(false);
      return;
    }

    try {
      console.log('🚀 M1SSION™ Processing payment...');

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            email: userEmail,
          },
        },
      });

      if (stripeError) {
        console.error('❌ Payment failed:', stripeError);
        setError(stripeError.message || 'Pagamento fallito');
      } else if (paymentIntent?.status === 'succeeded') {
        console.log('✅ Payment succeeded:', paymentIntent.id);
        onSuccess(paymentIntent.id);
      }
    } catch (err) {
      console.error('❌ Payment processing error:', err);
      setError('Errore nel processare il pagamento');
    } finally {
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#ffffff',
        '::placeholder': {
          color: '#6b7280',
        },
        backgroundColor: 'transparent',
      },
      invalid: {
        color: '#ef4444',
        iconColor: '#ef4444',
      },
    },
    hidePostalCode: true,
  };

  return (
    <div className="space-y-4">
      {/* Plan summary */}
      <div className="text-center p-3 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg border border-purple-500/30">
        <div className="text-lg font-bold text-white">Abbonamento {plan}</div>
        <div className="text-2xl font-bold text-[#00D1FF]">€{(amount / 100).toFixed(2)}/mese</div>
      </div>

      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-600">
          <CardElement options={cardElementOptions} />
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 border-white/20 text-white/70 hover:bg-white/10"
            disabled={loading}
          >
            Annulla
          </Button>
          <Button
            type="submit"
            disabled={!stripe || loading || !clientSecret}
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Elaborazione...
              </>
            ) : (
              `Paga €${(amount / 100).toFixed(2)}`
            )}
          </Button>
        </div>
      </form>

      <div className="text-xs text-gray-400 text-center">
        🔒 Pagamento sicuro elaborato da Stripe
      </div>
    </div>
  );
};

const ProfileBottomSheet: React.FC<ProfileBottomSheetProps> = ({
  isOpen,
  onClose,
  profileImage
}) => {
  const [showUpgradePanel, setShowUpgradePanel] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showStripeCheckout, setShowStripeCheckout] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { user, logout } = useAuth();
  const { navigate } = useWouterNavigation();
  
  // 🆕 Swipe-to-close
  const dragY = useMotionValue(0);
  const dragOpacity = useTransform(dragY, [0, 200], [1, 0.5]);
  const SWIPE_THRESHOLD = 100;
  
  const handleDragEnd = useCallback((_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > SWIPE_THRESHOLD || info.velocity.y > 500) {
      onClose();
    }
    dragY.set(0);
  }, [onClose, dragY]);
  const { toast } = useToast();
  const sheetRef = useRef<HTMLDivElement>(null);
  const { pulseEnergy, currentRank, nextRank, progressToNextRank, loading: peLoading } = usePulseEnergy();
  const { subscription, upgradeSubscription } = useProfileSubscription();

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setShowUpgradePanel(false);
      setSelectedPlan(null);
      setShowStripeCheckout(false);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "✅ Logout completato",
        description: "Sei stato disconnesso con successo.",
      });
      onClose();
      navigate('/auth');
    } catch (error) {
      toast({
        title: "❌ Errore logout",
        description: "Impossibile disconnettersi. Riprova.",
        variant: "destructive"
      });
    }
  };

  const handleSettingsClick = () => {
    onClose();
    navigate('/settings');
  };

  const handleUpgradeClick = useCallback(() => {
    setShowUpgradePanel(!showUpgradePanel);
    setSelectedPlan(null);
    setShowStripeCheckout(false);
  }, [showUpgradePanel]);

  // 🔧 v4: Handle plan selection - opens Stripe checkout INLINE
  const handlePlanSelect = useCallback(async (plan: string) => {
    console.log(`🔥 M1SSION™ ProfileBottomSheet: Plan selected: ${plan}`);
    
    if (plan === 'Base') {
      // Handle downgrade to Base
      setIsProcessing(true);
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser) {
          await supabase
            .from('profiles')
            .update({ subscription_plan: 'Base', subscription_tier: 'Base' })
            .eq('id', currentUser.id);
          
          await upgradeSubscription('Base');
          
          sonnerToast.success('Piano Base attivato', {
            description: 'Stai utilizzando il piano gratuito',
            duration: 4000
          });
        }
      } catch (error) {
        console.error('❌ Downgrade error:', error);
        sonnerToast.error('Errore nel downgrade', {
          description: 'Riprova tra qualche istante',
          duration: 4000
        });
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // For paid plans, show inline Stripe checkout
    setSelectedPlan(plan);
    setShowStripeCheckout(true);
    console.log(`💳 M1SSION™ Opening inline Stripe checkout for ${plan}`);
  }, [upgradeSubscription]);

  // 🔧 v4: Handle successful payment INLINE
  const handlePaymentSuccess = useCallback(async (paymentIntentId: string) => {
    console.log('🎉 M1SSION™ ProfileBottomSheet: Payment successful:', paymentIntentId);
    
    if (!selectedPlan) return;
    
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      // Call handle-payment-success to activate subscription
      const { data: successData, error: successError } = await supabase.functions.invoke('handle-payment-success', {
        body: {
          payment_intent_id: paymentIntentId,
          user_id: currentUser.id,
          plan: selectedPlan
        }
      });

      if (successError) {
        console.error('❌ handle-payment-success error:', successError);
        sonnerToast.error('Errore attivazione', {
          description: `Contatta supporto con ref: ${paymentIntentId}`,
          duration: 8000
        });
        return;
      }

      console.log('✅ handle-payment-success result:', successData);

      // Update local state
      await upgradeSubscription(selectedPlan);
      
      setShowStripeCheckout(false);
      setSelectedPlan(null);
      setShowUpgradePanel(false);
      
      sonnerToast.success(`🎉 Piano ${selectedPlan} attivato!`, {
        description: 'Il tuo abbonamento è ora attivo',
        duration: 6000
      });
      
    } catch (error) {
      console.error('❌ Payment success handling error:', error);
      sonnerToast.error('Errore attivazione', {
        description: 'Il pagamento è andato a buon fine ma c\'è stato un errore. Contatta il supporto.',
        duration: 8000
      });
    }
  }, [selectedPlan, upgradeSubscription]);

  // 🔧 v4: Handle payment cancellation
  const handlePaymentCancel = useCallback(() => {
    console.log('❌ M1SSION™ ProfileBottomSheet: Payment cancelled');
    setShowStripeCheckout(false);
    setSelectedPlan(null);
  }, []);

  // Get user display name and email
  const displayName = user?.user_metadata?.full_name || 
                     `${user?.user_metadata?.first_name || ''} ${user?.user_metadata?.last_name || ''}`.trim() ||
                     'Agente';
  const email = user?.email || '';
  const userId = user?.id ? user.id.substring(0, 8) : 'N/A';

  // Get subscription tier with badges
  const currentTier = subscription?.plan || user?.user_metadata?.subscription_tier || 'Base';
  const getTierDisplay = () => {
    switch (currentTier?.toLowerCase()) {
      case 'silver':
        return { name: 'Silver', color: 'bg-gradient-to-r from-gray-300 to-gray-500 text-gray-900', emoji: '🥈' };
      case 'gold':
        return { name: 'Gold', color: 'bg-gradient-to-r from-amber-400 to-amber-600 text-white', emoji: '🥇' };
      case 'black':
        return { name: 'Black', color: 'bg-gray-800 text-white', emoji: '⚫' };
      case 'titanium':
        return { name: 'Titanium', color: 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white', emoji: '💎' };
      default:
        return { name: 'Base', color: 'bg-gray-600 text-white', emoji: '📦' };
    }
  };

  const tierInfo = getTierDisplay();

  // Don't render anything if not in browser
  if (typeof window === 'undefined') return null;

  const stripeOptions = {
    appearance: {
      theme: 'night' as const,
      variables: {
        colorPrimary: '#8b5cf6',
        colorBackground: '#1f2937',
        colorText: '#ffffff',
      },
    },
  };

  const sheetContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99998]"
            onClick={onClose}
          />

          {/* Bottom Sheet - SEMI-TRASPARENTE + SWIPE */}
          <motion.div
            ref={sheetRef}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-[99999] max-h-[90vh] overflow-hidden"
            style={{
              paddingBottom: 'env(safe-area-inset-bottom, 0px)',
              opacity: dragOpacity,
              y: dragY,
            }}
            // 🆕 SWIPE-TO-CLOSE
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={handleDragEnd}
          >
            {/* 🆕 Background SEMI-TRASPARENTE */}
            <div className="rounded-t-3xl bg-[#0a0a0f]/85 backdrop-blur-xl border-t border-x border-[#00D1FF]/30 shadow-2xl overflow-hidden"
              style={{
                boxShadow: '0 -10px 40px rgba(0, 209, 255, 0.15), 0 0 0 1px rgba(0, 209, 255, 0.1)',
              }}
            >
              {/* Drag handle - più visibile */}
              <div className="flex justify-center pt-3 pb-2 cursor-grab">
                <div className="w-12 h-1.5 rounded-full bg-white/30" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-4 pb-3 border-b border-white/10">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-[#00D1FF]" />
                  <h3 className="font-orbitron font-bold text-white">PROFILO AGENTE</h3>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="w-8 h-8 rounded-full hover:bg-white/10"
                >
                  <X className="w-4 h-4 text-white/70" />
                </Button>
              </div>

              {/* Content - Scrollable */}
              <div 
                className="overflow-y-auto overscroll-contain px-4 py-4 space-y-4"
                style={{
                  maxHeight: 'calc(90vh - 80px - env(safe-area-inset-bottom, 0px))',
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                {/* User Info */}
                <div className="flex items-center space-x-4 p-3 rounded-xl bg-[#1a1a1a] border border-white/10">
                  <ProfileAvatar
                    profileImage={profileImage}
                    className="w-14 h-14 border-2 border-[#00D1FF]/50"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-base truncate">{displayName}</h3>
                    <p className="text-white/60 text-sm truncate">{email}</p>
                    <p className="text-white/40 text-xs">ID: {userId}</p>
                  </div>
                </div>

                {/* PE + Rank System */}
                {!peLoading && currentRank && (
                  <div className="p-3 rounded-xl bg-[#1a1a1a] border border-white/10 space-y-3">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-[#00D1FF]" />
                      <span className="text-white/70 text-sm font-medium">Pulse Energy</span>
                    </div>
                    <PulseEnergyBadge rank={currentRank} showCode={true} />
                    <PulseEnergyProgressBar
                      currentRank={currentRank}
                      nextRank={nextRank}
                      progressPercent={progressToNextRank}
                      currentPE={pulseEnergy}
                    />
                  </div>
                )}

                {/* Subscription Tier with Upgrade */}
                <div className="p-3 rounded-xl bg-[#1a1a1a] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Crown className="w-4 h-4 text-amber-400" />
                      <span className="text-white/70 text-sm">Piano attivo:</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${tierInfo.color}`}>
                      {tierInfo.emoji} {tierInfo.name}
                    </span>
                  </div>
                  
                  {/* Upgrade button */}
                  <Button
                    onClick={handleUpgradeClick}
                    variant="outline"
                    className="w-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-[#00D1FF]/50 text-[#00D1FF] hover:bg-[#00D1FF]/20"
                    disabled={isProcessing}
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    {showUpgradePanel ? 'Nascondi Piani' : 'Upgrade Piano'}
                    <motion.div
                      animate={{ rotate: showUpgradePanel ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="ml-2"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </motion.div>
                  </Button>

                  {/* 🔧 v4: Inline Upgrade Panel with Stripe Checkout */}
                  <AnimatePresence>
                    {showUpgradePanel && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="pt-3 space-y-3">
                          {/* Show Stripe checkout if a plan is selected */}
                          {showStripeCheckout && selectedPlan ? (
                            <div className="space-y-3">
                              <div className="flex items-center space-x-2 pb-2 border-b border-white/10">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={handlePaymentCancel}
                                  className="text-white/60 hover:text-white p-1"
                                >
                                  <ArrowLeft className="w-4 h-4 mr-1" />
                                  Indietro
                                </Button>
                                <span className="text-white font-medium">Checkout {selectedPlan}</span>
                              </div>
                              
                              {/* Embedded inline Stripe checkout */}
                              <Elements stripe={stripePromise} options={stripeOptions}>
                                <InlineCheckoutForm
                                  plan={selectedPlan}
                                  amount={getPriceCents(selectedPlan)}
                                  onSuccess={handlePaymentSuccess}
                                  onCancel={handlePaymentCancel}
                                  userEmail={email}
                                />
                              </Elements>
                            </div>
                          ) : (
                            <>
                              <p className="text-xs text-white/60 text-center">Seleziona un piano per l'upgrade:</p>
                              <div className="grid grid-cols-2 gap-2">
                                {PLANS.map((plan) => (
                                  <Button
                                    key={plan.id}
                                    variant="outline"
                                    className={`${plan.borderColor} ${plan.textColor} hover:bg-white/10 hover:border-white/40 flex flex-col items-center py-3 h-auto`}
                                    onClick={() => handlePlanSelect(plan.id)}
                                    disabled={isProcessing || currentTier?.toLowerCase() === plan.id.toLowerCase()}
                                  >
                                    <span className="text-lg">{plan.emoji}</span>
                                    <span className="font-medium">{plan.id}</span>
                                    <span className="text-xs opacity-70">{getDisplayPrice(plan.id)}/mese</span>
                                    {currentTier?.toLowerCase() === plan.id.toLowerCase() && (
                                      <span className="flex items-center text-xs text-green-400 mt-1">
                                        <Check className="w-3 h-3 mr-1" /> Attivo
                                      </span>
                                    )}
                                  </Button>
                                ))}
                              </div>
                              <Button
                                variant="ghost"
                                className="w-full text-sm text-[#00D1FF]/70 hover:text-[#00D1FF]"
                                onClick={() => {
                                  onClose();
                                  navigate('/subscriptions');
                                }}
                              >
                                Vedi tutti i piani e dettagli →
                              </Button>
                            </>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-white/80 hover:bg-white/10 hover:text-white"
                    onClick={handleSettingsClick}
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Modifica profilo
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-400 hover:bg-red-500/10"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Esci
                  </Button>
                </div>

                {/* Bottom spacer for safe area */}
                <div className="h-4" />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // Render via portal to document.body
  return createPortal(sheetContent, document.body);
};

export default ProfileBottomSheet;
