
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ContactFormData } from "./contactFormSchema";
import { supabase } from "@/integrations/supabase/client";

export type ContactSubmissionError = {
  type: 'database' | 'network' | 'email' | 'validation' | 'unknown';
  message: string;
  details?: string;
};

export type ContactSubmissionResult = {
  success: boolean;
  error?: ContactSubmissionError;
};

export function useContactFormSubmit() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ContactSubmissionResult | undefined>(undefined);

  const handleSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setProgress(10); // Start progress
    setResult(undefined); // Reset previous results
    
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
        
        // Create a specific database error
        const databaseError: ContactSubmissionError = {
          type: 'database',
          message: "Impossibile salvare il messaggio nel database",
          details: dbError.message
        };
        
        throw databaseError;
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
            Email: "contact@m1ssion.com", 
            Name: "M1SSION Team"
          }
        ],
        from: {
          Email: "contact@m1ssion.com",
          Name: "M1SSION Contact Form"
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
      try {
        console.log("Invoking send-mailjet-email function with data:", JSON.stringify(contactData, null, 2));
        
        const { data: responseData, error } = await supabase.functions.invoke('send-mailjet-email', {
          body: contactData
        });

        console.log("Edge function response:", responseData, error);

        if (error) {
          console.error("Error from Mailjet Edge Function:", error);
          
          // Network or server error
          const networkError: ContactSubmissionError = {
            type: 'network',
            message: "Errore di comunicazione con il server",
            details: error.message
          };
          
          throw networkError;
        }
        
        setProgress(80); // Almost complete

        // Check the response
        if (!responseData || !responseData.success) {
          const errorMsg = responseData?.message || 'Error sending email';
          console.error("API Error:", errorMsg, responseData);
          
          // Email service error
          const emailError: ContactSubmissionError = {
            type: 'email',
            message: "Errore nell'invio dell'email",
            details: errorMsg
          };
          
          throw emailError;
        }

        // Success notification
        toast({
          title: "Messaggio inviato con successo",
          description: "Ti risponderemo il prima possibile!",
        });

        setProgress(100); // Complete
        setResult({ success: true });

        return { success: true };
      } catch (apiError) {
        // If it's already our custom error type, rethrow it
        if ((apiError as ContactSubmissionError).type) {
          throw apiError;
        }
        
        // Otherwise create a generic error
        const unknownError: ContactSubmissionError = {
          type: 'unknown',
          message: "Si è verificato un errore imprevisto durante l'invio",
          details: apiError instanceof Error ? apiError.message : String(apiError)
        };
        
        throw unknownError;
      }
    } catch (error) {
      console.error("Detailed error in message submission:", error);
      
      let errorToSet: ContactSubmissionError;
      
      if ((error as ContactSubmissionError).type) {
        // It's already our custom error type
        errorToSet = error as ContactSubmissionError;
      } else {
        // Generic error
        errorToSet = {
          type: 'unknown',
          message: "Si è verificato un errore durante l'invio del messaggio",
          details: error instanceof Error ? error.message : String(error)
        };
      }
      
      // Error notification with specific message
      toast({
        variant: "destructive",
        title: errorToSet.message,
        description: errorToSet.details || "Riprova tra qualche istante."
      });
      
      setProgress(0); // Reset progress on error
      setResult({ success: false, error: errorToSet });
      return { success: false, error: errorToSet };
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
    progress,
    result
  };
}
