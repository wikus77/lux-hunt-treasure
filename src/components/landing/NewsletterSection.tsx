
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Mail, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { saveSubscriber } from "@/services/newsletterService";

const NewsletterSection = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim()) {
      toast.error("Inserisci nome ed email per iscriverti alla newsletter");
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Inserisci un indirizzo email valido");
      return;
    }

    setIsLoading(true);

    try {
      await saveSubscriber({ name, email });
      setIsSuccess(true);
      toast.success("Iscrizione completata con successo!", {
        description: "Ti invieremo aggiornamenti sul lancio di M1SSION.",
      });
      setName("");
      setEmail("");

      // Reset success state after 3 seconds
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving subscriber:", error);
      toast.error("Si è verificato un errore durante l'iscrizione. Riprova più tardi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="w-full py-16 px-4">
      <div className="max-w-4xl mx-auto glass-card p-8 relative overflow-hidden">
        {/* Glow effect at the top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-black" />
          </div>
          <h2 className="text-3xl md:text-4xl font-orbitron font-bold gradient-text-cyan mb-4">
            Non perdere l'inizio della M1SSION
          </h2>
          <p className="text-gray-300">
            Iscriviti alla newsletter e ricevi aggiornamenti esclusivi sul lancio del gioco, 
            indizi anticipati e suggerimenti segreti per avere un vantaggio competitivo.
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-md mx-auto"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Il tuo nome"
                className="bg-black/50 border border-white/10 text-white rounded-full py-6 px-5"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading || isSuccess}
              />
            </div>
            
            <div>
              <Input 
                type="email"
                placeholder="La tua email"
                className="bg-black/50 border border-white/10 text-white rounded-full py-6 px-5"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading || isSuccess}
              />
            </div>
            
            <div>
              <Button 
                type="submit" 
                className={`w-full py-6 rounded-full text-black font-bold transition-all ${
                  isSuccess 
                    ? "bg-green-500 hover:bg-green-600" 
                    : "bg-gradient-to-r from-cyan-400 to-blue-600 hover:shadow-[0_0_15px_rgba(0,229,255,0.5)]"
                }`}
                disabled={isLoading || isSuccess}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin h-5 w-5 mr-3 border-2 border-b-0 border-white rounded-full"></div>
                    <span>Invio in corso...</span>
                  </div>
                ) : isSuccess ? (
                  <div className="flex items-center justify-center">
                    <Check className="mr-2" />
                    <span>Iscrizione completata!</span>
                  </div>
                ) : (
                  "ISCRIVITI ORA"
                )}
              </Button>
            </div>
          </form>
          
          <div className="mt-6 text-sm text-gray-400 text-center">
            <p className="flex items-center justify-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              Riceverai aggiornamenti 15, 7, 3 giorni e 24 ore prima del lancio
            </p>
            <p className="mt-2">
              Iscrivendoti accetti la nostra Privacy Policy e dichiari di avere almeno 18 anni
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default NewsletterSection;
