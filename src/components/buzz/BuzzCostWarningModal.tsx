// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ - BUZZ Cost Warning Modal Component

import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle } from 'lucide-react';

interface BuzzCostWarningModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  price: number;
  radius: number;
  segment: string;
  isEliteMaxPrice: boolean;
}

export const BuzzCostWarningModal: React.FC<BuzzCostWarningModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  price,
  radius,
  segment,
  isEliteMaxPrice
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('it-IT', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  const getWarningMessage = () => {
    if (isEliteMaxPrice) {
      return "⚠️ Il prossimo BUZZ sarà ALTAMENTE COSTOSO. Sei sicuro di voler procedere?";
    } else if (segment === "ELITE") {
      return "⚠️ Stai per entrare nel segmento ELITE. Il costo è molto elevato.";
    } else if (segment === "High-Spender") {
      return "⚠️ Hai raggiunto il livello High-Spender. I costi sono significativi.";
    } else {
      return "⚠️ Il prossimo BUZZ avrà un costo elevato. Confermi di voler procedere?";
    }
  };

  const getSegmentColor = () => {
    switch (segment) {
      case "ELITE":
        return "text-purple-600 dark:text-purple-400";
      case "High-Spender":
        return "text-red-600 dark:text-red-400";
      case "Mid High-Spender":
        return "text-orange-600 dark:text-orange-400";
      default:
        return "text-blue-600 dark:text-blue-400";
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onCancel}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Conferma BUZZ MAPPA™
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p className="text-base font-medium">
              {getWarningMessage()}
            </p>
            
            <div className="bg-muted/50 p-3 rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Costo:</span>
                <span className="text-lg font-bold text-primary">
                  {formatPrice(price)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Raggio:</span>
                <span className="text-sm font-semibold">
                  {radius}km
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Segmento:</span>
                <span className={`text-sm font-bold ${getSegmentColor()}`}>
                  {segment}
                </span>
              </div>
            </div>

            {isEliteMaxPrice && (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 p-3 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                  ⚠️ Questo è il prezzo massimo del sistema BUZZ MAPPA™.
                </p>
              </div>
            )}
            
            <p className="text-xs text-muted-foreground">
              Una volta confermato, il pagamento non potrà essere annullato.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter>
          <AlertDialogCancel 
            onClick={onCancel}
            className="min-w-20"
          >
            Annulla
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="min-w-20 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500"
          >
            Procedi
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};