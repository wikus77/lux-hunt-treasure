
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  type: string;
}

interface UseContactFormSubmitResult {
  isSubmitting: boolean;
  handleSubmit: (data: ContactFormData) => Promise<void>;
}

export const useContactFormSubmit = (): UseContactFormSubmitResult => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: ContactFormData) => {
    // Track Plausible event when checkout process starts
    if (data.type === 'payment' && typeof window !== 'undefined' && window.plausible) {
      window.plausible('checkout_start');
    }
    
    setIsSubmitting(true);
    
    try {
      const { data: response, error } = await supabase.functions.invoke("send-mailjet-email", {
        body: {
          email: data.email,
          subject: data.subject,
          message: data.message,
          name: data.name,
          type: data.type,
        },
      });

      if (error) {
        console.error("Errore nell'invio dell'email:", error);
        toast.error("Errore nell'invio del messaggio", {
          description: "Si è verificato un errore durante l'invio. Riprova più tardi.",
        });
        return;
      }

      if (response?.success) {
        toast.success("Messaggio inviato con successo!", {
          description: "Ti risponderemo il prima possibile.",
        });
      } else {
        toast.error("Errore nell'invio del messaggio", {
          description: response?.error || "Si è verificato un errore sconosciuto.",
        });
      }
    } catch (error) {
      console.error("Errore nella funzione di invio:", error);
      toast.error("Errore di connessione", {
        description: "Impossibile inviare il messaggio. Controlla la connessione e riprova.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, handleSubmit };
};
