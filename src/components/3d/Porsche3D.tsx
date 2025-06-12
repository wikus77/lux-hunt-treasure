
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// M1SSION Logo background
const LogoBackground = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
      <div className="text-6xl md:text-8xl font-orbitron font-bold opacity-10 select-none">
        <span className="text-[#00BFFF]" style={{ 
          textShadow: "0 0 20px rgba(0, 191, 255, 0.3)"
        }}>M1</span>
        <span className="text-white">SSION</span>
      </div>
    </div>
  );
};

// CSS-based 3D Porsche Model
const CSS3DPorsche = () => {
  const [rotation, setRotation] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!isHovered) {
      const interval = setInterval(() => {
        setRotation(prev => prev + 0.5);
      }, 16); // ~60fps

      return () => clearInterval(interval);
    }
  }, [isHovered]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div 
        className="transform-gpu transition-transform duration-200 cursor-pointer"
        style={{ 
          transform: `perspective(1000px) rotateY(${rotation}deg) rotateX(-5deg)`,
          transformStyle: 'preserve-3d'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setRotation(prev => prev + 45)}
      >
        {/* Car Container */}
        <div className="relative" style={{ width: '280px', height: '140px' }}>
          
          {/* Main Car Body */}
          <div 
            className="absolute rounded-lg shadow-2xl"
            style={{
              width: '100%',
              height: '50%',
              top: '25%',
              background: 'linear-gradient(145deg, #0a0a0a, #1a1a1a)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.8), inset 0 2px 4px rgba(255,255,255,0.1)',
              transform: 'translateZ(20px)'
            }}
          />
          
          {/* Car Hood */}
          <div 
            className="absolute rounded-lg"
            style={{
              width: '35%',
              height: '30%',
              top: '20%',
              right: '5%',
              background: 'linear-gradient(145deg, #0a0a0a, #2a2a2a)',
              boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.1)',
              transform: 'translateZ(25px)'
            }}
          />
          
          {/* Car Roof/Cabin */}
          <div 
            className="absolute rounded-lg"
            style={{
              width: '50%',
              height: '25%',
              top: '10%',
              left: '25%',
              background: 'linear-gradient(145deg, #0a0a0a, #2a2a2a)',
              boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.1)',
              transform: 'translateZ(30px)'
            }}
          />
          
          {/* Windshield */}
          <div 
            className="absolute rounded"
            style={{
              width: '40%',
              height: '20%',
              top: '12%',
              left: '30%',
              background: 'linear-gradient(145deg, rgba(100,100,100,0.3), rgba(150,150,150,0.2))',
              backdropFilter: 'blur(1px)',
              transform: 'translateZ(32px)'
            }}
          />
          
          {/* Front Wheels */}
          <div 
            className="absolute rounded-full border-2 border-gray-600"
            style={{
              width: '24px',
              height: '24px',
              bottom: '15%',
              right: '15%',
              background: 'radial-gradient(circle, #333, #111)',
              boxShadow: '0 4px 8px rgba(0,0,0,0.6)',
              transform: 'translateZ(15px)'
            }}
          />
          <div 
            className="absolute rounded-full border-2 border-gray-600"
            style={{
              width: '24px',
              height: '24px',
              bottom: '15%',
              left: '15%',
              background: 'radial-gradient(circle, #333, #111)',
              boxShadow: '0 4px 8px rgba(0,0,0,0.6)',
              transform: 'translateZ(15px)'
            }}
          />
          
          {/* Headlights */}
          <div 
            className="absolute rounded-full"
            style={{
              width: '12px',
              height: '12px',
              top: '35%',
              right: '8%',
              background: 'radial-gradient(circle, #ffffff, #e0e0e0)',
              boxShadow: '0 0 12px rgba(255,255,255,0.8)',
              transform: 'translateZ(26px)'
            }}
          />
          <div 
            className="absolute rounded-full"
            style={{
              width: '12px',
              height: '12px',
              bottom: '35%',
              right: '8%',
              background: 'radial-gradient(circle, #ffffff, #e0e0e0)',
              boxShadow: '0 0 12px rgba(255,255,255,0.8)',
              transform: 'translateZ(26px)'
            }}
          />
          
          {/* Taillights */}
          <div 
            className="absolute rounded-full"
            style={{
              width: '8px',
              height: '8px',
              top: '40%',
              left: '5%',
              background: 'radial-gradient(circle, #ff4444, #cc0000)',
              boxShadow: '0 0 8px rgba(255,68,68,0.6)',
              transform: 'translateZ(22px)'
            }}
          />
          <div 
            className="absolute rounded-full"
            style={{
              width: '8px',
              height: '8px',
              bottom: '40%',
              left: '5%',
              background: 'radial-gradient(circle, #ff4444, #cc0000)',
              boxShadow: '0 0 8px rgba(255,68,68,0.6)',
              transform: 'translateZ(22px)'
            }}
          />
          
          {/* Side Mirrors */}
          <div 
            className="absolute rounded"
            style={{
              width: '6px',
              height: '4px',
              top: '25%',
              right: '20%',
              background: '#1a1a1a',
              transform: 'translateZ(35px)'
            }}
          />
          <div 
            className="absolute rounded"
            style={{
              width: '6px',
              height: '4px',
              bottom: '25%',
              right: '20%',
              background: '#1a1a1a',
              transform: 'translateZ(35px)'
            }}
          />
          
          {/* Ground Shadow */}
          <div 
            className="absolute rounded-full opacity-30"
            style={{
              width: '120%',
              height: '20px',
              bottom: '-10px',
              left: '-10%',
              background: 'radial-gradient(ellipse, rgba(0,0,0,0.6), transparent)',
              transform: 'translateZ(-10px)'
            }}
          />
          
        </div>
      </div>
    </div>
  );
};

