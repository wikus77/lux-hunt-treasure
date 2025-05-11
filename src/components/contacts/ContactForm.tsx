
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { contactFormSchema, ContactFormData } from "./contactFormSchema";
import { useContactFormSubmit } from "./useContactFormSubmit";
import ContactFormFields from "./ContactFormFields";
import ContactSubmitButton from "./ContactSubmitButton";
import TurnstileWidget from "@/components/security/TurnstileWidget";
import { useTurnstile } from "@/hooks/useTurnstile";
import { toast } from "sonner";

const ContactForm = () => {
  // Initialize react-hook-form with zod resolver
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  const { handleSubmit: contactHandleSubmit, isSubmitting, progress } = useContactFormSubmit();
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const { verifyToken, isVerifying } = useTurnstile({
    action: 'contact_form',
    onError: (error) => {
      toast.error("Security verification failed", {
        description: error
      });
    }
  });
  
  // Log when the component mounts to debug routing issues
  useEffect(() => {
    console.log("ContactForm component mounted");
    
    return () => {
      console.log("ContactForm component unmounted");
    };
  }, []);

  const onSubmit = async (data: ContactFormData) => {
    console.log("Form data being submitted:", data); // Debug log
    
    if (!turnstileToken) {
      toast.error("Completa la verifica di sicurezza");
      return;
    }
    
    try {
      // First verify the turnstile token
      const isValid = await verifyToken(turnstileToken);
      
      if (!isValid) {
        throw new Error('Security verification failed');
      }
      
      // If verification passes, submit the form
      const result = await contactHandleSubmit(data);
      if (result.success) {
        form.reset();
        setTurnstileToken(null);
      }
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <div className="glass-card">
      <h2 className="text-2xl font-orbitron font-bold mb-6 text-cyan-400">Inviaci un Messaggio</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <ContactFormFields form={form} />
          
          {/* Turnstile Widget */}
          <div className="mt-4">
            <TurnstileWidget 
              onVerify={setTurnstileToken}
              action="contact_form"
            />
          </div>
          
          <div>
            <ContactSubmitButton 
              isSubmitting={isSubmitting || isVerifying} 
              progress={progress}
              disabled={!turnstileToken}
            />
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ContactForm;
