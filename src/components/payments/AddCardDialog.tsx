// 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
// M1SSION™ Add Card Dialog Component - Safari PWA ULTIMATE FIX
import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Plus, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface AddCardDialogProps {
  onAddCard: (cardData: {
    cardNumber: string;
    expiryMonth: string;
    expiryYear: string;
    cvc: string;
    nameOnCard: string;
  }) => Promise<void>;
  loading: boolean;
  children?: React.ReactNode;
}

const AddCardDialog: React.FC<AddCardDialogProps> = ({ onAddCard, loading, children }) => {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvc: '',
    nameOnCard: ''
  });

  // Safari PWA viewport and keyboard handling
  useEffect(() => {
    if (open) {
      console.log('💳 AddCardDialog: Modal opening');
      
      // Prevent body scroll and fix position for iOS
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
    }
  }, [open]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setCardData({
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvc: '',
        nameOnCard: ''
      });
      setError(null);
      setSubmitting(false);
    }
  }, [open]);

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

  const validateForm = useCallback(() => {
    const { cardNumber, expiryMonth, expiryYear, cvc, nameOnCard } = cardData;
    
    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 13) {
      return 'Numero carta non valido';
    }
    
    if (!expiryMonth || parseInt(expiryMonth) < 1 || parseInt(expiryMonth) > 12) {
      return 'Mese di scadenza non valido';
    }
    
    if (!expiryYear || parseInt(expiryYear) < new Date().getFullYear()) {
      return 'Anno di scadenza non valido';
    }
    
    if (!cvc || cvc.length < 3) {
      return 'CVC non valido';
    }
    
    if (!nameOnCard || nameOnCard.trim().length < 2) {
      return 'Nome sulla carta richiesto';
    }
    
    return null;
  }, [cardData]);

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
      console.log('💳 Tentativo salvataggio carta...', {
        brand: cardData.cardNumber[0] === '4' ? 'Visa' : 'Mastercard',
        last4: cardData.cardNumber.replace(/\s/g, '').slice(-4)
      });
      
      await onAddCard(cardData);
      
      console.log('💳 Dati salvati con successo!');
      toast.success('✅ Carta aggiunta', { 
        description: 'La carta è stata salvata correttamente' 
      });
      
      // Close modal only on success
      setOpen(false);
      
    } catch (error) {
      console.error('❌ Errore salvataggio carta:', error);
      const errorMessage = error instanceof Error ? error.message : 'Errore durante il salvataggio';
      setError(errorMessage);
      toast.error('❌ Errore salvataggio', { 
        description: 'Impossibile salvare la carta. Riprova.' 
      });
      
      // DO NOT close modal on error - let user retry
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = useCallback(() => {
    if (!submitting) {
      setOpen(false);
    }
  }, [submitting]);

  const isFormValid = validateForm() === null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button
            disabled={loading}
            size="sm"
            className="bg-[#00D1FF] hover:bg-[#00B8E6] text-black font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-1" />
            Aggiungi
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent 
        className="fixed inset-0 z-[9999] bg-black/98 backdrop-blur-md border-0 rounded-none p-0 m-0 flex flex-col"
        style={{
          width: '100vw',
          height: '100vh',
          maxWidth: '100vw',
          maxHeight: '100vh',
          left: '0',
          top: '0',
          transform: 'none',
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain'
        }}
      >
        {/* Fixed Header */}
        <div className="flex-shrink-0 bg-black/95 border-b border-[#00D1FF]/20 safe-area-top sticky top-0 z-10">
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

              {/* Security Notice */}
              <div className="bg-green-900/30 border border-green-500/40 rounded-xl p-4 mt-6">
                <div className="flex items-start space-x-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full mt-1 flex-shrink-0"></div>
                  <div className="text-green-100">
                    <p className="font-semibold mb-2 text-sm">🔒 Sicurezza Garantita</p>
                    <p className="text-green-200/90 text-sm leading-relaxed">
                      I dati sono crittografati e processati tramite Stripe PCI DSS Level 1.
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Fixed Footer */}
        <div 
          className="flex-shrink-0 bg-black/95 border-t border-[#00D1FF]/20 safe-area-bottom sticky bottom-0 z-10"
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
      </DialogContent>
    </Dialog>
  );
};

export default AddCardDialog;