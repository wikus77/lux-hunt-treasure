
import React, { useState } from "react";
import { useContactFormSubmit } from "./useContactFormSubmit";
import { ContactFormData } from "./contactFormSchema";
import { Progress } from "@/components/ui/progress";

const SimpleContactForm = () => {
  const { handleSubmit, isSubmitting, progress } = useContactFormSubmit();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  
  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccess(false);
    setError(false);
    
    const formData = new FormData(event.currentTarget);
    
    const contactData: ContactFormData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string || undefined,
      subject: formData.get('subject') as string || undefined,
      message: formData.get('message') as string
    };
    
    console.log("Form data to submit:", contactData);
    
    try {
      const result = await handleSubmit(contactData);
      if (result.success) {
        setSuccess(true);
        event.currentTarget.reset();
      } else {
        setError(true);
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      setError(true);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-lg mx-auto">
      <input
        type="text"
        name="name"
        placeholder="Il tuo nome"
        required
        className="w-full border border-gray-300 rounded-xl p-3"
        disabled={isSubmitting}
      />
      <input
        type="email"
        name="email"
        placeholder="La tua email"
        required
        className="w-full border border-gray-300 rounded-xl p-3"
        disabled={isSubmitting}
      />
      <input
        type="tel"
        name="phone"
        placeholder="Il tuo telefono (opzionale)"
        className="w-full border border-gray-300 rounded-xl p-3"
        disabled={isSubmitting}
      />
      <input
        type="text"
        name="subject"
        placeholder="Oggetto del messaggio (opzionale)"
        className="w-full border border-gray-300 rounded-xl p-3"
        disabled={isSubmitting}
      />
      <textarea
        name="message"
        placeholder="Scrivi il tuo messaggio"
        required
        className="w-full border border-gray-300 rounded-xl p-3 h-40 resize-none"
        disabled={isSubmitting}
      />
      
      {progress > 0 && progress < 100 && (
        <div className="w-full">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-gray-500 mt-1 text-center">{progress}% completato</p>
        </div>
      )}
      
      <button
        type="submit"
        className="bg-black text-white px-6 py-3 rounded-xl w-full hover:bg-gray-800 transition disabled:opacity-50"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Invio in corso...' : 'Invia messaggio'}
      </button>

      {success && (
        <p className="text-green-600 text-center mt-4">
          Messaggio inviato correttamente. Ti risponderemo al più presto!
        </p>
      )}

      {error && (
        <p className="text-red-600 text-center mt-4">
          Si è verificato un errore durante l'invio. Riprova tra poco.
        </p>
      )}
    </form>
  );
};

export default SimpleContactForm;
