
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Mail } from "lucide-react";

export const NewsletterSignup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim()) {
      toast.error("Per favore, inserisci nome ed email");
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Per favore, inserisci un'email valida");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Save to Supabase
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([
          { name, email, campaign: 'pre-launch' }
        ]);
      
      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast.error("Questa email è già registrata alla newsletter");
        } else {
          console.error("Database error:", error);
          toast.error("Si è verificato un errore. Riprova più tardi.");
        }
        setIsLoading(false);
        return;
      }
      
      // Send confirmation email via edge function
      const { error: emailError } = await supabase.functions.invoke('send-newsletter-confirmation', {
        body: { name, email }
      });
      
      if (emailError) {
        console.error("Email sending error:", emailError);
        // We still consider the signup successful even if email fails
      }
      
      toast.success("Iscrizione completata con successo!");
      toast.info("Riceverai presto aggiornamenti sul lancio di M1SSION");
      
      // Reset form
      setName('');
      setEmail('');
    } catch (err) {
      console.error("Newsletter signup error:", err);
      toast.error("Si è verificato un errore. Riprova più tardi.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <section className="w-full py-16 px-4 md:px-8 bg-black/60">
      <div className="max-w-3xl mx-auto glass-card p-8">
        <div className="flex items-center justify-center mb-6">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#4361ee] to-[#7209b7] flex items-center justify-center">
            <Mail className="text-white h-6 w-6" />
          </div>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 gradient-text-cyan">
          Resta Aggiornato sul Lancio
        </h2>
        <p className="text-center text-white/80 mb-8 max-w-lg mx-auto">
          Iscriviti alla newsletter per ricevere gli ultimi aggiornamenti, indizi esclusivi e crediti gratuiti per essere tra i primi a giocare a M1SSION!
        </p>
        
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-2">
          <Input
            type="text"
            placeholder="Il tuo nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-black/30 border-white/20"
            required
          />
          <Input
            type="email"
            placeholder="La tua email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-black/30 border-white/20"
            required
          />
          <Button 
            type="submit" 
            disabled={isLoading}
            className="bg-gradient-to-r from-[#4361ee] to-[#7209b7] hover:from-[#3a54d6] hover:to-[#6307a3] text-white"
          >
            {isLoading ? 'Invio...' : 'Iscriviti Ora'}
          </Button>
        </form>
        
        <div className="mt-6 text-center text-sm text-white/60">
          Riceverai aggiornamenti 15 giorni, 7 giorni, 3 giorni e 24 ore prima del lancio
        </div>
      </div>
    </section>
  );
};