// Fallback static image
const StaticPorsche = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="relative" style={{ width: '200px', height: '100px' }}>
        {/* Simplified static car silhouette */}
        <div 
          className="absolute bg-black rounded-lg shadow-2xl"
          style={{
            width: '100%',
            height: '40%',
            top: '30%',
            background: 'linear-gradient(145deg, #0a0a0a, #1a1a1a)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.8)'
          }}
        />
        <div 
          className="absolute bg-black rounded-lg"
          style={{
            width: '60%',
            height: '25%',
            top: '15%',
            left: '20%',
            background: 'linear-gradient(145deg, #0a0a0a, #2a2a2a)'
          }}
        />
        <div 
          className="absolute bg-gray-800 rounded-full border border-gray-600"
          style={{
            width: '20px',
            height: '20px',
            bottom: '10%',
            left: '15%',
            background: 'radial-gradient(circle, #333, #111)'
          }}
        />
        <div 
          className="absolute bg-gray-800 rounded-full border border-gray-600"
          style={{
            width: '20px',
            height: '20px',
            bottom: '10%',
            right: '15%',
            background: 'radial-gradient(circle, #333, #111)'
          }}
        />
        <div 
          className="absolute bg-white rounded-full"
          style={{
            width: '8px',
            height: '8px',
            top: '40%',
            right: '5%',
            boxShadow: '0 0 10px rgba(255,255,255,0.8)'
          }}
        />
      </div>
    </div>
  );
};

interface Porsche3DProps {
  className?: string;
}

const Porsche3D: React.FC<Porsche3DProps> = ({ className = "" }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Simulate loading time and check for 3D support
    const timer = setTimeout(() => {
      try {
        // Test CSS 3D support
        const testElement = document.createElement('div');
        testElement.style.transform = 'perspective(1px) translateZ(0)';
        setIsLoaded(true);
      } catch (err) {
        setError(true);
        setIsLoaded(true);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (!isLoaded) {
    return (
      <div className={`relative w-full h-full bg-black/30 ${className}`}>
        <LogoBackground />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white/70 text-sm">Caricamento 3D...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      <LogoBackground />
      
      <motion.div 
        className="w-full h-full"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {error ? <StaticPorsche /> : <CSS3DPorsche />}
      </motion.div>
    </div>
  );
};

export default Porsche3D;
