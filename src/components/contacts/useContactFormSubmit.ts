
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import emailjs from "emailjs-com";
import { ContactFormData } from "./contactFormSchema";

export function useContactFormSubmit() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    
    try {
      // EmailJS configuration
      // Note: Replace these with actual EmailJS credentials
      const serviceId = "service_m1ssion";
      const templateId = "template_contact";
      const userId = "YOUR_USER_ID";
      
      const templateParams = {
        from_name: data.name,
        reply_to: data.email,
        subject: data.subject || "Contatto dal sito M1SSION",
        message: data.message,
        to_email: "contact@m1ssion.com"
      };
      
      // Log attempt
      console.log("Tentativo di invio email:", templateParams);
      
      // Send email using EmailJS
      await emailjs.send(
        serviceId,
        templateId,
        templateParams,
        userId
      );

      // Success notification
      toast({
        title: "Messaggio inviato",
        description: "Grazie per averci contattato. Ti risponderemo al più presto.",
      });

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
      
      return { success: false, error };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleSubmit,
    isSubmitting
  };
}
