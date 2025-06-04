
import { useState } from "react";
import { motion } from "framer-motion";
import { saveSubscriber } from "@/services/newsletterService";
import { toast } from "sonner";
import { Bell, Send, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

interface NewsletterSectionProps {
  countdownCompleted?: boolean;
}

const NewsletterSection = ({ countdownCompleted = false }: NewsletterSectionProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!name.trim()) {
      toast.error("Inserisci il tuo nome");
      return;
    }
    
    if (!email.trim() || !email.includes('@')) {
      toast.error("Inserisci un indirizzo email valido");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Proceed with subscription - no CAPTCHA needed
      await saveSubscriber({
        name,
        email,
        campaign: 'landing_page'
      });
      
      setIsSubmitted(true);
      toast.success("Iscrizione completata con successo!", {
        description: "Riceverai presto aggiornamenti su M1SSION."
      });
      
      // Reset form
      setName("");
      setEmail("");
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      toast.error("Si è verificato un errore durante l'iscrizione", {
        description: "Per favore riprova più tardi."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-black to-blue-950/20">
      <motion.div 
        className="max-w-4xl mx-auto glass-card p-8 sm:p-10 relative overflow-hidden"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00E5FF] via-[#FF00FF] to-[#FFC107]"></div>
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#00E5FF]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#FF00FF]/10 rounded-full blur-3xl"></div>
        
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Icon and text */}
          <div className="md:w-1/2">
            <div className="mb-6 bg-white/5 w-16 h-16 rounded-full flex items-center justify-center">
              <Bell className="text-[#00E5FF] h-8 w-8" />
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-white">
              Resta aggiornato sul lancio di <span className="text-[#00E5FF]">M1</span><span className="text-white">SSION</span>
            </h2>
            
            <p className="text-white/70 mb-4">
              Iscriviti alla nostra newsletter per ricevere aggiornamenti esclusivi sul lancio del gioco, anteprima dei premi e vantaggi riservati agli iscritti.
            </p>
            
            <ul className="text-white/70 space-y-2 mb-6">
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] mr-2"></div>
                <span>Email di aggiornamento 15 giorni prima del lancio</span>
              </li>
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] mr-2"></div>
                <span>Contenuti esclusivi e suggerimenti strategici</span>
              </li>
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] mr-2"></div>
                <span>Crediti bonus per chi si iscrive prima del lancio</span>
              </li>
            </ul>
          </div>
          
          {/* Form */}
          <div className="md:w-1/2 w-full">
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-white/70 mb-1">Nome</label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-[#00E5FF]/50 focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/50"
                    placeholder="Il tuo nome"
                    disabled={isSubmitting}
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-1">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-[#00E5FF]/50 focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/50"
                    placeholder="La tua email"
                    disabled={isSubmitting}
                  />
                </div>
                
                <button
                  type="submit"
                  className={`w-full p-3 rounded-full flex items-center justify-center ${
                    isSubmitting
                      ? 'bg-gray-700 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-[#0066FF] to-[#FF00FF] text-white hover:shadow-[0_0_15px_rgba(0,102,255,0.5)]'
                  } font-medium transition-all duration-300`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Iscrizione in corso...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Iscriviti alla newsletter
                    </>
                  )}
                </button>
                
                <p className="text-xs text-white/40 text-center">
                  Iscrivendoti accetti la nostra <Link to="/privacy" className="text-cyan-400 hover:underline">Privacy Policy</Link>. Puoi annullare l'iscrizione in qualsiasi momento.
                </p>
              </form>
            ) : (
              <motion.div 
                className="bg-white/5 border border-[#00E5FF]/30 p-6 rounded-lg text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-16 h-16 mx-auto bg-[#00E5FF]/10 rounded-full flex items-center justify-center mb-4">
                  <Send className="text-[#00E5FF] h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Iscrizione completata!</h3>
                <p className="text-white/70">
                  Grazie per l'iscrizione. Ti terremo aggiornato su tutte le novità di M1SSION.
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default NewsletterSection;
