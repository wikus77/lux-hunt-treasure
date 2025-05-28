
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { contactFormSchema, ContactFormData } from "./contactFormSchema";
import { Form } from "@/components/ui/form";
import ContactFormFields from "./ContactFormFields";
import ContactSubmitButton from "./ContactSubmitButton";
import { useContactFormSubmit } from "./useContactFormSubmit";
import { EmailSendingStatus } from "./EmailSendingStatus";
import TurnstileWidget from "@/components/security/TurnstileWidget";
import { useTurnstile } from "@/hooks/useTurnstile";
import { toast } from "sonner";

const SimpleContactForm: React.FC = () => {
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
      type: "contact"
    }
  });

  const { handleSubmit: contactHandleSubmit, isSubmitting, progress, result } = useContactFormSubmit();
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const { verifyToken, isVerifying } = useTurnstile({
    action: 'contact_form',
    onError: (error) => {
      toast.error("Security verification failed", {
        description: error
      });
    }
  });

  const onSubmit = async (data: ContactFormData) => {
    if (!turnstileToken) {
      toast.error("Please complete the security verification");
      return;
    }

    try {
      // First verify the turnstile token
      const isValid = await verifyToken(turnstileToken);
      
      if (!isValid) {
        throw new Error('Security verification failed');
      }
      
      // Since the data comes from a validated form with zodResolver,
      // we can safely cast it to ensure all required fields are present
      const contactData = {
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
        phone: data.phone,
        type: data.type || 'contact'
      } as ContactFormData;
      
      // If verification passes, submit the form
      const submitResult = await contactHandleSubmit(contactData);
      
      if (submitResult?.success) {
        form.reset();
        setTurnstileToken(null);
      }
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <ContactFormFields form={form} disabled={isSubmitting || isVerifying} />
        
        {/* Turnstile Widget */}
        <div className="mt-4">
          <TurnstileWidget 
            onVerify={setTurnstileToken}
            action="contact_form"
          />
        </div>
        
        {/* Email Sending Status Component with enhanced error handling */}
        <EmailSendingStatus 
          isSubmitting={isSubmitting} 
          progress={progress} 
          result={result}
        />
        
        <ContactSubmitButton 
          isSubmitting={isSubmitting || isVerifying} 
          progress={progress}
          disabled={!turnstileToken}
        />
      </form>
    </Form>
  );
};

export default SimpleContactForm;
