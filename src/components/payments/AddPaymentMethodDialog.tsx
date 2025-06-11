
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { supabase } from '@/integrations/supabase/client';

interface AddPaymentMethodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddPaymentMethodDialog: React.FC<AddPaymentMethodDialogProps> = ({
  open,
  onOpenChange
}) => {
  const [loading, setLoading] = useState(false);
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
    isDefault: false
  });
  const { savePaymentMethod } = usePaymentMethods();

  const handleInputChange = (field: string, value: string | boolean) => {
    setCardData(prev => ({ ...prev, [field]: value }));
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cardData.number || !cardData.expiry || !cardData.cvc || !cardData.name) {
      toast.error('Compila tutti i campi');
      return;
    }

    setLoading(true);
    
    try {
      // In a real implementation, you would use Stripe Elements or Stripe.js here
      // For this demo, we'll simulate the process
      
      // Create a mock payment method ID (in real implementation, this comes from Stripe)
      const mockPaymentMethodId = `pm_${Date.now()}`;
      
      // Save to our backend
      await savePaymentMethod(mockPaymentMethodId, cardData.isDefault);
      
      toast.success('Metodo di pagamento aggiunto con successo');
      onOpenChange(false);
      
      // Reset form
      setCardData({
        number: '',
        expiry: '',
        cvc: '',
        name: '',
        isDefault: false
      });
    } catch (error) {
      console.error('Error adding payment method:', error);
      toast.error('Errore nell\'aggiunta del metodo di pagamento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Aggiungi Metodo di Pagamento</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Numero Carta</Label>
            <Input
              id="cardNumber"
              placeholder="1234 5678 9012 3456"
              value={cardData.number}
              onChange={(e) => handleInputChange('number', formatCardNumber(e.target.value))}
              maxLength={19}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry">Scadenza</Label>
              <Input
                id="expiry"
                placeholder="MM/AA"
                value={cardData.expiry}
                onChange={(e) => handleInputChange('expiry', formatExpiry(e.target.value))}
                maxLength={5}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cvc">CVC</Label>
              <Input
                id="cvc"
                placeholder="123"
                value={cardData.cvc}
                onChange={(e) => handleInputChange('cvc', e.target.value.replace(/[^0-9]/g, '').substring(0, 4))}
                maxLength={4}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name">Nome Intestatario</Label>
            <Input
              id="name"
              placeholder="Mario Rossi"
              value={cardData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="default"
              checked={cardData.isDefault}
              onCheckedChange={(checked) => handleInputChange('isDefault', checked)}
            />
            <Label htmlFor="default">Imposta come predefinito</Label>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annulla
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salva Carta'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPaymentMethodDialog;
