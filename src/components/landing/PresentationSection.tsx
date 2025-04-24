
import { motion } from "framer-motion";
import { ArrowRight, Car } from "lucide-react";

interface PresentationSectionProps {
  visible: boolean;
}

const PresentationSection = ({ visible }: PresentationSectionProps) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  return (
    <motion.div
      className="max-w-4xl mx-auto px-4 py-16 text-center relative"
      variants={containerVariants}
      initial="hidden"
      animate={visible ? "visible" : "hidden"}
    >
      <motion.h1 
        className="text-5xl md:text-7xl font-light mb-6 text-[#00E5FF]"
        variants={itemVariants}
      >
        WELCOME TO MISSION
      </motion.h1>

      <motion.p 
        className="text-xl md:text-2xl mb-8 text-white/90 font-light"
        variants={itemVariants}
      >
        The prize contest that changes the rules
      </motion.p>

      <motion.div
        className="space-y-4 mb-12"
        variants={itemVariants}
      >
        <p className="text-lg text-white/80 font-light">Each month a new challenge</p>
        <p className="text-lg text-white/80 font-light">With luxury cars to win like</p>
        <p className="text-lg text-white/80 font-light">
          <span className="text-white">Lamborghini Huracán</span>
          <span className="mx-2">·</span>
          <span className="text-white">Ferrari 488 GTB</span>
          <br />
          <span className="text-white">Porsche 992</span>
          <span className="mx-2">·</span>
          <span className="text-white">Aston Martin DBX</span>
        </p>
      </motion.div>

      <motion.div 
        className="space-y-3 mb-8"
        variants={itemVariants}
      >
        <p className="text-[#00E5FF] text-lg uppercase">Register</p>
        <p className="text-[#00E5FF] text-lg uppercase">Recieve the clues</p>
        <p className="text-[#00E5FF] text-lg uppercase">Solve the mission</p>
        <p className="text-[#FFC107] text-lg uppercase">Find the prize...</p>
        <p className="text-[#FFC107] text-lg uppercase">and really win.</p>
      </motion.div>

      {/* Linee decorative orizzontali */}
      <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-[#00E5FF]/20 to-transparent top-0 left-0"></div>
      <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-[#00E5FF]/20 to-transparent bottom-0 left-0"></div>
    </motion.div>
  );
};

export default PresentationSection;
