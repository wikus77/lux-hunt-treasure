
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import LandingFooter from "@/components/landing/LandingFooter";
import BackgroundParticles from "@/components/ui/background-particles";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import StyledInput from "@/components/ui/styled-input";

const Contacts = () => {
  const navigate = useNavigate();
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
    <div className="min-h-screen flex flex-col bg-black">
      <UnifiedHeader />
      
      {/* Spacer for fixed header */}
      <div className="h-[72px]"></div>
      
      {/* Background effects */}
      <BackgroundParticles count={15} />
      
      {/* Main content */}
      <main className="flex-1 py-20 px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Hero section */}
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl font-orbitron font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">Contatta </span>
              <span className="bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">M1SSION</span>
            </h1>
            
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Hai domande, suggerimenti o hai bisogno di assistenza? Siamo qui per te.
            </p>
          </motion.div>
          
          {/* Contact info and form */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact info */}
            <motion.div 
              className="lg:col-span-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="glass-card h-full flex flex-col justify-between">
                <div>
                  <h2 className="text-2xl font-orbitron font-bold mb-6 text-cyan-400">Info di Contatto</h2>
                  
                  <div className="space-y-8">
                    <div className="flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-full bg-cyan-400/20 flex items-center justify-center shrink-0">
                        <Mail className="text-cyan-400" size={20} />
                      </div>
                      <div>
                        <h3 className="text-white font-medium mb-1">Email</h3>
                        <a href="mailto:contact@m1ssion.com" className="text-white/70 hover:text-cyan-400 transition-colors">
                          contact@m1ssion.com
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-full bg-cyan-400/20 flex items-center justify-center shrink-0">
                        <Phone className="text-cyan-400" size={20} />
                      </div>
                      <div>
                        <h3 className="text-white font-medium mb-1">Telefono</h3>
                        <a href="tel:+39123456789" className="text-white/70 hover:text-cyan-400 transition-colors">
                          +39 123 456 789
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-full bg-cyan-400/20 flex items-center justify-center shrink-0">
                        <MapPin className="text-cyan-400" size={20} />
                      </div>
                      <div>
                        <h3 className="text-white font-medium mb-1">Indirizzo</h3>
                        <p className="text-white/70">
                          1077 Budapest,<br />
                          Izabella utca 2. Alagsor 1
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-white/10">
                  <p className="text-white/50 text-sm">
                    Orari di assistenza:<br />
                    Lun-Ven: 9:00 - 18:00
                  </p>
                </div>
              </div>
            </motion.div>
            
            {/* Contact form */}
            <motion.div 
              className="lg:col-span-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
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
            </motion.div>
          </div>
          
          {/* FAQ */}
          <motion.div 
            className="mt-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-orbitron font-bold mb-8 text-center text-white">Domande Frequenti</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass-card">
                <h3 className="text-xl font-bold mb-3 text-cyan-400">Come posso cambiare il mio abbonamento?</h3>
                <p className="text-white/70">
                  Puoi modificare il tuo piano di abbonamento in qualsiasi momento dalla sezione "Abbonamenti" nel tuo profilo. Il nuovo piano entrerà in vigore immediatamente.
                </p>
              </div>
              
              <div className="glass-card">
                <h3 className="text-xl font-bold mb-3 text-cyan-400">Posso annullare il mio abbonamento?</h3>
                <p className="text-white/70">
                  Sì, puoi annullare il tuo abbonamento in qualsiasi momento dalla sezione "Abbonamenti". L'accesso rimarrà attivo fino alla fine del periodo di fatturazione corrente.
                </p>
              </div>
              
              <div className="glass-card">
                <h3 className="text-xl font-bold mb-3 text-cyan-400">Come funziona il sistema di vincita?</h3>
                <p className="text-white/70">
                  Il vincitore è la prima persona che trova la posizione esatta dell'auto utilizzando la funzione Buzz. Il sistema verifica automaticamente la posizione e, se corretta, il vincitore viene notificato immediatamente.
                </p>
              </div>
              
              <div className="glass-card">
                <h3 className="text-xl font-bold mb-3 text-cyan-400">Non ricevo gli indizi via email</h3>
                <p className="text-white/70">
                  Controlla la cartella spam/promozioni della tua email. Se il problema persiste, contattaci tramite questo modulo e risolveremo il problema il prima possibile.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      
      <LandingFooter />
    </div>
  );
};

export default Contacts;
