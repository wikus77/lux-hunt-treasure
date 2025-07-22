// 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
// M1SSION™ Add Card Dialog Component - Safari PWA Fixed
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Plus, X } from 'lucide-react';

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
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvc: '',
    nameOnCard: ''
  });

  // Force viewport behavior for iOS PWA
  useEffect(() => {
    if (open) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      
      // iOS PWA specific fixes
      if ((window.navigator as any).standalone) {
        document.body.style.height = '100vh';
        document.body.style.touchAction = 'none';
      }
    } else {
      // Restore body scroll
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
      document.body.style.touchAction = '';
    }

    return () => {
      // Cleanup on unmount
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
      document.body.style.touchAction = '';
    };
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!cardData.cardNumber || !cardData.expiryMonth || !cardData.expiryYear || 
        !cardData.cvc || !cardData.nameOnCard) {
      return;
    }

    try {
      await onAddCard(cardData);
      
      // Reset form and close dialog only on success
      setCardData({
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvc: '',
        nameOnCard: ''
      });
      setOpen(false);
    } catch (error) {
      console.error('Error adding card:', error);
      // Keep the dialog open on error so user can retry
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    let parts: string[] = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      const part = match.substring(i, i + 4);
      parts = [...parts, part];
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardData(prev => ({ ...prev, cardNumber: formatted }));
  };

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
        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md border-0 rounded-none p-0 m-0 w-screen h-screen flex flex-col"
        style={{
          maxHeight: '100vh',
          height: '100vh',
          width: '100vw',
          left: '0',
          top: '0',
          transform: 'none',
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain'
        }}
      >
        {/* Header - Always Visible */}
        <div className="flex-shrink-0 bg-black/95 border-b border-[#00D1FF]/20 safe-area-top">
          <div className="flex items-center justify-between p-4 pt-6">
            <div className="flex items-center">
              <CreditCard className="w-6 h-6 mr-3 text-[#00D1FF]" />
              <div>
                <h2 className="text-white font-orbitron text-lg font-semibold">
                  Aggiungi Carta
                </h2>
                <p className="text-white/60 text-sm">
                  Dati protetti con crittografia
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              className="text-white hover:bg-white/10 h-10 w-10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div 
          className="flex-1 overflow-y-auto bg-black/95"
          style={{
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
            scrollBehavior: 'smooth'
          }}
        >
          <div className="p-4 pb-24">
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
                  className="bg-black/40 border-[#00D1FF]/50 text-white placeholder:text-white/40 focus:border-[#00D1FF] focus:ring-[#00D1FF]/30 h-14 text-lg font-mono rounded-lg"
                  required
                />
              </div>

              {/* Expiry Date & CVC */}
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
                      }
                    }}
                    placeholder="MM"
                    maxLength={2}
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
                      }
                    }}
                    placeholder="YYYY"
                    maxLength={4}
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
                      }
                    }}
                    placeholder="123"
                    maxLength={4}
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
                  onChange={(e) => setCardData(prev => ({ ...prev, nameOnCard: e.target.value.toUpperCase() }))}
                  placeholder="MARIO ROSSI"
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
                      I tuoi dati sono crittografati con protocollo SSL e processati tramite Stripe, 
                      conforme PCI DSS Level 1.
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Fixed Footer - Always Visible */}
        <div 
          className="flex-shrink-0 bg-black/95 border-t border-[#00D1FF]/20 safe-area-bottom"
          style={{ 
            paddingBottom: 'env(safe-area-inset-bottom, 0px)'
          }}
        >
          <div className="p-4 flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="flex-1 border-white/40 text-white hover:bg-white/10 h-12 font-medium rounded-lg"
            >
              Annulla
            </Button>
            <Button
              type="submit"
              disabled={loading || !cardData.cardNumber || !cardData.expiryMonth || !cardData.expiryYear || !cardData.cvc || !cardData.nameOnCard}
              onClick={handleSubmit}
              className="flex-1 bg-[#00D1FF] hover:bg-[#00B8E6] text-black font-semibold h-12 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
            >
              {loading ? (
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