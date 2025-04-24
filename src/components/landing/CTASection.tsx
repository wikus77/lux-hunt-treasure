
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Shield, Diamond } from "lucide-react";

interface CTASectionProps {
  onRegisterClick: () => void;
}

const CTASection = ({ onRegisterClick }: CTASectionProps) => {
  return (
    <motion.section 
      className="py-20 px-4 bg-gradient-to-b from-black to-[#050a14] w-full relative overflow-hidden"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      {/* Particles background */}
      <div className="absolute inset-0 z-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 6 + 2 + 'px',
              height: Math.random() * 6 + 2 + 'px',
              backgroundColor: i % 3 === 0 ? '#00E5FF' : i % 3 === 1 ? '#FFC107' : '#FF00FF',
              boxShadow: i % 3 === 0 ? '0 0 10px #00E5FF' : i % 3 === 1 ? '0 0 10px #FFC107' : '0 0 10px #FF00FF',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              opacity: Math.random() * 0.5 + 0.3,
              animation: `float-particle ${Math.random() * 10 + 10}s infinite linear`
            }}
          />
        ))}
      </div>

      <div className="max-w-screen-xl mx-auto relative z-10">
        <motion.h2 
          className="text-4xl font-bold mb-6 text-center bg-gradient-to-r from-[#00E5FF] to-[#FF00FF] bg-clip-text text-transparent"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          Trasforma il Tuo Sogno in Realtà
        </motion.h2>

        <motion.p 
          className="text-xl max-w-2xl mx-auto mb-10 text-center text-white/80"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
        >
          Non perdere l'opportunità di trasformare il tuo sogno in realtà. Unisciti a M1SSION oggi stesso e inizia il tuo viaggio verso l'auto dei tuoi sogni.
        </motion.p>

        <motion.div 
          className="flex justify-center"
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <Button
            className="bg-gradient-to-r from-[#00E5FF] to-[#00BFFF] text-black font-bold px-8 py-6 rounded-full transform transition-transform hover:scale-105 hover:shadow-[0_0_20px_rgba(0,229,255,0.4)]"
            size="lg"
            onClick={onRegisterClick}
          >
            Registrati Ora
          </Button>
        </motion.div>

        {/* Decorative icons */}
        <div className="absolute left-10 top-10 text-[#00E5FF]/20 hidden lg:block">
          <Shield size={60} />
        </div>
        <div className="absolute right-10 bottom-10 text-[#FF00FF]/20 hidden lg:block">
          <Diamond size={60} />
        </div>
      </div>
    </motion.section>
  );
};

export default CTASection;
