
import React from 'react';
import { motion } from 'framer-motion';
import { Loader } from 'lucide-react';

interface FullScreenLoaderProps {
  text?: string;
}

const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({ 
  text = "Caricamento in corso..." 
}) => {
  return (
    <div 
      className="fixed inset-0 z-[9999] bg-[#070818] flex items-center justify-center"
      style={{
        backdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(7, 8, 24, 0.95)'
      }}
    >
      <motion.div
        className="text-center space-y-6 p-8"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="flex justify-center"
        >
          <Loader className="w-12 h-12 text-[#00D1FF]" />
        </motion.div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">
            M1SSION<span className="text-xs align-top">™</span>
          </h2>
          <p className="text-[#00D1FF] font-medium text-lg">
            {text}
          </p>
          <p className="text-gray-400 text-sm">
            Non chiudere l'applicazione
          </p>
        </div>
        
        <motion.div
          className="w-64 h-1 bg-gray-700 rounded-full mx-auto overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-[#00D1FF] to-[#7B2EFF] rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default FullScreenLoader;
