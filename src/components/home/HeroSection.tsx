
import React from "react";
import { motion } from "framer-motion";

const HeroSection: React.FC = () => {
  return (
    <motion.div 
      className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#1C1C1F] to-[#000000] border border-white/10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Gradient border top */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#FC1EFF] via-[#365EFF] to-[#FACC15]"></div>
      
      <div className="p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-orbitron font-bold text-white mb-2">
            M1SSION<span className="text-xs align-top">™</span> PRIZE
          </h1>
          <div className="text-[#00D1FF] font-medium">
            Visibilità 62%
          </div>
        </div>

        {/* Car Image */}
        <div className="relative mb-6">
          <div className="aspect-video bg-gradient-to-br from-gray-900 to-black rounded-lg overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=400&fit=crop&crop=center"
              alt="Porsche Mission Prize"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          </div>
          
          {/* Overlay text */}
          <div className="absolute bottom-4 left-4">
            <div className="text-white font-bold text-xl">PORSCHE 911</div>
            <div className="text-[#FACC15] text-sm">TURBO S</div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-[#00D1FF] font-bold text-lg">€150,000</div>
            <div className="text-white/60 text-sm">Valore Premio</div>
          </div>
          <div>
            <div className="text-[#FACC15] font-bold text-lg">62%</div>
            <div className="text-white/60 text-sm">Completamento</div>
          </div>
          <div>
            <div className="text-[#FC1EFF] font-bold text-lg">48h</div>
            <div className="text-white/60 text-sm">Tempo Rimasto</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HeroSection;
