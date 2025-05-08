import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import emailjs from "emailjs-com";
import { ContactFormData } from "./contactFormSchema";

export function useContactFormSubmit() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setProgress(10); // Start progress
    
    try {
      // EmailJS configuration
      // Note: Replace these with actual EmailJS credentials
      const serviceId = "service_m1ssion";
      const templateId = "template_contact";
      const userId = "YOUR_USER_ID";
      
      const templateParams = {
        from_name: data.name,
        reply_to: data.email,
        phone: data.phone || "Non fornito",
        subject: data.subject || "Contatto dal sito M1SSION",
        message: data.message,
        to_email: "contact@m1ssion.com"
      };
      
      // Log attempt
      console.log("Tentativo di invio email:", templateParams);
      
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
