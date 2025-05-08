
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import emailjs from "emailjs-com";
import { ContactFormData } from "./contactFormSchema";
import { emailConfig } from "@/config/emailConfig";

export function useContactFormSubmit() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setProgress(10); // Start progress
    
    try {
      // Get EmailJS configuration from environment variables via config
      const serviceId = emailConfig.serviceId;
      const templateId = emailConfig.templateId;
      const userId = emailConfig.userId;
      
      // Check if credentials are available
      if (!serviceId || !templateId || !userId) {
        throw new Error("Configurazione EmailJS incompleta. Contattare l'amministratore.");
      }
      
      const templateParams = {
        from_name: data.name,
        reply_to: data.email,
        phone: data.phone || "Non fornito",
        subject: data.subject || "Contatto dal sito M1SSION",
        message: data.message,
        to_email: emailConfig.toEmail
      };
      
      // Log attempt (only in development)
      if (import.meta.env.DEV) {
        console.log("Tentativo di invio email:", templateParams);
      }
      
      setProgress(30); // Update progress

      // Send email using EmailJS
      await emailjs.send(
        serviceId,
        templateId,
        templateParams,
        userId
      );

      setProgress(80); // Almost complete

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
