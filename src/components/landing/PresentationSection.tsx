
import { motion } from "framer-motion";
import { ArrowRight, Car, Search, Key, Trophy } from "lucide-react";

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
      className="max-w-4xl mx-auto px-4 py-16 text-center"
      variants={containerVariants}
      initial="hidden"
      animate={visible ? "visible" : "hidden"}
    >
      <motion.h1 
        className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-[#00E5FF] to-[#00BFFF] bg-clip-text text-transparent"
        variants={itemVariants}
      >
        Benvenuto in M1SSION
      </motion.h1>

      <motion.p 
        className="text-xl md:text-2xl mb-8 text-white/90"
        variants={itemVariants}
      >
        Il gioco a premi che cambia le regole
      </motion.p>

      <motion.p 
        className="text-lg mb-12 text-white/80"
        variants={itemVariants}
      >
        Ogni mese una nuova sfida. <br />
        In palio: auto di lusso come <span className="text-[#FFC107] font-semibold">Lamborghini Huracán</span>, 
        <span className="text-[#FF0000] font-semibold"> Ferrari 488 GTB</span>, 
        <span className="text-[#00E5FF] font-semibold"> Porsche 992</span>, 
        <span className="text-[#A3A3A3] font-semibold"> Aston Martin DBX</span>
      </motion.p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[
          { text: "Iscriviti", icon: <Key className="mb-2 mx-auto text-[#00E5FF]" size={32} /> },
          { text: "Ricevi gli indizi", icon: <Search className="mb-2 mx-auto text-[#00E5FF]" size={32} /> },
          { text: "Risolvi la missione", icon: <ArrowRight className="mb-2 mx-auto text-[#00E5FF]" size={32} /> },
          { text: "Chi trova il premio... lo vince davvero", icon: <Trophy className="mb-2 mx-auto text-[#FFC107]" size={32} /> }
        ].map((step, index) => (
          <motion.div 
            key={index}
            className="p-4 glass-card hover:bg-white/10 transition-all"
            variants={itemVariants}
          >
            {step.icon}
            <p className={index === 3 ? "text-[#FFC107] font-bold" : "text-white/90"}>
              {step.text}
            </p>
          </motion.div>
        ))}
      </div>

      <motion.div variants={itemVariants}>
        <Car className="inline-block mr-2 text-white" />
        <span className="text-lg text-white/70 italic">
          FIND THE PRIZE... AND REALLY WIN.
        </span>
      </motion.div>
    </motion.div>
  );
};

export default PresentationSection;
