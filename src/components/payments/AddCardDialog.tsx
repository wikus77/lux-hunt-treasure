// 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
// M1SSION™ Add Card Dialog Component - Safari PWA Fixed
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Plus } from 'lucide-react';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!cardData.cardNumber || !cardData.expiryMonth || !cardData.expiryYear || 
        !cardData.cvc || !cardData.nameOnCard) {
      return;
    }

    await onAddCard(cardData);
    
    // Reset form and close dialog
    setCardData({
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvc: '',
      nameOnCard: ''
    });
    setOpen(false);
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
      <DialogContent className="bg-black/95 border-[#00D1FF]/30 backdrop-blur-md shadow-2xl w-full max-w-md mx-auto fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-h-[85vh] sm:max-h-[90vh] flex flex-col rounded-xl z-50 p-0 overflow-y-auto" 
        style={{ 
          maxHeight: 'calc(100vh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 40px)',
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain'
        }}>
        <DialogHeader className="flex-shrink-0 p-6 border-b border-[#00D1FF]/20">
          <DialogTitle className="text-white font-orbitron flex items-center text-xl">
            <CreditCard className="w-6 h-6 mr-3 text-[#00D1FF]" />
            Aggiungi Carta di Credito
          </DialogTitle>
          <p className="text-white/70 text-sm mt-2">
            I tuoi dati sono protetti con crittografia end-to-end
          </p>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto overscroll-contain px-2" style={{ WebkitOverflowScrolling: 'touch' }}>
          <form onSubmit={handleSubmit} className="p-4 pb-0 space-y-4 sm:p-6 sm:space-y-6">
            {/* Card Number */}
            <div className="space-y-3">
              <Label htmlFor="cardNumber" className="text-white font-medium flex items-center">
                <CreditCard className="w-4 h-4 mr-2 text-[#00D1FF]" />
                Numero Carta
              </Label>
              <Input
                id="cardNumber"
                type="text"
                value={cardData.cardNumber}
                onChange={handleCardNumberChange}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                className="bg-black/30 border-[#00D1FF]/30 text-white placeholder:text-white/50 focus:border-[#00D1FF] focus:ring-[#00D1FF]/20 h-12 text-lg font-mono"
                required
              />
            </div>

            {/* Expiry Date & CVC */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-3">
                <Label htmlFor="expiryMonth" className="text-white font-medium">Mese</Label>
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
                  className="bg-black/30 border-[#00D1FF]/30 text-white placeholder:text-white/50 focus:border-[#00D1FF] focus:ring-[#00D1FF]/20 h-12 text-center font-mono"
                  required
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="expiryYear" className="text-white font-medium">Anno</Label>
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
                  className="bg-black/30 border-[#00D1FF]/30 text-white placeholder:text-white/50 focus:border-[#00D1FF] focus:ring-[#00D1FF]/20 h-12 text-center font-mono"
                  required
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="cvc" className="text-white font-medium">CVC</Label>
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
                  className="bg-black/30 border-[#00D1FF]/30 text-white placeholder:text-white/50 focus:border-[#00D1FF] focus:ring-[#00D1FF]/20 h-12 text-center font-mono"
                  required
                />
              </div>
            </div>

            {/* Name on Card */}
            <div className="space-y-3">
              <Label htmlFor="nameOnCard" className="text-white font-medium">Nome come sulla Carta</Label>
              <Input
                id="nameOnCard"
                type="text"
                value={cardData.nameOnCard}
                onChange={(e) => setCardData(prev => ({ ...prev, nameOnCard: e.target.value.toUpperCase() }))}
                placeholder="MARIO ROSSI"
                className="bg-black/30 border-[#00D1FF]/30 text-white placeholder:text-white/50 focus:border-[#00D1FF] focus:ring-[#00D1FF]/20 h-12 uppercase"
                required
              />
            </div>

            {/* Security Notice */}
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
              <div className="text-green-100 text-sm">
                <p className="font-medium mb-1">🔒 Sicurezza Garantita</p>
                <p className="text-green-200/80">
                  I tuoi dati sono crittografati e processati tramite Stripe, leader mondiale nei pagamenti sicuri.
                </p>
              </div>
            </div>
          </form>
        </div>

        {/* Sticky Footer Buttons */}
        <div className="flex-shrink-0 border-t border-[#00D1FF]/20 p-4 sm:p-6 bg-black/95 sticky bottom-0"
          style={{ 
            paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))'
          }}>
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="flex-1 border-white/30 text-white hover:bg-white/10 h-12 font-medium"
            >
              Annulla
            </Button>
            <Button
              type="submit"
              disabled={loading || !cardData.cardNumber || !cardData.expiryMonth || !cardData.expiryYear || !cardData.cvc || !cardData.nameOnCard}
              onClick={handleSubmit}
              className="flex-1 bg-[#00D1FF] hover:bg-[#00B8E6] text-black font-semibold h-12 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin mr-2"></div>
                  Aggiunta...
                </div>
              ) : (
                '💳 Salva Metodo'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddCardDialog;