
import React from "react";
import { motion } from "framer-motion";

interface BlackHoleCenterProps {
  stage: number;
}

const BlackHoleCenter: React.FC<BlackHoleCenterProps> = ({ stage }) => {
  return (
    <>
      {/* Central black hole */}
      <motion.div
        style={{
          position: 'absolute',
          width: stage >= 3 ? '40px' : '20px',
          height: stage >= 3 ? '40px' : '20px',
          borderRadius: '50%',
          backgroundColor: '#000',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          boxShadow: '0 0 20px 10px rgba(0, 0, 0, 0.9)',
          zIndex: 4
        }}
        animate={{
          width: stage >= 2 ? '40px' : '20px',
          height: stage >= 2 ? '40px' : '20px',
        }}
        transition={{ duration: 0.5 }}
      />
      
      {/* Accretion disk */}
      <motion.div
        style={{
          position: 'absolute',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 191, 255, 0.7) 0%, rgba(0, 191, 255, 0.3) 40%, rgba(0, 0, 0, 0) 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          filter: 'blur(5px)',
          boxShadow: '0 0 30px rgba(0, 191, 255, 0.5), 0 0 60px rgba(0, 191, 255, 0.3), 0 0 90px rgba(0, 191, 255, 0.2)',
          zIndex: 3,
          opacity: stage <= 3 ? 1 : 0,
          transition: 'opacity 0.5s ease-in-out'
        }}
      />
    </>
  );
};

export default BlackHoleCenter;
