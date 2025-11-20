
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
        className="rounded-m1 overflow-hidden p-2 relative"
        style={{
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          borderRadius: '24px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 2px 3px rgba(255, 255, 255, 0.05), 0 0 24px rgba(0, 229, 255, 0.15)'
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#00D1FF] via-[#7B2EFF] to-[#F059FF] opacity-90" />
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
