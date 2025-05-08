import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ContactFormData } from "./contactFormSchema";
import { supabase } from "@/integrations/supabase/client";

export function useContactFormSubmit() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setProgress(10); // Start progress
    
    try {
      setProgress(30); // Update progress
      
      // Log attempt (only in development)
      if (import.meta.env.DEV) {
        console.log("Tentativo di invio email:", data);
      }

      // Prepare the data to send
      const contactData = {
        name: data.name,
        email: data.email,
        phone: data.phone || "Non fornito",
        subject: data.subject || "Contatto dal sito M1SSION",
        message: data.message
      };
      
      setProgress(50); // Update progress

      // Send email using Supabase Edge Function
      const { data: responseData, error } = await supabase.functions.invoke('send-contact-email', {
        body: contactData
      });

      if (error) throw error;
      
      setProgress(80); // Almost complete

      // Check the response from our function
      if (!responseData.success) {
        throw new Error(responseData.message || 'Errore nell\'invio dell\'email');
      }

      // Success notification
      toast({
        title: "Messaggio inviato",
        description: "Grazie per averci contattato. Ti risponderemo al più presto.",
      });

      setProgress(100); // Complete

      return { success: true };
    } catch (error) {
      console.error("Errore nell'invio dell'email:", error);
      
      // Error notification
      toast({
        variant: "destructive",
        title: "Errore",
        description: error instanceof Error 
          ? error.message 
          : "Si è verificato un problema durante l'invio del messaggio. Riprova più tardi."
      });
      
      setProgress(0); // Reset progress on error
      return { success: false, error };
    } finally {
      // We'll keep the progress at 100% for success until the form resets
      setTimeout(() => {
        if (progress === 100) {
          setProgress(0);
        }
        setIsSubmitting(false);
      }, 1000); // Delay to show completed progress
    }
  };

  return {
    handleSubmit,
    isSubmitting,
    progress
  };
}
