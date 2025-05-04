
import React from "react";
import { motion } from "framer-motion";
import { Car, Trophy } from "lucide-react";

interface SectionProps {
  variants: any;
}

const PrizesSection: React.FC<SectionProps> = ({ variants }) => {
  return (
    <motion.div className="glass-card mb-12" variants={variants}>
      <h2 className="text-3xl font-orbitron font-bold mb-6 text-cyan-400">Premi in Palio</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-black/60 to-black/40 border border-white/10 p-6 rounded-xl">
          <Car className="text-yellow-400 mb-4" size={32} />
          <h3 className="text-xl font-semibold text-white mb-2">Premio Principale</h3>
          <p className="text-white/70">
            L'auto di lusso del mese. Ogni mese viene messa in palio un'auto diversa, dal valore di centinaia di migliaia di euro.
          </p>
          <p className="text-cyan-400 mt-2 text-sm">
            Ferrari, Lamborghini, Porsche e altre supercar di lusso.
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-black/60 to-black/40 border border-white/10 p-6 rounded-xl">
          <Trophy className="text-yellow-400 mb-4" size={32} />
          <h3 className="text-xl font-semibold text-white mb-2">Premi Secondari</h3>
          <p className="text-white/70">
            Esperienze di guida su pista, viaggi di lusso, upgrade dell'abbonamento e altri premi esclusivi per i classificati dopo il vincitore.
          </p>
        </div>
      </div>
      
      <div className="luxury-cars-showcase bg-black/50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-4 text-center">Auto in Palio Quest'Anno</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mt-6">
          <div className="text-center">
            <div className="car-logo-container ferrari-logo-container mx-auto rounded-full flex items-center justify-center mb-3">
              <img 
                src="/lovable-uploads/85332ca5-c65b-45b2-a615-f082fa033670.png" 
                alt="Ferrari Logo" 
                className="car-logo object-contain"
              />
              <div className="absolute inset-0 rounded-full bg-transparent border border-[#FF0000] opacity-50 animate-ping"></div>
            </div>
            <p className="text-white/60 text-sm">SF90 Stradale</p>
          </div>
          <div className="text-center">
            <div className="car-logo-container mclaren-logo-container mx-auto rounded-full flex items-center justify-center mb-3">
              <img 
                src="/lovable-uploads/b78bdba7-b7f1-446a-918b-44479c0a572f.png" 
                alt="McLaren Logo" 
                className="car-logo object-contain"
              />
              <div className="absolute inset-0 rounded-full bg-transparent border border-[#0284c7] opacity-50 animate-ping"></div>
            </div>
            <p className="text-white/60 text-sm">Huracán STO</p>
          </div>
          <div className="text-center">
            <div className="car-logo-container porsche-logo-container mx-auto rounded-full flex items-center justify-center mb-3">
              <img 
                src="/lovable-uploads/adbaf0b2-3ae6-4134-a0e5-2cd8c932326a.png" 
                alt="Porsche Logo" 
                className="car-logo object-contain"
              />
              <div className="absolute inset-0 rounded-full bg-transparent border border-[#CCCCCC] opacity-50 animate-ping"></div>
            </div>
            <p className="text-white/60 text-sm">911 GT3 RS</p>
          </div>
          <div className="text-center">
            <div className="car-logo-container lambo-logo-container mx-auto rounded-full flex items-center justify-center mb-3">
              <img 
                src="/lovable-uploads/1ae73dae-49f8-4541-8b68-4526a0d1d4cf.png" 
                alt="Lamborghini Logo" 
                className="car-logo object-contain"
              />
              <div className="absolute inset-0 rounded-full bg-transparent border border-[#FFC107] opacity-50 animate-ping"></div>
            </div>
            <p className="text-white/60 text-sm">765LT Spider</p>
          </div>
          <div className="text-center">
            <div className="car-logo-container aston-logo-container mx-auto rounded-full flex items-center justify-center mb-3">
              <img 
                src="/lovable-uploads/28fac653-b8fe-4d2e-9c9f-2d9f321f21fb.png" 
                alt="Aston Martin Logo" 
                className="car-logo object-contain"
              />
              <div className="absolute inset-0 rounded-full bg-transparent border border-[#10b981] opacity-50 animate-ping"></div>
            </div>
            <p className="text-white/60 text-sm">Valkyrie</p>
          </div>
          <div className="text-center">
            <div className="car-logo-container mercedes-logo-container mx-auto rounded-full flex items-center justify-center mb-3">
              <img 
                src="/lovable-uploads/a290aca5-7e14-4ff3-bd4e-4d4fa6b22c1e.png" 
                alt="Mercedes Logo" 
                className="car-logo object-contain"
              />
              <div className="absolute inset-0 rounded-full bg-transparent border border-[#808080] opacity-50 animate-ping"></div>
            </div>
            <p className="text-white/60 text-sm">AMG GT Black</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PrizesSection;
