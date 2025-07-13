// 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
// M1SSION™ Add Card Dialog Component - Object Immutability Fixed
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
            className="bg-[#00D1FF] hover:bg-[#00B8E6] text-black"
          >
            <Plus className="w-4 h-4 mr-1" />
            Aggiungi
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-black/90 border-[#00D1FF]/20 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-white font-orbitron flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Aggiungi Carta di Credito
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Card Number */}
          <div className="space-y-2">
            <Label htmlFor="cardNumber" className="text-white">Numero Carta</Label>
            <Input
              id="cardNumber"
              type="text"
              value={cardData.cardNumber}
              onChange={handleCardNumberChange}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              className="bg-black/20 border-white/20 text-white placeholder:text-white/50"
              required
            />
          </div>

          {/* Expiry Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiryMonth" className="text-white">Mese</Label>
              <Input
                id="expiryMonth"
                type="text"
                value={cardData.expiryMonth}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 2 && parseInt(value) <= 12) {
                    setCardData(prev => ({ ...prev, expiryMonth: value }));
                  }
                }}
                placeholder="MM"
                maxLength={2}
                className="bg-black/20 border-white/20 text-white placeholder:text-white/50"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryYear" className="text-white">Anno</Label>
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
                className="bg-black/20 border-white/20 text-white placeholder:text-white/50"
                required
              />
            </div>
          </div>

          {/* CVC */}
          <div className="space-y-2">
            <Label htmlFor="cvc" className="text-white">CVC</Label>
            <Input
              id="cvc"
              type="text"
              value={cardData.cvc}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 4) {
                  setCardData(prev => ({ ...prev, cvc: value }));
                }
              }}
              placeholder="123"
              maxLength={4}
              className="bg-black/20 border-white/20 text-white placeholder:text-white/50"
              required
            />
          </div>

          {/* Name on Card */}
          <div className="space-y-2">
            <Label htmlFor="nameOnCard" className="text-white">Nome su Carta</Label>
            <Input
              id="nameOnCard"
              type="text"
              value={cardData.nameOnCard}
              onChange={(e) => setCardData(prev => ({ ...prev, nameOnCard: e.target.value.toUpperCase() }))}
              placeholder="MARIO ROSSI"
              className="bg-black/20 border-white/20 text-white placeholder:text-white/50"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 border-white/20 text-white hover:bg-white/10"
            >
              Annulla
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#00D1FF] hover:bg-[#00B8E6] text-black font-semibold"
            >
              {loading ? 'Aggiunta...' : 'Salva Metodo'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCardDialog;