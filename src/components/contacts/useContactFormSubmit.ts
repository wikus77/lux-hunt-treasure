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
      // Primo step: salvataggio nel database
      setProgress(30);
      
      // Log attempt (only in development)
      if (import.meta.env.DEV) {
        console.log("Tentativo di invio messaggio:", data);
      }

      // Salva il messaggio nella tabella contacts
      const { error: dbError } = await supabase
        .from('contacts')
        .insert({
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          subject: data.subject || "Contatto dal sito M1SSION",
          message: data.message
        });
      
      if (dbError) {
        console.error("Errore nel salvataggio del contatto:", dbError);
        throw new Error(`Errore nel salvataggio del contatto: ${dbError.message}`);
      }

      setProgress(50); // Update progress dopo il salvataggio

      // Prepare the data to send via email
      const contactData = {
        name: data.name,
        email: data.email,
        phone: data.phone || "Non fornito",
        subject: data.subject || "Contatto dal sito M1SSION",
        message: data.message
      };
      
      // Invio email tramite Supabase Edge Function
      const { data: responseData, error } = await supabase.functions.invoke('send-contact-email', {
        body: contactData
      });

      if (error) {
        console.error("Error from Supabase Edge Function:", error);
        throw new Error(`Errore di comunicazione: ${error.message}`);
      }
      
      setProgress(80); // Almost complete

      // Check the response from our function
      if (!responseData || !responseData.success) {
        const errorMsg = responseData?.message || 'Errore nell\'invio dell\'email';
        console.error("API Error:", errorMsg, responseData);
        throw new Error(errorMsg);
      }

      // Success notification
      toast({
        title: "Messaggio inviato correttamente",
        description: "Ti risponderemo al più presto!",
      });

      setProgress(100); // Complete

      return { success: true };
    } catch (error) {
      console.error("Errore dettagliato nell'invio del messaggio:", error);
      
      // Error notification
      toast({
        variant: "destructive",
        title: "Si è verificato un errore durante l'invio del messaggio",
        description: "Riprova tra qualche istante."
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
