
import React, { useState } from "react";
import { Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import StyledInput from "@/components/ui/styled-input";

const ContactForm = () => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validation
    if (!name || !email || !subject || !message) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Completa tutti i campi per inviare il messaggio."
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Send email to contact@m1ssion.com
      const emailData = {
        to: "contact@m1ssion.com",
        from: email,
        subject: `[Contatto dal sito] ${subject}`,
        message: `Nome: ${name}\nEmail: ${email}\n\nMessaggio:\n${message}`,
      };
      
      // Log attempt
      console.log("Tentativo di invio email:", emailData);
      
      // Here we would normally implement a real email sending service
      // For demonstration purposes, we'll simulate a successful email send
      
      setTimeout(() => {
        toast({
          title: "Messaggio inviato",
          description: "Grazie per averci contattato. Ti risponderemo al più presto."
        });
        setIsSubmitting(false);
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
      }, 1500);
      
    } catch (error) {
      console.error("Errore nell'invio dell'email:", error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Si è verificato un problema durante l'invio del messaggio. Riprova più tardi."
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-card">
      <h2 className="text-2xl font-orbitron font-bold mb-6 text-cyan-400">Inviaci un Messaggio</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-white mb-2">Nome</label>
            <StyledInput
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Il tuo nome"
              icon={<Mail size={16} />}
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-white mb-2">Email</label>
            <StyledInput
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="La tua email"
              icon={<Mail size={16} />}
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="subject" className="block text-white mb-2">Oggetto</label>
          <StyledInput
            id="subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Oggetto del messaggio"
            icon={<Mail size={16} />}
          />
        </div>
        
        <div>
          <label htmlFor="message" className="block text-white mb-2">Messaggio</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Il tuo messaggio"
            className="w-full bg-black/50 border-white/10 rounded-md border px-3 py-2 min-h-36 text-white"
            rows={6}
          />
        </div>
        
        <div>
          <Button
            type="submit"
            className="bg-gradient-to-r from-cyan-400 to-blue-600 text-black px-6 py-2 rounded-full font-medium flex items-center gap-2 hover:shadow-[0_0_15px_rgba(0,229,255,0.5)]"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              "Invio in corso..."
            ) : (
              <>
                Invia Messaggio <Send size={16} />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
