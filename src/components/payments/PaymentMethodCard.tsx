// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CreditCard, Trash2, Crown } from 'lucide-react';

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
}

interface PaymentMethodCardProps {
  method: PaymentMethod;
  onSetDefault: (id: string) => void;
  onRemove: (id: string) => void;
  loading: boolean;
  canRemove: boolean;
}

const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  method,
  onSetDefault,
  onRemove,
  loading,
  canRemove
}) => {
  const getCardIcon = (brand: string) => {
    const brandLower = brand.toLowerCase();
    
    // Determine card color based on brand
    let cardColor = 'bg-gray-600';
    if (brandLower.includes('visa')) cardColor = 'bg-blue-600';
    if (brandLower.includes('master')) cardColor = 'bg-red-600';
    if (brandLower.includes('amex') || brandLower.includes('american')) cardColor = 'bg-green-600';
    if (brandLower.includes('discover')) cardColor = 'bg-orange-600';
    
    return (
      <div className={`w-12 h-8 ${cardColor} rounded flex items-center justify-center shadow-lg`}>
        <span className="text-white text-xs font-bold">
          {brand.substring(0, 4).toUpperCase()}
        </span>
      </div>
    );
  };

  const isExpired = () => {
    const currentDate = new Date();
    const expDate = new Date(method.exp_year, method.exp_month - 1);
    return expDate < currentDate;
  };

  return (
    <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-white/10 hover:border-[#00D1FF]/30 transition-all duration-200">
      <div className="flex items-center space-x-4">
        {getCardIcon(method.brand)}
        <div>
          <p className="text-white font-medium flex items-center gap-2">
            •••• •••• •••• {method.last4}
            {method.is_default && (
              <Crown className="w-4 h-4 text-yellow-500" />
            )}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-white/70 text-sm">
              Scade {method.exp_month.toString().padStart(2, '0')}/{method.exp_year}
            </p>
            {method.is_default && (
              <Badge className="bg-green-600 text-white text-xs">
                Predefinita
              </Badge>
            )}
            {isExpired() && (
              <Badge className="bg-red-600 text-white text-xs">
                Scaduta
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {!method.is_default && !isExpired() && (
          <Button
            onClick={() => onSetDefault(method.id)}
            disabled={loading}
            size="sm"
            variant="outline"
            className="border-[#00D1FF]/50 text-[#00D1FF] hover:bg-[#00D1FF]/10 text-xs font-medium"
          >
            Imposta Predefinita
          </Button>
        )}
        
        {canRemove && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors"
                disabled={loading}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-black/95 border-red-500/20 backdrop-blur-md">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white font-orbitron">
                  Rimuovi Carta di Credito
                </AlertDialogTitle>
                <AlertDialogDescription className="text-white/70">
                  Sei sicuro di voler rimuovere questa carta di credito? 
                  <br />
                  <strong className="text-red-300">
                    {method.brand} ••••{method.last4}
                  </strong>
                  <br />
                  Questa azione non può essere annullata.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                  Annulla
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onRemove(method.id)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Rimuovi Carta
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
};

export default PaymentMethodCard;