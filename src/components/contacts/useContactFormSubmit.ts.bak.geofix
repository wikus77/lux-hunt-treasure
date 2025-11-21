
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
  type?: string;
}

export interface ContactSubmissionError {
  type: 'database' | 'network' | 'email' | 'validation';
  message: string;
  details?: string;
}

interface ContactSubmissionResult {
  success: boolean;
  error?: ContactSubmissionError;
}

interface UseContactFormSubmitResult {
  isSubmitting: boolean;
  progress: number;
  result?: ContactSubmissionResult;
  handleSubmit: (data: ContactFormData) => Promise<ContactSubmissionResult>;
}

export const useContactFormSubmit = (): UseContactFormSubmitResult => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ContactSubmissionResult | undefined>();

  const handleSubmit = async (data: ContactFormData): Promise<ContactSubmissionResult> => {
    // Track Plausible event when checkout process starts
    if (data.type === 'payment' && typeof window !== 'undefined' && window.plausible) {
      window.plausible('checkout_start');
    }
    
    setIsSubmitting(true);
    setProgress(10);
    setResult(undefined);
    
    try {
      setProgress(30);
      
      const { data: response, error } = await supabase.functions.invoke("send-mailjet-email", {
        body: {
          email: data.email,
          subject: data.subject,
          message: data.message,
          name: data.name,
          type: data.type || 'contact',
        },
      });

      setProgress(70);

      if (error) {
        console.error("Errore nell'invio dell'email:", error);
        const submissionError: ContactSubmissionError = {
          type: 'network',
          message: "Errore nell'invio del messaggio",
          details: "Si è verificato un errore durante l'invio. Riprova più tardi."
        };
        
        toast.error(submissionError.message, {
          description: submissionError.details,
        });
        
        const errorResult = { success: false, error: submissionError };
        setResult(errorResult);
        return errorResult;
      }

      setProgress(90);

      if (response?.success) {
        toast.success("Messaggio inviato con successo!", {
          description: "Ti risponderemo il prima possibile.",
        });
        
        const successResult = { success: true };
        setResult(successResult);
        setProgress(100);
        return successResult;
      } else {
        const submissionError: ContactSubmissionError = {
          type: 'email',
          message: "Errore nell'invio del messaggio",
          details: response?.error || "Si è verificato un errore sconosciuto."
        };
        
        toast.error(submissionError.message, {
          description: submissionError.details,
        });
        
        const errorResult = { success: false, error: submissionError };
        setResult(errorResult);
        return errorResult;
      }
    } catch (error) {
      console.error("Errore nella funzione di invio:", error);
      const submissionError: ContactSubmissionError = {
        type: 'network',
        message: "Errore di connessione",
        details: "Impossibile inviare il messaggio. Controlla la connessione e riprova."
      };
      
      toast.error(submissionError.message, {
        description: submissionError.details,
      });
      
      const errorResult = { success: false, error: submissionError };
      setResult(errorResult);
      return errorResult;
    } finally {
      setIsSubmitting(false);
      setProgress(100);
    }
  };

  return { isSubmitting, progress, result, handleSubmit };
};
