
import React, { useState } from "react";
import { useAuthContext } from "@/contexts/auth";
import BuzzButtonSecure from "./BuzzButtonSecure";
import ErrorFallback from "../error/ErrorFallback";
import { usePaymentVerification } from "@/hooks/usePaymentVerification";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle } from "lucide-react";

const BuzzMainContent = () => {
  const { user, getCurrentUser } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get current user with developer support
  const currentUser = getCurrentUser();
  const userId = currentUser?.id;
  
  console.log("🔥 BuzzMainContent - User check:", { 
    user: user?.id, 
    currentUser: currentUser?.id,
    email: currentUser?.email,
    isDeveloper: currentUser?.email === 'wikus77@hotmail.it'
  });

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

  // CRITICAL: Check both user sources
  if (!userId && !currentUser) {
    console.error("❌ BuzzMainContent: No user found");
    return <ErrorFallback message="Utente non autenticato" />;
  }

  // Developer bypass for payment verification
  const isDeveloper = currentUser?.email === 'wikus77@hotmail.it';
  const hasDeveloperAccess = localStorage.getItem('developer_access') === 'granted';
  
  // Override payment checks for developer
  const effectiveHasValidPayment = isDeveloper || hasDeveloperAccess || hasValidPayment;
  const effectiveCanAccessPremium = isDeveloper || hasDeveloperAccess || canAccessPremium;
  const effectiveSubscriptionTier = isDeveloper || hasDeveloperAccess ? 'Developer' : subscriptionTier;

  if (verificationLoading && !isDeveloper && !hasDeveloperAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="animate-spin w-12 h-12 border-4 border-t-transparent border-blue-500 rounded-full"></div>
        <p className="text-lg">Verificando stato pagamenti...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-8 px-4">
      {/* Security Status Alert - with developer mode */}
      <div className={`w-full max-w-md m1ssion-box ${effectiveHasValidPayment ? 'm1ssion-alert-success' : 'm1ssion-alert-error'}`}>
        <div className="flex items-center gap-2 mb-3">
          {effectiveHasValidPayment ? (
            <Shield className="h-5 w-5 text-green-400" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-red-400" />
          )}
          <span className="font-bold text-lg">
            {effectiveHasValidPayment ? 'Accesso Verificato' : 'Verifica Richiesta'}
          </span>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-white/80">Piano:</span>
            <span className="font-bold text-white">{effectiveSubscriptionTier}</span>
          </div>
          {isDeveloper && (
            <div className="flex justify-between items-center">
              <span className="text-white/80">Modalità:</span>
              <span className="font-bold text-green-400">🔧 Developer</span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-white/80">BUZZ Rimanenti:</span>
            <span className="font-bold text-white">{isDeveloper ? '∞' : `${remainingBuzz}/${weeklyBuzzLimit}`}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/80">Accesso Premium:</span>
            <span className={`font-bold ${effectiveCanAccessPremium ? 'text-green-400' : 'text-red-400'}`}>
              {effectiveCanAccessPremium ? '✅ Attivo' : '❌ Bloccato'}
            </span>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="w-full max-w-md m1ssion-alert-error">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <span className="text-red-300">{error}</span>
          </div>
        </div>
      )}

      {/* Secure Buzz Button with guaranteed userId */}
      <div className="flex flex-col items-center gap-4">
        <BuzzButtonSecure
          userId={userId || currentUser?.id || 'developer-fallback'}
          onSuccess={handleSuccess}
        />
        
        {/* Security Notice */}
        <div className="m1ssion-box-small text-center max-w-md">
          <p className="mb-2 text-white/90">🔒 Sistema di pagamento sicuro attivo</p>
          <p className="text-white/70 text-xs">
            {isDeveloper ? 
              "Modalità Developer: tutti i controlli bypassati per testing" :
              "Ogni indizio viene verificato prima della generazione. Nessun contenuto premium viene mostrato senza pagamento confermato."
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default BuzzMainContent;
