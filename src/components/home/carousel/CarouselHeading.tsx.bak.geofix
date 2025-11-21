
import { motion } from "framer-motion";

interface CarouselHeadingProps {
  title: string;
}

export const CarouselHeading: React.FC<CarouselHeadingProps> = ({ title }) => {
  return (
    <motion.div 
      className="mb-6 flex items-center gap-2 px-4"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      <div className="overflow-hidden">
        <motion.h2 
          className="gradient-text-cyan text-3xl font-bold font-orbitron"
          initial={{ y: "100%" }}
          whileInView={{ y: "0%" }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
        >
          {title}
        </motion.h2>
      </div>
      <motion.div 
        className="h-px flex-1 bg-gradient-to-r from-cyan-400/10 via-cyan-400/50 to-cyan-400/10"
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.3 }}
        style={{ transformOrigin: "left" }}
      />
    </motion.div>
  );
};
