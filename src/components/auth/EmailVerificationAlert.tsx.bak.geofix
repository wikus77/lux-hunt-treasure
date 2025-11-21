
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/contexts/auth';
import { toast } from 'sonner';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface EmailVerificationAlertProps {
  onResendClick?: () => void;
}

export const EmailVerificationAlert: React.FC<EmailVerificationAlertProps> = ({ 
  onResendClick
}) => {
  const { getCurrentUser, resendVerificationEmail } = useAuthContext();
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const user = getCurrentUser();

  const handleResendVerification = async () => {
    if (!user?.email) {
      toast.error("Errore", { description: "Impossibile determinare l'email dell'utente" });
      return;
    }
    
    setIsResending(true);
    try {
      const result = await resendVerificationEmail(user.email);
      
      if (result.success) {
        setResendSuccess(true);
        toast.success("Email inviata", { 
          description: "Un nuovo link di conferma è stato inviato alla tua email. Controlla la tua casella di posta." 
        });
        if (onResendClick) {
          onResendClick();
        }
      } else {
        toast.error("Errore di invio", { 
          description: "Si è verificato un errore nell'invio del link. Riprova più tardi." 
        });
      }
    } catch (error) {
      console.error("Error resending verification:", error);
      toast.error("Errore", { description: "Si è verificato un errore. Riprova più tardi." });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="bg-amber-50/10 border border-amber-500/30 rounded-lg p-6 max-w-md mx-auto text-center">
      <h2 className="text-xl font-bold mb-4 text-white">Verifica la tua email</h2>
      
      <Alert className="bg-amber-500/10 border border-amber-400/30 mb-6">
        <AlertTitle>Accesso limitato</AlertTitle>
        <AlertDescription className="text-white/80">
          Per completare la registrazione e accedere a tutte le funzionalità, controlla la tua casella email 
          e clicca sul link di verifica che ti abbiamo inviato.
        </AlertDescription>
      </Alert>
      
      {resendSuccess && (
        <Alert className="bg-green-500/10 border border-green-400/30 mb-6">
          <AlertDescription className="text-white/80">
            Un nuovo link di conferma è stato inviato alla tua email. Controlla la tua casella di posta.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-4">
        <Button
          onClick={handleResendVerification}
          variant="outline"
          className="border-amber-500 text-amber-500 hover:bg-amber-500/20"
          disabled={isResending}
        >
          {isResending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Invio in corso...
            </>
          ) : (
            "Invia di nuovo il link"
          )}
        </Button>
      </div>
    </div>
  );
};

export default EmailVerificationAlert;
