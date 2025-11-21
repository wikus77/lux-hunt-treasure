
import { motion } from "framer-motion";

interface CarouselIndicatorsProps {
  count: number;
}

export const CarouselIndicators: React.FC<CarouselIndicatorsProps> = ({ count }) => {
  return (
    <div className="mt-6 flex justify-center gap-2">
      {Array.from({ length: Math.min(6, count) }).map((_, i) => (
        <motion.div 
          key={i}
          className="w-2 h-2 rounded-full bg-white/30"
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 + i * 0.1, duration: 0.3 }}
          whileHover={{ 
            backgroundColor: "rgba(155, 135, 245, 0.7)",
            scale: 1.3, 
            transition: { duration: 0.2 }
          }}
        />
      ))}
    </div>
  );
};
