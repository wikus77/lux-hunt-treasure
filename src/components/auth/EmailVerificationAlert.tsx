
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface EmailVerificationAlertProps {
  onResendClick?: () => void;
}

export const EmailVerificationAlert: React.FC<EmailVerificationAlertProps> = ({ 
  onResendClick
}) => {
  const { getCurrentUser, resendVerificationEmail } = useAuthContext();
  const user = getCurrentUser();

  const handleResendVerification = async () => {
    if (user?.email) {
      await resendVerificationEmail(user.email);
      if (onResendClick) {
        onResendClick();
      }
    } else {
      toast.error("Errore", { description: "Impossibile determinare l'email dell'utente" });
    }
  };

  return (
    <div className="bg-amber-50/10 border border-amber-500/30 rounded-lg p-6 max-w-md mx-auto text-center">
      <h2 className="text-xl font-bold mb-4 text-white">Verifica la tua email</h2>
      <p className="mb-6 text-white/80">
        Per completare la registrazione e accedere a tutte le funzionalità, controlla la tua casella email e clicca sul link di verifica.
      </p>
      <div className="space-y-4">
        <Button
          onClick={handleResendVerification}
          variant="outline"
          className="border-amber-500 text-amber-500 hover:bg-amber-500/20"
        >
          Invia di nuovo il link
        </Button>
      </div>
    </div>
  );
};

export default EmailVerificationAlert;
