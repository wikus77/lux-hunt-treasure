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
      // First step: Save to database
      setProgress(30);
      
      // Log attempt (only in development)
      if (import.meta.env.DEV) {
        console.log("Attempting to send message:", data);
      }

      // Save the message to the contacts table
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
        console.error("Error saving contact to database:", dbError);
        throw new Error(`Error saving contact: ${dbError.message}`);
      }

      setProgress(50); // Update progress after saving

      // Prepare the data to send via email
      const contactData = {
        type: 'contact',
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        subject: data.subject || "Nuovo contatto dal sito M1SSION",
        message: data.message,
        to: [
          {
            email: "contact@m1ssion.com", 
            name: "M1SSION Team"
          }
        ],
        from: {
          email: "contact@m1ssion.com",
          name: "M1SSION Contact Form"
        },
        trackOpens: true,
        trackClicks: false,
        customCampaign: "contact_form",
        // GDPR consent tracking
        consent: {
          given: true,
          date: new Date().toISOString(),
          method: "contact_form"
        }
      };
      
      // Send email using Mailjet Edge Function
      const { data: responseData, error } = await supabase.functions.invoke('send-mailjet-email', {
        body: contactData
      });

      if (error) {
        console.error("Error from Mailjet Edge Function:", error);
        throw new Error(`Communication error: ${error.message}`);
      }
      
      setProgress(80); // Almost complete

      // Check the response
      if (!responseData || !responseData.success) {
        const errorMsg = responseData?.message || 'Error sending email';
        console.error("API Error:", errorMsg, responseData);
        throw new Error(errorMsg);
      }

      // Success notification
      toast({
        title: "Messaggio inviato con successo",
        description: "Ti risponderemo il prima possibile!",
      });

      setProgress(100); // Complete

      return { success: true };
    } catch (error) {
      console.error("Detailed error in message submission:", error);
      
      // Error notification
      toast({
        variant: "destructive",
        title: "Si è verificato un errore durante l'invio del messaggio",
        description: "Riprova tra qualche istante."
      });
      
      setProgress(0); // Reset progress on error
      return { success: false, error };
    } finally {
      // Keep the progress at 100% for success until the form resets
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
