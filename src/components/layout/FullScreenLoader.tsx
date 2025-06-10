
import React from 'react';
import { motion } from 'framer-motion';
import { Loader } from 'lucide-react';

interface FullScreenLoaderProps {
  text?: string;
}

const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({ 
  text = "Caricamento..." 
}) => {
  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="mx-auto mb-4"
        >
          <Loader size={48} className="text-[#00D1FF]" />
        </motion.div>
        
        <motion.h2
          className="text-2xl font-bold text-[#00D1FF] mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {text}
        </motion.h2>
        
        <motion.p
          className="text-gray-400 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Non chiudere l'app durante questa operazione
        </motion.p>
        
        <motion.div
          className="mt-6 w-64 h-1 bg-gray-800 rounded-full overflow-hidden mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-[#00D1FF] to-[#7B2EFF] rounded-full"
            animate={{ x: [-256, 256] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default FullScreenLoader;
