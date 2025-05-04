
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown } from "lucide-react";

interface HeroSectionProps {
  onRegisterClick: () => void;
}

const HeroSection = ({ onRegisterClick }: HeroSectionProps) => {
  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden py-20 px-4">
      {/* Background particles */}
      <div className="absolute inset-0 -z-10">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              backgroundColor: i % 3 === 0 ? '#00E5FF' : i % 3 === 1 ? '#FFC300' : '#FF00FF',
              boxShadow: i % 3 === 0 ? '0 0 8px #00E5FF' : i % 3 === 1 ? '0 0 8px #FFC300' : '0 0 8px #FF00FF',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              filter: "blur(1px)"
            }}
            animate={{
              y: [0, -20, 0, 20, 0],
              x: [0, 10, 20, 10, 0],
              opacity: [0.4, 0.8, 0.6, 0.9, 0.4],
            }}
            transition={{
              duration: Math.random() * 15 + 10,
              ease: "easeInOut",
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black -z-10"></div>

      {/* Hero content */}
      <div className="max-w-6xl mx-auto text-center relative z-10 mt-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mb-4"
        >
          <h2 className="text-yellow-400 text-lg md:text-xl uppercase tracking-widest font-light">
            Una nuova esperienza esclusiva
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 1 }}
        >
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-orbitron font-bold mb-6 gradient-text-cyan">
            M1SSION
          </h1>
          
          <div className="text-white/80 text-xl md:text-3xl font-light max-w-3xl mx-auto mb-8">
            Nel futuro, la caccia al tesoro non è più un gioco… è una <span className="text-yellow-400">sfida globale</span>.
          </div>

          <p className="text-white/70 text-lg md:text-xl max-w-3xl mx-auto mb-10">
            Ogni mese, una nuova auto di lusso scompare. Solo i più intuitivi, strategici e veloci sapranno interpretare gli indizi e scoprire dove si nasconde il premio.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="flex flex-col md:flex-row justify-center gap-4 md:gap-6"
        >
          <Button 
            onClick={onRegisterClick} 
            className="neon-button-cyan px-8 py-6 text-lg"
            size="lg"
          >
            Inizia la tua M1SSION <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          
          <Button 
            variant="outline" 
            className="border-cyan-400/30 hover:border-cyan-400/70 text-white"
            size="lg"
          >
            Scopri di più
          </Button>
        </motion.div>

        <motion.div 
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="text-white/50 w-8 h-8" />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
