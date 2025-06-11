
import React, { useState } from "react";
import { useAuthContext } from "@/contexts/auth";
import BuzzButtonSecure from "./BuzzButtonSecure";
import ErrorFallback from "../error/ErrorFallback";
import { usePaymentVerification } from "@/hooks/usePaymentVerification";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle } from "lucide-react";

const BuzzMainContent = () => {
  const { user } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const {
    hasValidPayment,
    canAccessPremium,
    subscriptionTier,
    remainingBuzz,
    weeklyBuzzLimit,
    loading: verificationLoading
  } = usePaymentVerification();

  const handleSuccess = () => {
    console.log('✅ SECURE BUZZ: Success callback triggered');
    setError(null);
  };

  if (!user?.id) {
    return <ErrorFallback message="Utente non autenticato" />;
  }

  if (verificationLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="animate-spin w-12 h-12 border-4 border-t-transparent border-blue-500 rounded-full"></div>
        <p className="text-lg">Verificando stato pagamenti...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-8 px-4">
      {/* Security Status Alert - Applicando Design System M1SSION™ */}
      <div className={`w-full max-w-md m1ssion-box ${hasValidPayment ? 'm1ssion-alert-success' : 'm1ssion-alert-error'}`}>
        <div className="flex items-center gap-2 mb-3">
          {hasValidPayment ? (
            <Shield className="h-5 w-5 text-green-400" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-red-400" />
          )}
          <span className="font-bold text-lg">
            {hasValidPayment ? 'Accesso Verificato' : 'Verifica Richiesta'}
          </span>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-white/80">Piano:</span>
            <span className="font-bold text-white">{subscriptionTier}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/80">BUZZ Rimanenti:</span>
            <span className="font-bold text-white">{remainingBuzz}/{weeklyBuzzLimit}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/80">Accesso Premium:</span>
            <span className={`font-bold ${canAccessPremium ? 'text-green-400' : 'text-red-400'}`}>
              {canAccessPremium ? '✅ Attivo' : '❌ Bloccato'}
            </span>
          </div>
        </div>
      </div>

      {/* Error Display - Design System M1SSION™ */}
      {error && (
        <div className="w-full max-w-md m1ssion-alert-error">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <span className="text-red-300">{error}</span>
          </div>
        </div>
      )}

      {/* Secure Buzz Button - Removed invalid userId prop */}
      <div className="flex flex-col items-center gap-4">
        <BuzzButtonSecure
          onSuccess={handleSuccess}
        />
        
        {/* Security Notice - Design System M1SSION™ */}
        <div className="m1ssion-box-small text-center max-w-md">
          <p className="mb-2 text-white/90">🔒 Sistema di pagamento sicuro attivo</p>
          <p className="text-white/70 text-xs">
            Ogni indizio viene verificato prima della generazione. Nessun contenuto premium viene mostrato senza pagamento confermato.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BuzzMainContent;
