
import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error("Inserisci un'email valida");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // ✅ NO CAPTCHA VALIDATION - Direct submission
      console.log("📧 Newsletter subscription - NO CAPTCHA validation");
      
      const { data, error } = await supabase.functions.invoke('handle-pre-registration', {
        body: {
          name: "Newsletter Subscriber",
          email: email.trim()
        }
      });

      if (error) throw error;

      toast.success("Iscrizione alla newsletter completata!");
      setEmail("");
    } catch (error: any) {
      console.error("Newsletter subscription error:", error);
      toast.error("Errore durante l'iscrizione");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      <div className="container mx-auto max-w-4xl text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-orbitron font-bold mb-6">
            <span className="text-[#00D1FF]">Resta</span>{" "}
            <span className="text-white">Aggiornato</span>
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Iscriviti alla nostra newsletter per ricevere aggiornamenti esclusivi 
            sul lancio di M1SSION e contenuti riservati agli agenti.
          </p>
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="La tua email"
              className="flex-1 px-4 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-[#00D1FF] transition-colors"
              disabled={isSubmitting}
              required
            />
            <motion.button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-[#00D1FF] to-[#0099CC] text-white rounded-full font-medium hover:shadow-[0_0_20px_rgba(0,209,255,0.5)] transition-all duration-300 disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2 inline" />
                  Iscriviti
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default NewsletterSection;
