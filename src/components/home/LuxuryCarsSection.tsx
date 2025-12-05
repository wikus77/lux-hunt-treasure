
/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * M1SSION™ Luxury Cars Section - Auto di Lusso
 */

import { motion } from "framer-motion";
import FuturisticCarsCarousel from "./FuturisticCarsCarousel";

const LuxuryCarsSection = () => {
  return (
    <div className="mt-8 px-4">
      <motion.h2 
        className="text-xl font-bold text-center mb-4 font-orbitron neon-text-cyan"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <span>Auto di Lusso</span> in Palio
      </motion.h2>
      <div 
        className="m1-relief rounded-m1 overflow-hidden p-2 relative"
        style={{
          borderRadius: '24px'
        }}
      >
        {/* Animated glow strip like header */}
        <div className="absolute top-0 left-0 right-0 h-[2px] overflow-hidden">
          <div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60"
            style={{
              animation: 'slideGlow 3s ease-in-out infinite',
              width: '200%',
              left: '-100%'
            }}
          />
        </div>
        <style>{`
          @keyframes slideGlow {
            0% { transform: translateX(0); }
            50% { transform: translateX(50%); }
            100% { transform: translateX(0); }
          }
        `}</style>
        <FuturisticCarsCarousel />
      </div>
    </div>
  );
};

export { LuxuryCarsSection };
export default LuxuryCarsSection;

/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * M1SSION™ Luxury Cars Section completamente funzionale e compatibile iOS
 */
