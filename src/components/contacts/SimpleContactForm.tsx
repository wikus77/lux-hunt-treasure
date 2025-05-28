import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { contactFormSchema, ContactFormData } from "./contactFormSchema";
import { Form } from "@/components/ui/form";
import ContactFormFields from "./ContactFormFields";
import { ContactSubmitButton } from "./ContactSubmitButton";
import { useContactFormSubmit } from "./useContactFormSubmit";
import { EmailSendingStatus } from "./EmailSendingStatus";
import TurnstileWidget from "@/components/security/TurnstileWidget";
import { useTurnstile } from "@/hooks/useTurnstile";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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

  // Log abuse event to Supabase
  const logAbuseEvent = async () => {
    try {
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id || 'anonymous';
      
      await supabase.from('abuse_logs').insert({
        event_type: 'email_send',
        user_id: userId
      });
    } catch (error) {
      // Don't block the form if logging fails
      console.log('Abuse logging failed:', error);
    }
  };

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
      
      // Log abuse event (don't await to avoid blocking)
      logAbuseEvent();
      
      // Data is already properly typed after Zod validation
      const submitResult = await contactHandleSubmit(data);
      
      if (submitResult?.success) {
        // Track successful contact submission in Plausible
        if (typeof window !== 'undefined' && window.plausible) {
          window.plausible('contact_submit');
        }
        
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
