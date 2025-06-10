
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
      {/* Security Status Alert */}
      <Alert className={`w-full max-w-md ${hasValidPayment ? 'border-green-500 bg-green-900/20' : 'border-red-500 bg-red-900/20'}`}>
        <div className="flex items-center gap-2">
          {hasValidPayment ? (
            <Shield className="h-4 w-4 text-green-500" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-red-500" />
          )}
          <span className="font-bold">
            {hasValidPayment ? 'Accesso Verificato' : 'Verifica Richiesta'}
          </span>
        </div>
        <AlertDescription className="mt-2">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Piano:</span>
              <span className="font-bold">{subscriptionTier}</span>
            </div>
            <div className="flex justify-between">
              <span>BUZZ Rimanenti:</span>
              <span className="font-bold">{remainingBuzz}/{weeklyBuzzLimit}</span>
            </div>
            <div className="flex justify-between">
              <span>Accesso Premium:</span>
              <span className={`font-bold ${canAccessPremium ? 'text-green-400' : 'text-red-400'}`}>
                {canAccessPremium ? '✅ Attivo' : '❌ Bloccato'}
              </span>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      {/* Error Display */}
      {error && (
        <Alert className="w-full max-w-md border-red-500 bg-red-900/20">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Secure Buzz Button */}
      <div className="flex flex-col items-center gap-4">
        <BuzzButtonSecure
          userId={user.id}
          onSuccess={handleSuccess}
        />
        
        {/* Security Notice */}
        <div className="text-center text-sm text-muted-foreground max-w-md">
          <p className="mb-2">🔒 Sistema di pagamento sicuro attivo</p>
          <p>Ogni indizio viene verificato prima della generazione. Nessun contenuto premium viene mostrato senza pagamento confermato.</p>
        </div>
      </div>
    </div>
  );
};

export default BuzzMainContent;
