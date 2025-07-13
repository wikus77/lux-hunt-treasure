
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { useState } from "react";
import ImagePreview from "@/components/ui/image-preview";
import { useLongPress } from "@/hooks/useLongPress";

interface MissionCardProps {
  prize: {
    name: string;
    image: string;
    description: string;
    date: string;
  };
  index: number;
}

export const MissionCard: React.FC<MissionCardProps> = ({ prize, index }) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const longPressProps = useLongPress(() => {
    setPreviewImage(prize.image);
  });

  const closePreview = () => {
    setPreviewImage(null);
  };

  return (
    <>
      <motion.div
        className="group relative rounded-2xl overflow-hidden shadow-xl border-4 border-purple-400/80 bg-gradient-to-br from-black/80 to-purple-900/20 cursor-pointer h-full"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.1 * index, ease: [0.19, 1, 0.22, 1] }}
        whileHover={{ 
          scale: 1.03,
          transition: { duration: 0.4, ease: [0.19, 1, 0.22, 1] }
        }}
      >
        {/* 3D rotation effect container */}
        <div 
          className="hover:rotate-3d-animation h-full"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Image with parallax effect */}
          <div 
            className="overflow-hidden"
            {...longPressProps}
            onDoubleClick={() => setPreviewImage(prize.image)}
            onContextMenu={(e) => {
              e.preventDefault();
              setPreviewImage(prize.image);
            }}
          >
            <motion.img
              src={prize.image}
              alt={prize.name}
              className="w-full h-44 sm:h-48 object-cover transition-transform duration-700 rounded-xl"
              style={{
                filter: "drop-shadow(0 0 32px #9b87f5f7)"
              }}
              whileHover={{
                scale: 1.08,
                transition: { duration: 0.7, ease: [0.19, 1, 0.22, 1] }
              }}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.2 }}
            />
          </div>
          
          {/* Content overlay with staggered animations */}
          <motion.div 
            className="absolute bottom-0 w-full px-4 py-3 bg-gradient-to-t from-purple-900/90 to-transparent"
          >
            <div className="overflow-hidden mb-1">
              <motion.span 
                className="block text-lg text-purple-300 font-bold"
                initial={{ y: "100%" }}
                whileInView={{ y: "0%" }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.5, 
                  delay: 0.2 + 0.05 * index,
                  ease: [0.19, 1, 0.22, 1]
                }}
              >
                {prize.name}
              </motion.span>
            </div>
            
            <div className="overflow-hidden mb-2">
              <motion.span 
                className="block text-sm text-white italic"
                initial={{ y: "100%" }}
                whileInView={{ y: "0%" }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.5,
                  delay: 0.3 + 0.05 * index,
                  ease: [0.19, 1, 0.22, 1] 
                }}
              >
                {prize.description}
              </motion.span>
            </div>
            
            <motion.span 
              className="inline-flex items-center gap-1 text-xs text-cyan-300 font-mono bg-white/10 px-2 py-0.5 rounded-lg"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 + 0.05 * index }}
              whileHover={{ 
                backgroundColor: "rgba(255,255,255,0.2)",
                transition: { duration: 0.2 }
              }}
            >
              <Calendar className="w-3 h-3" /> {prize.date}
            </motion.span>
          </motion.div>
        </div>
        
        {/* Animated border glow effect */}
        <motion.div 
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        >
          <div className="absolute inset-0 rounded-2xl border-4 border-purple-400 neon-border animate-neon-pulse" />
        </motion.div>
      </motion.div>
      
      <ImagePreview 
        isOpen={!!previewImage}
        onClose={closePreview}
        imageUrl={previewImage || ""}
        alt={`${prize.name} preview`}
      />
    </>
  );
};
