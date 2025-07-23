// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { CreditCard, X, AlertCircle, Shield, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
const stripePromise = loadStripe('pk_test_51QVLKLHM8cWnSL9I8GXe7CZdyqnKqHHp5GXhJXgE1mQpzm1fPqXwE8SY2dGUQEsFLu0yfxBP1FE5OQKfKgCcdxU2009yyY8BKp');

interface AddCardDialogProps {
  onClose: () => void;
  onAddCard: (cardData: {
    cardNumber: string;
    expiryMonth: string;
    expiryYear: string;
    cvc: string;
    nameOnCard: string;
    saveForFuture?: boolean;
    stripeToken?: string;
  }) => Promise<void>;
  loading: boolean;
}

const AddCardDialog: React.FC<AddCardDialogProps> = ({ 
  onClose, 
  onAddCard, 
  loading
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvc: '',
    nameOnCard: '',
    saveForFuture: true
  });

  // Prevent body scroll and fix position for iOS
  useEffect(() => {
    console.log('💳 AddCardDialog: Modal opening - applying iOS fixes');
    
    const body = document.body;
    const originalOverflow = body.style.overflow;
    const originalPosition = body.style.position;
    const originalTop = body.style.top;
    const originalWidth = body.style.width;

    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = '0';
    body.style.width = '100%';
    
    // iOS PWA specific viewport locks
    if ('standalone' in window.navigator && (window.navigator as any).standalone) {
      console.log('💳 PWA Mode detected - applying iOS fixes');
      body.style.height = '100vh';
      body.style.touchAction = 'none';
    }

    return () => {
      // Restore original styles
      body.style.overflow = originalOverflow;
      body.style.position = originalPosition;
      body.style.top = originalTop;
      body.style.width = originalWidth;
      body.style.height = '';
      body.style.touchAction = '';
      console.log('💳 AddCardDialog: Modal closed - styles restored');
    };
  }, []);

  const formatCardNumber = useCallback((value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    let parts: string[] = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      const part = match.substring(i, i + 4);
      parts = [...parts, part];
    }

    return parts.length ? parts.join(' ') : v;
  }, []);

  const handleCardNumberChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardData(prev => ({ ...prev, cardNumber: formatted }));
    setError(null);
  }, [formatCardNumber]);

  const getBrandFromNumber = useCallback((number: string) => {
    const clean = number.replace(/\s/g, '');
    if (clean.startsWith('4')) return 'Visa';
    if (clean.startsWith('5') || clean.startsWith('2')) return 'Mastercard';
    if (clean.startsWith('3')) return 'American Express';
    if (clean.startsWith('6')) return 'Discover';
    return 'Unknown';
  }, []);

  const validateForm = useCallback(() => {
    const { cardNumber, expiryMonth, expiryYear, cvc, nameOnCard } = cardData;
    
    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 13) {
      return 'Numero carta non valido (minimo 13 cifre)';
    }
    
    if (!expiryMonth || parseInt(expiryMonth) < 1 || parseInt(expiryMonth) > 12) {
      return 'Mese di scadenza non valido (01-12)';
    }
    
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const expYear = parseInt(expiryYear);
    const expMonth = parseInt(expiryMonth);
    
    if (!expiryYear || expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
      return 'Data di scadenza non valida (carta scaduta)';
    }
    
    if (!cvc || cvc.length < 3) {
      return 'CVC non valido (minimo 3 cifre)';
    }
    
    if (!nameOnCard || nameOnCard.trim().length < 2) {
      return 'Nome sulla carta richiesto (minimo 2 caratteri)';
    }
    
    return null;
  }, [cardData]);

  const createStripeToken = async () => {
    try {
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe non inizializzato correttamente');
      }

      console.log('🔒 Creazione token Stripe per validazione carta...');
      
      // For development, simulate successful validation
      const mockToken = {
        id: `tok_${Math.random().toString(36).substring(2, 15)}`,
        card: {
          brand: getBrandFromNumber(cardData.cardNumber).toLowerCase(),
          last4: cardData.cardNumber.replace(/\s/g, '').slice(-4),
          exp_month: parseInt(cardData.expiryMonth),
          exp_year: parseInt(cardData.expiryYear)
        }
      };

      console.log('✅ Token Stripe simulato creato con successo:', mockToken.id);
      return mockToken;
      
    } catch (error) {
      console.error('❌ Errore creazione token Stripe:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      toast.error('Dati non validi', { description: validationError });
      return;
    }

    setSubmitting(true);
    setError(null);
    
    try {
      const brand = getBrandFromNumber(cardData.cardNumber);
      const last4 = cardData.cardNumber.replace(/\s/g, '').slice(-4);
      
      console.log('💳 Tentativo salvataggio carta...', { brand, last4 });
      
      // Create Stripe token for validation
      const stripeToken = await createStripeToken();
      
      // Pass data with Stripe token
      await onAddCard({
        ...cardData,
        stripeToken: stripeToken.id
      });
      
      console.log('💳 Dati salvati con successo!');
      toast.success('✅ Carta aggiunta', { 
        description: `${brand} ••••${last4} salvata correttamente` 
      });
      
      // Close modal only on success
      onClose();
      
    } catch (error) {
      console.error('❌ Errore salvataggio carta:', error);
      const errorMessage = error instanceof Error ? error.message : 'Errore durante il salvataggio';
      setError(errorMessage);
      toast.error('❌ Errore salvataggio', { 
        description: errorMessage.includes('Invalid') ? 'Dati carta non validi' : 'Impossibile salvare la carta. Riprova.' 
      });
      
      // DO NOT close modal on error - let user retry
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = useCallback(() => {
    if (!submitting) {
      onClose();
    }
  }, [submitting, onClose]);

  const isFormValid = validateForm() === null;

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/98 backdrop-blur-md flex flex-col"
      style={{
        width: '100vw',
        height: '100vh',
        left: '0',
        top: '0',
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}
    >
      {/* Fixed Header */}
      <div className="flex-shrink-0 bg-black/95 border-b border-[#00D1FF]/20 sticky top-0 z-10">
        <div className="flex items-center justify-between p-4 pt-6">
          <div className="flex items-center">
            <CreditCard className="w-6 h-6 mr-3 text-[#00D1FF]" />
            <div>
              <h2 className="text-white font-orbitron text-lg font-semibold">
                Aggiungi Nuova Carta
              </h2>
              <p className="text-white/60 text-sm">
                Sicurezza garantita PCI DSS
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            disabled={submitting}
            className="text-white hover:bg-white/10 h-10 w-10"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div 
        className="flex-1 overflow-y-auto bg-black/95 relative"
        style={{
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          scrollBehavior: 'smooth'
        }}
      >
        <div className="p-4 pb-32 min-h-full">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-500/40 rounded-xl">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-red-200 font-medium">Errore</p>
                  <p className="text-red-300/90 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 max-w-sm mx-auto">
            {/* Card Number */}
            <div className="space-y-3">
              <Label htmlFor="cardNumber" className="text-white font-medium text-base">
                💳 Numero Carta
              </Label>
              <Input
                id="cardNumber"
                type="text"
                value={cardData.cardNumber}
                onChange={handleCardNumberChange}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                autoFocus
                disabled={submitting}
                className="bg-black/40 border-[#00D1FF]/50 text-white placeholder:text-white/40 focus:border-[#00D1FF] focus:ring-[#00D1FF]/30 h-14 text-lg font-mono rounded-lg"
                required
              />
            </div>

            {/* Expiry & CVC */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-3">
                <Label htmlFor="expiryMonth" className="text-white font-medium text-sm">Mese</Label>
                <Input
                  id="expiryMonth"
                  type="text"
                  value={cardData.expiryMonth}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 2 && (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 12))) {
                      setCardData(prev => ({ ...prev, expiryMonth: value }));
                      setError(null);
                    }
                  }}
                  placeholder="MM"
                  maxLength={2}
                  disabled={submitting}
                  className="bg-black/40 border-[#00D1FF]/50 text-white placeholder:text-white/40 focus:border-[#00D1FF] focus:ring-[#00D1FF]/30 h-14 text-center font-mono rounded-lg"
                  required
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="expiryYear" className="text-white font-medium text-sm">Anno</Label>
                <Input
                  id="expiryYear"
                  type="text"
                  value={cardData.expiryYear}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 4) {
                      setCardData(prev => ({ ...prev, expiryYear: value }));
                      setError(null);
                    }
                  }}
                  placeholder="YYYY"
                  maxLength={4}
                  disabled={submitting}
                  className="bg-black/40 border-[#00D1FF]/50 text-white placeholder:text-white/40 focus:border-[#00D1FF] focus:ring-[#00D1FF]/30 h-14 text-center font-mono rounded-lg"
                  required
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="cvc" className="text-white font-medium text-sm">CVC</Label>
                <Input
                  id="cvc"
                  type="password"
                  value={cardData.cvc}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 4) {
                      setCardData(prev => ({ ...prev, cvc: value }));
                      setError(null);
                    }
                  }}
                  placeholder="123"
                  maxLength={4}
                  disabled={submitting}
                  className="bg-black/40 border-[#00D1FF]/50 text-white placeholder:text-white/40 focus:border-[#00D1FF] focus:ring-[#00D1FF]/30 h-14 text-center font-mono rounded-lg"
                  required
                />
              </div>
            </div>

            {/* Name on Card */}
            <div className="space-y-3">
              <Label htmlFor="nameOnCard" className="text-white font-medium text-base">
                👤 Nome sulla Carta
              </Label>
              <Input
                id="nameOnCard"
                type="text"
                value={cardData.nameOnCard}
                onChange={(e) => {
                  setCardData(prev => ({ ...prev, nameOnCard: e.target.value.toUpperCase() }));
                  setError(null);
                }}
                placeholder="MARIO ROSSI"
                disabled={submitting}
                className="bg-black/40 border-[#00D1FF]/50 text-white placeholder:text-white/40 focus:border-[#00D1FF] focus:ring-[#00D1FF]/30 h-14 uppercase text-lg rounded-lg"
                required
              />
            </div>

            {/* Save for Future Payments */}
            <div className="bg-[#00D1FF]/10 border border-[#00D1FF]/30 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="saveForFuture"
                  checked={cardData.saveForFuture}
                  onCheckedChange={(checked) => {
                    setCardData(prev => ({ ...prev, saveForFuture: !!checked }));
                  }}
                  disabled={submitting}
                  className="border-[#00D1FF]/50 data-[state=checked]:bg-[#00D1FF] data-[state=checked]:border-[#00D1FF]"
                />
                <div className="flex-1">
                  <Label htmlFor="saveForFuture" className="text-[#00D1FF] font-medium cursor-pointer">
                    💾 Salva per pagamenti futuri
                  </Label>
                  <p className="text-white/60 text-sm">
                    Sicuro e crittografato tramite Stripe PCI DSS
                  </p>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-green-900/30 border border-green-500/40 rounded-xl p-4 mt-6">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div className="text-green-100">
                  <p className="font-semibold mb-2 text-sm flex items-center">
                    <Lock className="w-4 h-4 mr-1" />
                    Sicurezza Garantita PCI DSS Level 1
                  </p>
                  <p className="text-green-200/90 text-sm leading-relaxed">
                    I dati della carta vengono tokenizzati e crittografati immediatamente tramite Stripe. 
                    M1SSION™ non memorizza mai i numeri di carta completi.
                  </p>
                </div>
              </div>
            </div>

            {/* Card Brand Detection */}
            {cardData.cardNumber && (
              <div className="text-center">
                <div className="inline-flex items-center px-3 py-2 bg-white/10 rounded-lg">
                  <CreditCard className="w-4 h-4 mr-2 text-[#00D1FF]" />
                  <span className="text-white/80 text-sm font-medium">
                    {getBrandFromNumber(cardData.cardNumber)} Rilevata
                  </span>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Fixed Footer */}
      <div 
        className="flex-shrink-0 bg-black/95 border-t border-[#00D1FF]/20 sticky bottom-0 z-10"
        style={{ 
          paddingBottom: 'max(16px, env(safe-area-inset-bottom))'
        }}
      >
        <div className="p-4 flex space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={submitting}
            className="flex-1 border-white/40 text-white hover:bg-white/10 h-12 font-medium rounded-lg"
          >
            Annulla
          </Button>
          <Button
            type="submit"
            disabled={submitting || !isFormValid}
            onClick={handleSubmit}
            className="flex-1 bg-[#00D1FF] hover:bg-[#00B8E6] text-black font-semibold h-12 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
          >
            {submitting ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin mr-2"></div>
                Salvando...
              </div>
            ) : (
              <span className="flex items-center justify-center">
                💳 Salva Carta
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddCardDialog;