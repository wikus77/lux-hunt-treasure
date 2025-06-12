
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

// Enhanced CSS-based 3D Porsche 992.1 Turbo Model
const CSS3DPorsche = () => {
  const [rotation, setRotation] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!isHovered) {
      const interval = setInterval(() => {
        setRotation(prev => prev + 0.3);
      }, 16); // ~60fps

      return () => clearInterval(interval);
    }
  }, [isHovered]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div 
        className="transform-gpu transition-transform duration-300 cursor-pointer"
        style={{ 
          transform: `perspective(1200px) rotateY(${rotation}deg) rotateX(-8deg)`,
          transformStyle: 'preserve-3d'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setRotation(prev => prev + 45)}
      >
        {/* Car Container - Porsche 992.1 Turbo proportions */}
        <div className="relative" style={{ width: '320px', height: '160px' }}>
          
          {/* Main Car Body - Lower and wider for Turbo look */}
          <div 
            className="absolute rounded-lg shadow-2xl"
            style={{
              width: '100%',
              height: '45%',
              top: '30%',
              background: 'linear-gradient(145deg, #0a0a0a, #1a1a1a, #0a0a0a)',
              boxShadow: '0 15px 50px rgba(0,0,0,0.9), inset 0 3px 6px rgba(255,255,255,0.1)',
              transform: 'translateZ(25px)',
              borderRadius: '8px 8px 12px 12px'
            }}
          />
          
          {/* Porsche distinctive front - longer hood */}
          <div 
            className="absolute rounded-lg"
            style={{
              width: '40%',
              height: '28%',
              top: '22%',
              right: '3%',
              background: 'linear-gradient(145deg, #0a0a0a, #2a2a2a, #0a0a0a)',
              boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.1)',
              transform: 'translateZ(30px)',
              borderRadius: '6px 4px 8px 8px'
            }}
          />
          
          {/* Porsche cabin - characteristic sloped roofline */}
          <div 
            className="absolute rounded-lg"
            style={{
              width: '45%',
              height: '22%',
              top: '12%',
              left: '28%',
              background: 'linear-gradient(145deg, #0a0a0a, #2a2a2a)',
              boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.1)',
              transform: 'translateZ(35px)',
              borderRadius: '6px 6px 4px 4px'
            }}
          />
          
          {/* Windshield - Porsche style */}
          <div 
            className="absolute rounded"
            style={{
              width: '35%',
              height: '18%',
              top: '14%',
              left: '32%',
              background: 'linear-gradient(145deg, rgba(80,80,80,0.4), rgba(120,120,120,0.3))',
              backdropFilter: 'blur(1px)',
              transform: 'translateZ(37px)',
              borderRadius: '4px 4px 2px 2px'
            }}
          />
          
          {/* Turbo wheels - larger and more detailed */}
          <div 
            className="absolute rounded-full border-2 border-gray-500"
            style={{
              width: '28px',
              height: '28px',
              bottom: '12%',
              right: '12%',
              background: 'radial-gradient(circle, #444, #111, #222)',
              boxShadow: '0 6px 12px rgba(0,0,0,0.8), inset 0 2px 4px rgba(255,255,255,0.2)',
              transform: 'translateZ(18px)'
            }}
          >
            {/* Rim detail */}
            <div className="absolute inset-2 rounded-full border border-gray-400 bg-gradient-to-r from-gray-600 to-gray-800"></div>
          </div>
          <div 
            className="absolute rounded-full border-2 border-gray-500"
            style={{
              width: '28px',
              height: '28px',
              bottom: '12%',
              left: '12%',
              background: 'radial-gradient(circle, #444, #111, #222)',
              boxShadow: '0 6px 12px rgba(0,0,0,0.8), inset 0 2px 4px rgba(255,255,255,0.2)',
              transform: 'translateZ(18px)'
            }}
          >
            {/* Rim detail */}
            <div className="absolute inset-2 rounded-full border border-gray-400 bg-gradient-to-r from-gray-600 to-gray-800"></div>
          </div>
          
          {/* Distinctive Porsche headlights - LED style */}
          <div 
            className="absolute rounded-full"
            style={{
              width: '16px',
              height: '12px',
              top: '35%',
              right: '6%',
              background: 'radial-gradient(ellipse, #ffffff, #f0f0f0)',
              boxShadow: '0 0 15px rgba(255,255,255,0.9), 0 0 8px rgba(200,200,255,0.6)',
              transform: 'translateZ(32px)',
              borderRadius: '50% 30%'
            }}
          />
          <div 
            className="absolute rounded-full"
            style={{
              width: '16px',
              height: '12px',
              bottom: '35%',
              right: '6%',
              background: 'radial-gradient(ellipse, #ffffff, #f0f0f0)',
              boxShadow: '0 0 15px rgba(255,255,255,0.9), 0 0 8px rgba(200,200,255,0.6)',
              transform: 'translateZ(32px)',
              borderRadius: '50% 30%'
            }}
          />
          
          {/* Porsche taillights - distinctive design */}
          <div 
            className="absolute rounded"
            style={{
              width: '12px',
              height: '10px',
              top: '38%',
              left: '3%',
              background: 'radial-gradient(ellipse, #ff4444, #cc0000)',
              boxShadow: '0 0 10px rgba(255,68,68,0.7)',
              transform: 'translateZ(27px)',
              borderRadius: '40%'
            }}
          />
          <div 
            className="absolute rounded"
            style={{
              width: '12px',
              height: '10px',
              bottom: '38%',
              left: '3%',
              background: 'radial-gradient(ellipse, #ff4444, #cc0000)',
              boxShadow: '0 0 10px rgba(255,68,68,0.7)',
              transform: 'translateZ(27px)',
              borderRadius: '40%'
            }}
          />
          
          {/* Side mirrors - Porsche style */}
          <div 
            className="absolute rounded"
            style={{
              width: '8px',
              height: '5px',
              top: '22%',
              right: '18%',
              background: '#1a1a1a',
              transform: 'translateZ(40px)',
              borderRadius: '3px'
            }}
          />
          <div 
            className="absolute rounded"
            style={{
              width: '8px',
              height: '5px',
              bottom: '22%',
              right: '18%',
              background: '#1a1a1a',
              transform: 'translateZ(40px)',
              borderRadius: '3px'
            }}
          />
          
          {/* Turbo air intakes */}
          <div 
            className="absolute rounded"
            style={{
              width: '6px',
              height: '8px',
              top: '45%',
              right: '25%',
              background: 'linear-gradient(90deg, #000, #333)',
              transform: 'translateZ(28px)',
              borderRadius: '2px'
            }}
          />
          <div 
            className="absolute rounded"
            style={{
              width: '6px',
              height: '8px',
              bottom: '45%',
              right: '25%',
              background: 'linear-gradient(90deg, #000, #333)',
              transform: 'translateZ(28px)',
              borderRadius: '2px'
            }}
          />
          
          {/* Enhanced ground shadow with showroom effect */}
          <div 
            className="absolute rounded-full opacity-40"
            style={{
              width: '140%',
              height: '25px',
              bottom: '-15px',
              left: '-20%',
              background: 'radial-gradient(ellipse, rgba(0,0,0,0.8), rgba(0,0,0,0.3), transparent)',
              transform: 'translateZ(-15px)',
              filter: 'blur(8px)'
            }}
          />
          
          {/* Showroom floor reflection */}
          <div 
            className="absolute rounded-full opacity-20"
            style={{
              width: '120%',
              height: '15px',
              bottom: '-8px',
              left: '-10%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
              transform: 'translateZ(-5px)'
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
      <div className="relative" style={{ width: '240px', height: '120px' }}>
        {/* Simplified static car silhouette */}
        <div 
          className="absolute bg-black rounded-lg shadow-2xl"
          style={{
            width: '100%',
            height: '40%',
            top: '30%',
            background: 'linear-gradient(145deg, #0a0a0a, #1a1a1a)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.8)'
          }}
        />
        <div 
          className="absolute bg-black rounded-lg"
          style={{
            width: '55%',
            height: '25%',
            top: '15%',
            left: '22%',
            background: 'linear-gradient(145deg, #0a0a0a, #2a2a2a)'
          }}
        />
        {/* Wheels */}
        <div 
          className="absolute bg-gray-800 rounded-full border border-gray-600"
          style={{
            width: '24px',
            height: '24px',
            bottom: '8%',
            left: '12%',
            background: 'radial-gradient(circle, #333, #111)'
          }}
        />
        <div 
          className="absolute bg-gray-800 rounded-full border border-gray-600"
          style={{
            width: '24px',
            height: '24px',
            bottom: '8%',
            right: '12%',
            background: 'radial-gradient(circle, #333, #111)'
          }}
        />
        {/* Headlight */}
        <div 
          className="absolute bg-white rounded-full"
          style={{
            width: '10px',
            height: '8px',
            top: '40%',
            right: '5%',
            boxShadow: '0 0 12px rgba(255,255,255,0.8)'
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
      <div className={`relative w-full h-full bg-gradient-to-b from-gray-900 to-black ${className}`}>
        <LogoBackground />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white/70 text-sm">Caricamento showroom...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full bg-gradient-to-b from-gray-900 to-black ${className}`}>
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
