
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { contactFormSchema, ContactFormData } from "./contactFormSchema";
import { Form } from "@/components/ui/form";
import ContactFormFields from "./ContactFormFields";
import ContactSubmitButton from "./ContactSubmitButton";
import { useContactFormSubmit } from "./useContactFormSubmit";
import { EmailSendingStatus } from "./EmailSendingStatus";

const SimpleContactForm: React.FC = () => {
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: ""
    }
  });

  const { handleSubmit, isSubmitting, progress, result } = useContactFormSubmit();

  const onSubmit = async (data: ContactFormData) => {
    await handleSubmit(data);
    if (!isSubmitting && result?.success) {
      form.reset();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <ContactFormFields form={form} disabled={isSubmitting} />
        
        {/* Email Sending Status Component */}
        <EmailSendingStatus 
          isSubmitting={isSubmitting} 
          progress={progress} 
          result={result}
        />
        
        <ContactSubmitButton isSubmitting={isSubmitting} progress={progress} />
      </form>
    </Form>
  );
};

export default SimpleContactForm;
