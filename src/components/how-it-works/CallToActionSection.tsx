
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CallToActionSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 px-4 relative z-10">
      <div className="max-w-4xl mx-auto text-center">
        <motion.h2 
          className="text-4xl md:text-5xl font-orbitron font-bold mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">Pronto a </span>
          <span className="bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">Iniziare?</span>
        </motion.h2>
        
        <motion.p 
          className="text-xl text-white/70 mb-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Entra in M1SSION e inizia la tua caccia all'auto dei tuoi sogni
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Button 
            onClick={() => navigate("/register")}
            className="bg-gradient-to-r from-cyan-400 to-blue-600 text-black px-8 py-6 rounded-full text-lg font-bold flex items-center gap-2 hover:shadow-[0_0_20px_rgba(0,229,255,0.5)]"
          >
            Unisciti alla Missione <ArrowRight className="ml-2" size={20} />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default CallToActionSection;
