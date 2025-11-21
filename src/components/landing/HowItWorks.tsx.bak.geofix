
import { motion } from "framer-motion";
import { Check, UserCheck, MapPin, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HowItWorksProps {
  onRegisterClick: () => void;
  countdownCompleted?: boolean;
}

const HowItWorks = ({ onRegisterClick, countdownCompleted = false }: HowItWorksProps) => {
  const steps = [
    {
      icon: <UserCheck className="w-8 h-8 text-[#00E5FF]" />,
      title: "Registrazione",
      description: "Crea il tuo account su M1SSION e preparati alla sfida"
    },
    {
      icon: <Check className="w-8 h-8 text-[#00E5FF]" />,
      title: "Ricevi Indizi",
      description: "Ogni settimana ricevi nuovi indizi via app ed email"
    },
    {
      icon: <MapPin className="w-8 h-8 text-[#FFC107]" />,
      title: "Risolvi la Missione",
      description: "Analizza gli indizi e trova la posizione del premio"
    },
    {
      icon: <Award className="w-8 h-8 text-[#FF00FF]" />,
      title: "Vinci davvero",
      description: "Se sei il primo a trovare il premio, diventa tuo!"
    }
  ];

  return (
    <motion.div 
      className="max-w-4xl mx-auto px-4 py-16"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      id="how-it-works"
    >
      <motion.h2 
        className="text-3xl md:text-4xl font-bold mb-12 text-center"
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        Scopri <span className="text-[#00E5FF]">M1</span><span className="text-white">SSION</span>
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 relative">
        {/* Linea connettore per desktop */}
        <div className="hidden lg:block absolute top-16 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-[#00E5FF] via-[#FFC107] to-[#FF00FF] z-0"></div>
        
        {steps.map((step, index) => (
          <motion.div
            key={index}
            className="glass-card relative z-10"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <span className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-black border border-white/10 flex items-center justify-center font-bold text-white z-20">
              {index + 1}
            </span>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 p-3 rounded-full bg-black/50 border border-white/10">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">{step.title}</h3>
              <p className="text-white/70">{step.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div 
        className="text-center mt-12"
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        viewport={{ once: true }}
      >
        <Button 
          onClick={onRegisterClick}
          className={`bg-gradient-to-r from-[#00E5FF] to-[#00BFFF] text-black font-bold px-8 py-6 rounded-full transition-all duration-300 ${countdownCompleted ? 'hover:shadow-[0_0_15px_rgba(0,229,255,0.5)] hover:scale-105' : 'opacity-70 cursor-not-allowed'}`}
          size="lg"
          disabled={!countdownCompleted}
        >
          Inizia La Tua M1SSION
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default HowItWorks;
