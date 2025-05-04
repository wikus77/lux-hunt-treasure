
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface CTASectionProps {
  onRegisterClick: () => void;
}

const CTASection = ({ onRegisterClick }: CTASectionProps) => {
  return (
    <section className="py-24 px-4 bg-black relative overflow-hidden">
      {/* Background gradient effect */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,229,255,0.15),rgba(0,0,0,0)_60%)]"></div>
      </div>
      
      {/* Horizontal light beam animation */}
      <motion.div 
        className="absolute h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent w-full top-1/2 -translate-y-1/2 -z-5 opacity-30"
        animate={{ 
          x: [-1000, 2000],
          opacity: [0, 0.6, 0]
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          repeatType: "loop",
          ease: "easeInOut",
          delay: 1
        }}
      />

      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="glass-card p-10 md:p-16 relative overflow-hidden border-cyan-400/20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Decorative elements */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-cyan-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 text-center">
            <h2 className="text-3xl md:text-5xl font-orbitron font-bold mb-6 gradient-text-cyan">
              Inizia La Tua Avventura
            </h2>
            
            <p className="text-white/70 text-lg md:text-xl max-w-3xl mx-auto mb-10">
              Unisciti a M1SSION oggi e preparati per un'esperienza che potrebbe cambiare la tua vita. 
              Ogni mese una nuova possibilità di vincere un'auto di lusso.
            </p>
            
            <div className="mission-motto text-yellow-400 text-xl mb-10">IT IS POSSIBLE</div>
            
            <Button 
              onClick={onRegisterClick}
              className="neon-button-cyan px-10 py-6 text-lg"
              size="lg"
            >
              Registrati ora <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
