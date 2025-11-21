
import React from "react";
import { Mail, User, Phone } from "lucide-react";
import StyledInput from "@/components/ui/styled-input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { ContactFormData } from "./contactFormSchema";

interface ContactFormFieldsProps {
  form: UseFormReturn<ContactFormData>;
  disabled?: boolean; // Added the disabled prop with optional type
}

const ContactFormFields: React.FC<ContactFormFieldsProps> = ({ form, disabled = false }) => {
  return (
    <>
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
                  icon={<User size={16} />}
                  disabled={disabled}
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
                  disabled={disabled}
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-red-400 text-sm mt-1" />
            </FormItem>
          )}
        />
      </div>
      
      {/* Phone Field */}
      <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white mb-2">Telefono</FormLabel>
            <FormControl>
              <StyledInput
                id="phone"
                type="tel"
                placeholder="Il tuo numero di telefono"
                icon={<Phone size={16} />}
                disabled={disabled}
                {...field}
              />
            </FormControl>
            <FormMessage className="text-red-400 text-sm mt-1" />
          </FormItem>
        )}
      />
      
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
                disabled={disabled}
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
                disabled={disabled}
                {...field}
              />
            </FormControl>
            <FormMessage className="text-red-400 text-sm mt-1" />
          </FormItem>
        )}
      />
    </>
  );
};

export default ContactFormFields;
