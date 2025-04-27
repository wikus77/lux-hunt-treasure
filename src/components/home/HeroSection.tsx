
import React from "react";
import { motion } from "framer-motion";
import { ParallaxImage } from "@/components/ui/parallax-image";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { ArrowRight } from "lucide-react";

const HeroSection = () => {
  return (
    <section 
      className="min-h-screen w-full relative flex items-center justify-center overflow-hidden py-24 px-4"
      data-scroll-section
    >
      {/* Background image with parallax effect */}
      <div className="absolute inset-0 z-0">
        <ParallaxImage
          src="/lovable-uploads/ee63e6a9-208d-43f5-8bad-4c94f9c066cd.png"
          alt="Futuristic cityscape"
          speed={0.2}
          className="w-full h-full"
          imageClassName="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-black/60 z-10"></div>
      </div>
      
      {/* Glowing overlay effect */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-[#00a3ff]/20 to-transparent"></div>
      
      <div className="relative z-20 max-w-4xl mx-auto text-center" data-scroll data-scroll-speed="0.1">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.19, 1, 0.22, 1], delay: 0.2 }}
          className="mb-6"
        >
          <h2 className="text-sm md:text-base uppercase tracking-[0.3em] text-cyan-300">Benvenuto in</h2>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1], delay: 0.4 }}
          className="mb-4"
        >
          <h1 className="text-6xl md:text-8xl font-orbitron font-bold gradient-text-cyan mb-4">
            M1SSION
          </h1>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.19, 1, 0.22, 1], delay: 0.6 }}
          className="mb-10"
        >
          <h3 className="text-xl md:text-3xl text-white/90 font-light">
            La tua <span className="text-yellow-400 font-medium">sfida</span> inizia ora
          </h3>
          <p className="text-lg md:text-xl text-white/70 mt-4 max-w-2xl mx-auto">
            Vivi l'esperienza di una caccia al tesoro esclusiva con auto sportive di lusso in palio ogni 30 giorni
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.19, 1, 0.22, 1], delay: 0.8 }}
          className="flex flex-col md:flex-row items-center justify-center gap-6"
        >
          <MagneticButton
            className="bg-gradient-to-r from-cyan-400 to-blue-600 text-black px-8 py-4 rounded-full font-semibold text-lg flex items-center gap-2 hover:shadow-[0_0_20px_rgba(0,229,255,0.5)] transition-all duration-300"
            strength={30}
          >
            Scopri la missione <ArrowRight className="w-5 h-5 ml-1" />
          </MagneticButton>
          
          <MagneticButton
            className="px-8 py-4 rounded-full bg-transparent border border-cyan-400 text-cyan-400 font-medium hover:bg-cyan-400/10 transition-all duration-300"
            strength={20}
          >
            Come funziona
          </MagneticButton>
        </motion.div>
        
        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-8 h-12 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-white/70 rounded-full"></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
