
import React from "react";
import { motion } from "framer-motion";
import { ParallaxImage } from "@/components/ui/parallax-image";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { ArrowRight } from "lucide-react";

const stagger = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.25,
      delayChildren: 0.1,
    },
  },
};

const fadeSlideUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const HeroSection = () => {
  return (
    <section 
      className="min-h-screen w-full relative flex items-center justify-center overflow-hidden py-24 px-4"
      data-scroll-section
    >
      {/* Animated background with moving light */}
      <div className="absolute inset-0 z-0">
        <div className="bg-animated absolute inset-0" />
        <ParallaxImage
          src="/lovable-uploads/49a73ae5-c836-4c5d-8e07-0555edac931d.png"
          alt="Luxury car background"
          speed={0.2}
          className="w-full h-full"
          imageClassName="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-black/60 z-10"></div>
      </div>
      
      {/* Glowing overlay effect */}
      <motion.div 
        className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-[#00a3ff]/20 to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      />
      
      <motion.div 
        className="relative z-20 max-w-4xl mx-auto text-center" 
        data-scroll 
        data-scroll-speed="0.1"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        <motion.div
          variants={fadeSlideUp}
          className="mb-6"
        >
          <h2 className="text-sm md:text-base uppercase tracking-[0.3em] text-cyan-300">Benvenuto in</h2>
        </motion.div>
        
        <motion.div
          variants={fadeSlideUp}
          className="mb-4"
        >
          <h1 className="text-6xl md:text-8xl font-orbitron font-bold gradient-text-cyan mb-4">
            M1SSION
          </h1>
        </motion.div>
        
        <motion.div
          variants={fadeSlideUp}
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
          variants={fadeSlideUp}
          className="flex flex-col md:flex-row items-center justify-center gap-6"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MagneticButton
              className="bg-gradient-to-r from-cyan-400 to-blue-600 text-black px-8 py-4 rounded-full font-semibold text-lg flex items-center gap-2 hover:shadow-[0_0_20px_rgba(0,229,255,0.5)] transition-all duration-300"
              strength={30}
            >
              Scopri la missione <ArrowRight className="w-5 h-5 ml-1" />
            </MagneticButton>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MagneticButton
              className="px-8 py-4 rounded-full bg-transparent border border-cyan-400 text-cyan-400 font-medium hover:bg-cyan-400/10 transition-all duration-300"
              strength={20}
            >
              Come funziona
            </MagneticButton>
          </motion.div>
        </motion.div>
        
        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          variants={fadeSlideUp}
        >
          <div className="w-8 h-12 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-white/70 rounded-full"></div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
