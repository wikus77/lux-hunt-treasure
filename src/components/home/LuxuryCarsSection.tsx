
import { motion } from "framer-motion";
import FuturisticCarsCarousel from "./FuturisticCarsCarousel";

const LuxuryCarsSection = () => {
  return (
    <div className="mt-8 px-4">
      <motion.h2 
        className="text-xl font-bold text-center mb-4 text-white"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <span className="text-cyan-400">Auto di Lusso</span> in Palio
      </motion.h2>
      <div className="rounded-xl overflow-hidden bg-black/30 backdrop-blur-sm border border-white/10 p-2"
         style={{ boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15), 0 0 8px rgba(0, 209, 255, 0.05)" }}>
        <FuturisticCarsCarousel />
      </div>
    </div>
  );
};

export default LuxuryCarsSection;
