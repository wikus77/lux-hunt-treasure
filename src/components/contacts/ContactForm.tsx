
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { contactFormSchema, ContactFormData } from "./contactFormSchema";
import { useContactFormSubmit } from "./useContactFormSubmit";
import ContactFormFields from "./ContactFormFields";
import ContactSubmitButton from "./ContactSubmitButton";

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

  const { handleSubmit, isSubmitting, progress } = useContactFormSubmit();

  const onSubmit = async (data: ContactFormData) => {
    const result = await handleSubmit(data);
    if (result.success) {
      form.reset();
    }
  };

  return (
    <div className="glass-card">
      <h2 className="text-2xl font-orbitron font-bold mb-6 text-cyan-400">Inviaci un Messaggio</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <ContactFormFields form={form} />
          
          <div>
            <ContactSubmitButton isSubmitting={isSubmitting} progress={progress} />
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ContactForm;
