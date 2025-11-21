
import React from "react";
import { Progress } from "@/components/ui/progress";
import { Check, X, Database, Wifi, Mail, AlertCircle } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { ContactSubmissionError } from "./useContactFormSubmit";

export interface EmailSendingStatusProps {
  isSubmitting: boolean;
  progress: number;
  result?: {
    success: boolean;
    error?: ContactSubmissionError;
  };
}

export function EmailSendingStatus({ isSubmitting, progress, result }: EmailSendingStatusProps) {
  // Determine the current status
  const isSuccess = !isSubmitting && result?.success;
  const isError = !isSubmitting && result?.success === false;
  const isIdle = !isSubmitting && result === undefined;

  // Status colors
  const getProgressColor = () => {
    if (isSuccess) return "bg-gradient-to-r from-green-400 to-green-600";
    if (isError) return "bg-gradient-to-r from-red-400 to-red-600";
    return "bg-gradient-to-r from-cyan-400 to-blue-600"; // Default for in-progress
  };

  // Get appropriate error icon based on error type
  const getErrorIcon = () => {
    if (!result?.error) return <X size={16} />;
    
    switch (result.error.type) {
      case 'database':
        return <Database size={16} />;
      case 'network':
        return <Wifi size={16} />;
      case 'email':
        return <Mail size={16} />;
      case 'validation':
        return <AlertCircle size={16} />;
      default:
        return <X size={16} />;
    }
  };

  // Get error message based on type
  const getErrorMessage = () => {
    if (!result?.error) return "Errore durante l'invio";
    
    // Add more detailed messages for common error scenarios
    if (result.error.message.includes("Mailjet") || result.error.message.includes("API")) {
      return "Errore di connessione con il servizio email";
    }
    
    // Return the original error message
    return result.error.message;
  };
  
  // Get detailed error instructions
  const getErrorInstructions = () => {
    if (!result?.error) return null;
    
    if (result.error.type === 'network' || result.error.message.includes("Edge Function")) {
      return "Verifica la tua connessione e riprova.";
    }
    
    if (result.error.type === 'email') {
      return "Il server di posta non ha potuto inviare l'email. Riprova più tardi.";
    }
    
    if (result.error.message.includes("No API key found")) {
      return "Problema con le chiavi API Mailjet. Contatta l'amministratore del sito.";
    }
    
    return result.error.details;
  };

  // Render nothing if idle with no previous results
  if (isIdle && !result) return null;

  return (
    <div className="space-y-2 my-4">
      {/* Progress Bar */}
      <div className="relative">
        <Progress
          value={isSuccess ? 100 : isError ? 100 : progress}
          className="h-2 bg-black/30"
          indicatorClassName={getProgressColor()}
        />
        
        {/* Status Label */}
        <div className="flex justify-between items-center mt-1 text-xs text-white/70">
          <span>
            {isSubmitting && `Invio in corso (${progress}%)`}
            {isSuccess && "Messaggio inviato con successo"}
            {isError && "Errore durante l'invio"}
          </span>
          
          {/* Status Icon */}
          <span className="flex items-center">
            {isSubmitting && <Spinner size="sm" className="text-cyan-400 ml-2" />}
            {isSuccess && <Check size={16} className="text-green-500 ml-2" />}
            {isError && <X size={16} className="text-red-500 ml-2" />}
          </span>
        </div>
      </div>

      {/* Details Panel */}
      {(isSuccess || isError) && (
        <div className={`mt-2 p-3 rounded-md text-sm ${
          isSuccess ? 'bg-green-950/30 border border-green-500/20' : 
          'bg-red-950/30 border border-red-500/20'
        }`}>
          {isSuccess && (
            <div className="flex items-center gap-2 text-green-400">
              <Check size={16} />
              <span>Email inviata correttamente</span>
            </div>
          )}
          
          {isError && (
            <div>
              <div className="flex items-center gap-2 text-red-400 mb-1">
                {getErrorIcon()}
                <span>{getErrorMessage()}</span>
              </div>
              {getErrorInstructions() && (
                <p className="text-white/60 text-xs ml-6 mt-1">{getErrorInstructions()}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
