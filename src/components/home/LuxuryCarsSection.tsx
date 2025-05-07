
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
      <FuturisticCarsCarousel />
    </div>
  );
};

export default LuxuryCarsSection;
