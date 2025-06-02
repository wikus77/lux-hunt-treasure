
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/contexts/auth";
import { toast } from "sonner";
import { Loader2, Mail, RefreshCw } from "lucide-react";

const VerificationPendingView: React.FC = () => {
  const navigate = useNavigate();
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
          description: "Un nuovo link di conferma è stato inviato alla tua email." 
        });
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
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-black">
      <div className="bg-black/50 border border-amber-500/30 rounded-lg p-8 max-w-md mx-auto text-center">
        <div className="flex justify-center mb-4">
          <Mail className="w-12 h-12 text-amber-400" />
        </div>
        
        <h2 className="text-xl font-bold mb-4 text-white">Verifica la tua email</h2>
        
        <p className="mb-6 text-white/80 leading-relaxed">
          <strong>Controlla la tua casella email</strong> e clicca sul link di verifica per completare la registrazione e attivare il tuo account M1SSION™.
        </p>

        <div className="bg-amber-500/10 border border-amber-400/30 p-4 rounded-md mb-6">
          <p className="text-amber-300 text-sm">
            <strong>Non hai ricevuto l'email?</strong><br />
            Controlla anche la cartella spam/posta indesiderata, oppure richiedi un nuovo link di verifica qui sotto.
          </p>
        </div>
        
        {resendSuccess && (
          <div className="bg-green-500/10 border border-green-400/30 p-3 rounded-md mb-6">
            <p className="text-green-300 text-sm">
              ✅ Un nuovo link di conferma è stato inviato alla tua email.
            </p>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => navigate("/login")}
            variant="outline"
            className="border-amber-500 text-amber-500 hover:bg-amber-500/20"
          >
            Torna al login
          </Button>
          
          <Button
            onClick={handleResendVerification}
            variant="default"
            disabled={isResending}
            className="bg-amber-500 hover:bg-amber-600 text-black"
          >
            {isResending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                Invio in corso...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Invia nuovo link
              </>
            )}
          </Button>
        </div>

        <div className="mt-6 pt-4 border-t border-white/10">
          <p className="text-white/60 text-xs">
            Problemi con l'email? Contatta il supporto per assistenza.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerificationPendingView;
