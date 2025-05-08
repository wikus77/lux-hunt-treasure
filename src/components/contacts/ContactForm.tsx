
import React, { useState } from "react";
import { Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import StyledInput from "@/components/ui/styled-input";
import emailjs from "emailjs-com";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";

// Define form validation schema using Zod
const formSchema = z.object({
  name: z.string().min(2, { message: "Il nome deve essere di almeno 2 caratteri." }),
  email: z.string().email({ message: "Inserisci un indirizzo email valido." }),
  subject: z.string().optional(),
  message: z.string().min(10, { message: "Il messaggio deve essere di almeno 10 caratteri." }),
});

type FormData = z.infer<typeof formSchema>;

const ContactForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize react-hook-form with zod resolver
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const handleSubmit = async (data: FormData) => {
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

      // Reset form
      form.reset();
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-card">
      <h2 className="text-2xl font-orbitron font-bold mb-6 text-cyan-400">Inviaci un Messaggio</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white mb-2">Nome</FormLabel>
                  <FormControl>
                    <StyledInput
                      id="name"
                      type="text"
                      placeholder="Il tuo nome"
                      icon={<Mail size={16} />}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400 text-sm mt-1" />
                </FormItem>
              )}
            />
            
            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white mb-2">Email</FormLabel>
                  <FormControl>
                    <StyledInput
                      id="email"
                      type="email"
                      placeholder="La tua email"
                      icon={<Mail size={16} />}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400 text-sm mt-1" />
                </FormItem>
              )}
            />
          </div>
          
          {/* Subject Field */}
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white mb-2">Oggetto</FormLabel>
                <FormControl>
                  <StyledInput
                    id="subject"
                    type="text"
                    placeholder="Oggetto del messaggio"
                    icon={<Mail size={16} />}
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-red-400 text-sm mt-1" />
              </FormItem>
            )}
          />
          
          {/* Message Field */}
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white mb-2">Messaggio</FormLabel>
                <FormControl>
                  <textarea
                    id="message"
                    placeholder="Il tuo messaggio"
                    className="w-full bg-black/50 border-white/10 rounded-md border px-3 py-2 min-h-36 text-white"
                    rows={6}
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-red-400 text-sm mt-1" />
              </FormItem>
            )}
          />
          
          <div>
            <Button
              type="submit"
              className="bg-gradient-to-r from-cyan-400 to-blue-600 text-black px-6 py-2 rounded-full font-medium flex items-center gap-2 hover:shadow-[0_0_15px_rgba(0,229,255,0.5)]"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>Invio in corso...</>
              ) : (
                <>
                  Invia Messaggio <Send size={16} />
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ContactForm;
