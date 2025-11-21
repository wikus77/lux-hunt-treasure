
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { contactFormSchema, ContactFormData } from "./contactFormSchema";
import { useContactFormSubmit } from "./useContactFormSubmit";
import ContactFormFields from "./ContactFormFields";
import { ContactSubmitButton } from "./ContactSubmitButton";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
      type: "contact",
    },
  });

  const { handleSubmit: contactHandleSubmit, isSubmitting, progress } = useContactFormSubmit();

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
  
  // Log when the component mounts to debug routing issues
  useEffect(() => {
    console.log("ContactForm component mounted");
    
    return () => {
      console.log("ContactForm component unmounted");
    };
  }, []);

  const onSubmit = async (data: ContactFormData) => {
    console.log("Form data being submitted:", data); // Debug log
    
    try {
      // Log abuse event (don't await to avoid blocking)
      logAbuseEvent();
      
      // Data is already properly typed after Zod validation
      const result = await contactHandleSubmit(data);
      if (result.success) {
        // Track successful contact submission in Plausible
        if (typeof window !== 'undefined' && window.plausible) {
          window.plausible('contact_submit');
        }
        
        form.reset();
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
          
          <div>
            <ContactSubmitButton 
              isSubmitting={isSubmitting} 
              progress={progress}
              disabled={false}
            />
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ContactForm;
