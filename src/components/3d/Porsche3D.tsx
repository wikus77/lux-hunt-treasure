
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// M1SSION Logo background
const LogoBackground = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
      <div className="text-6xl md:text-8xl font-orbitron font-bold opacity-15 select-none">
        <span className="text-[#00BFFF]" style={{ 
          textShadow: "0 0 20px rgba(0, 191, 255, 0.4)"
        }}>M1</span>
        <span className="text-white">SSION</span>
      </div>
    </div>
  );
};

// Enhanced CSS-based 3D Porsche 992.1 Turbo - Black Edition Showroom
const CSS3DPorsche = () => {
  const [rotation, setRotation] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!isHovered) {
      const interval = setInterval(() => {
        setRotation(prev => prev + 0.2);
      }, 16); // ~60fps

      return () => clearInterval(interval);
    }
  }, [isHovered]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Red carpet base */}
      <div 
        className="absolute bottom-0 w-full h-8"
        style={{
          background: 'linear-gradient(90deg, #8B0000, #DC143C, #8B0000)',
          borderRadius: '2px',
          transform: 'perspective(800px) rotateX(85deg)',
          transformOrigin: 'bottom',
          boxShadow: '0 -2px 10px rgba(220, 20, 60, 0.3)'
        }}
      />
      
      <div 
        className="transform-gpu transition-transform duration-300 cursor-pointer"
        style={{ 
          transform: `perspective(1200px) rotateY(${rotation}deg) rotateX(-5deg)`,
          transformStyle: 'preserve-3d'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setRotation(prev => prev + 45)}
      >
        {/* Car Container - Porsche 992.1 Turbo Black Edition */}
        <div className="relative" style={{ width: '340px', height: '170px' }}>
          
          {/* Main Car Body - Lower, wider, more aggressive for 992.1 Turbo */}
          <div 
            className="absolute rounded-lg shadow-2xl"
            style={{
              width: '100%',
              height: '48%',
              top: '28%',
              background: 'linear-gradient(145deg, #000000, #1a1a1a, #000000)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.9), inset 0 4px 8px rgba(255,255,255,0.15), 0 0 30px rgba(255,255,255,0.1)',
              transform: 'translateZ(25px)',
              borderRadius: '10px 10px 14px 14px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          />
          
          {/* Porsche distinctive front - longer, more aggressive */}
          <div 
            className="absolute rounded-lg"
            style={{
              width: '42%',
              height: '32%',
              top: '18%',
              right: '2%',
              background: 'linear-gradient(145deg, #000000, #2a2a2a, #000000)',
              boxShadow: 'inset 0 3px 6px rgba(255,255,255,0.15), 0 8px 25px rgba(0,0,0,0.8)',
              transform: 'translateZ(30px)',
              borderRadius: '8px 6px 10px 10px',
              border: '1px solid rgba(255,255,255,0.08)'
            }}
          />
          
          {/* Porsche cabin - characteristic sloped roofline 992.1 */}
          <div 
            className="absolute rounded-lg"
            style={{
              width: '48%',
              height: '26%',
              top: '8%',
              left: '26%',
              background: 'linear-gradient(145deg, #000000, #2a2a2a)',
              boxShadow: 'inset 0 3px 6px rgba(255,255,255,0.12), 0 6px 20px rgba(0,0,0,0.7)',
              transform: 'translateZ(35px)',
              borderRadius: '8px 8px 6px 6px',
              border: '1px solid rgba(255,255,255,0.06)'
            }}
          />
          
          {/* Windshield - Porsche style with reflection */}
          <div 
            className="absolute rounded"
            style={{
              width: '38%',
              height: '22%',
              top: '10%',
              left: '30%',
              background: 'linear-gradient(145deg, rgba(100,100,100,0.6), rgba(160,160,160,0.4))',
              backdropFilter: 'blur(1px)',
              transform: 'translateZ(37px)',
              borderRadius: '6px 6px 3px 3px',
              boxShadow: '0 0 15px rgba(255,255,255,0.2)'
            }}
          />
          
          {/* Turbo wheels - larger, more detailed, black rims */}
          <div 
            className="absolute rounded-full border-2 border-gray-700"
            style={{
              width: '32px',
              height: '32px',
              bottom: '8%',
              right: '10%',
              background: 'radial-gradient(circle, #222, #000, #111)',
              boxShadow: '0 8px 16px rgba(0,0,0,0.9), inset 0 3px 6px rgba(255,255,255,0.25)',
              transform: 'translateZ(18px)'
            }}
          >
            {/* Rim detail - Black sport rims */}
            <div className="absolute inset-2 rounded-full border border-gray-600 bg-gradient-to-r from-gray-700 to-gray-900"></div>
            <div className="absolute inset-3 rounded-full bg-black border border-gray-500"></div>
          </div>
          <div 
            className="absolute rounded-full border-2 border-gray-700"
            style={{
              width: '32px',
              height: '32px',
              bottom: '8%',
              left: '10%',
              background: 'radial-gradient(circle, #222, #000, #111)',
              boxShadow: '0 8px 16px rgba(0,0,0,0.9), inset 0 3px 6px rgba(255,255,255,0.25)',
              transform: 'translateZ(18px)'
            }}
          >
            {/* Rim detail - Black sport rims */}
            <div className="absolute inset-2 rounded-full border border-gray-600 bg-gradient-to-r from-gray-700 to-gray-900"></div>
            <div className="absolute inset-3 rounded-full bg-black border border-gray-500"></div>
          </div>
          
          {/* Distinctive Porsche headlights - Modern LED style */}
          <div 
            className="absolute rounded-full"
            style={{
              width: '18px',
              height: '14px',
              top: '32%',
              right: '4%',
              background: 'radial-gradient(ellipse, #ffffff, #f8f8f8)',
              boxShadow: '0 0 20px rgba(255,255,255,0.95), 0 0 12px rgba(200,200,255,0.8)',
              transform: 'translateZ(32px)',
              borderRadius: '60% 40%'
            }}
          />
          <div 
            className="absolute rounded-full"
            style={{
              width: '18px',
              height: '14px',
              bottom: '32%',
              right: '4%',
              background: 'radial-gradient(ellipse, #ffffff, #f8f8f8)',
              boxShadow: '0 0 20px rgba(255,255,255,0.95), 0 0 12px rgba(200,200,255,0.8)',
              transform: 'translateZ(32px)',
              borderRadius: '60% 40%'
            }}
          />
          
          {/* Porsche taillights - Distinctive LED strip design */}
          <div 
            className="absolute rounded"
            style={{
              width: '14px',
              height: '12px',
              top: '35%',
              left: '2%',
              background: 'linear-gradient(90deg, #ff4444, #cc0000)',
              boxShadow: '0 0 15px rgba(255,68,68,0.8)',
              transform: 'translateZ(27px)',
              borderRadius: '50%'
            }}
          />
          <div 
            className="absolute rounded"
            style={{
              width: '14px',
              height: '12px',
              bottom: '35%',
              left: '2%',
              background: 'linear-gradient(90deg, #ff4444, #cc0000)',
              boxShadow: '0 0 15px rgba(255,68,68,0.8)',
              transform: 'translateZ(27px)',
              borderRadius: '50%'
            }}
          />
          
          {/* Side mirrors - Porsche style */}
          <div 
            className="absolute rounded"
            style={{
              width: '10px',
              height: '6px',
              top: '18%',
              right: '16%',
              background: '#000000',
              transform: 'translateZ(40px)',
              borderRadius: '4px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          />
          <div 
            className="absolute rounded"
            style={{
              width: '10px',
              height: '6px',
              bottom: '18%',
              right: '16%',
              background: '#000000',
              transform: 'translateZ(40px)',
              borderRadius: '4px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          />
          
          {/* Turbo air intakes - More prominent */}
          <div 
            className="absolute rounded"
            style={{
              width: '8px',
              height: '12px',
              top: '42%',
              right: '22%',
              background: 'linear-gradient(90deg, #000, #222)',
              transform: 'translateZ(28px)',
              borderRadius: '3px',
              border: '1px solid rgba(255,255,255,0.05)'
            }}
          />
          <div 
            className="absolute rounded"
            style={{
              width: '8px',
              height: '12px',
              bottom: '42%',
              right: '22%',
              background: 'linear-gradient(90deg, #000, #222)',
              transform: 'translateZ(28px)',
              borderRadius: '3px',
              border: '1px solid rgba(255,255,255,0.05)'
            }}
          />
          
          {/* Enhanced ground shadow with showroom lighting */}
          <div 
            className="absolute rounded-full opacity-50"
            style={{
              width: '150%',
              height: '30px',
              bottom: '-20px',
              left: '-25%',
              background: 'radial-gradient(ellipse, rgba(0,0,0,0.9), rgba(0,0,0,0.4), transparent)',
              transform: 'translateZ(-15px)',
              filter: 'blur(10px)'
            }}
          />
          
          {/* Showroom floor reflection with red carpet */}
          <div 
            className="absolute rounded-full opacity-30"
            style={{
              width: '130%',
              height: '20px',
              bottom: '-10px',
              left: '-15%',
              background: 'linear-gradient(90deg, transparent, rgba(220,20,60,0.2), transparent)',
              transform: 'translateZ(-5px)'
            }}
          />
          
          {/* Premium showroom lighting effects */}
          <div 
            className="absolute rounded-full opacity-20"
            style={{
              width: '200%',
              height: '40px',
              top: '-20px',
              left: '-50%',
              background: 'radial-gradient(ellipse, rgba(255,255,255,0.3), transparent)',
              transform: 'translateZ(-10px)',
              filter: 'blur(15px)'
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
      {/* Red carpet */}
      <div 
        className="absolute bottom-0 w-full h-6"
        style={{
          background: 'linear-gradient(90deg, #8B0000, #DC143C, #8B0000)',
          borderRadius: '2px'
        }}
      />
      
      <div className="relative" style={{ width: '280px', height: '140px' }}>
        {/* Simplified static car silhouette - black luxury */}
        <div 
          className="absolute bg-black rounded-lg shadow-2xl border"
          style={{
            width: '100%',
            height: '45%',
            top: '25%',
            background: 'linear-gradient(145deg, #000000, #1a1a1a)',
            boxShadow: '0 15px 50px rgba(0,0,0,0.9)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        />
        <div 
          className="absolute bg-black rounded-lg"
          style={{
            width: '60%',
            height: '30%',
            top: '10%',
            left: '20%',
            background: 'linear-gradient(145deg, #000000, #2a2a2a)',
            border: '1px solid rgba(255,255,255,0.08)'
          }}
        />
        {/* Wheels - Black sport rims */}
        <div 
          className="absolute bg-gray-900 rounded-full border-2 border-gray-700"
          style={{
            width: '28px',
            height: '28px',
            bottom: '5%',
            left: '10%',
            background: 'radial-gradient(circle, #222, #000)'
          }}
        />
        <div 
          className="absolute bg-gray-900 rounded-full border-2 border-gray-700"
          style={{
            width: '28px',
            height: '28px',
            bottom: '5%',
            right: '10%',
            background: 'radial-gradient(circle, #222, #000)'
          }}
        />
        {/* Headlight */}
        <div 
          className="absolute bg-white rounded-full"
          style={{
            width: '12px',
            height: '10px',
            top: '35%',
            right: '3%',
            boxShadow: '0 0 15px rgba(255,255,255,0.9)'
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
      <div className={`relative w-full h-full ${className}`} style={{
        background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 50%, #0a0a0a 100%)'
      }}>
        <LogoBackground />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white/70 text-sm">Caricamento showroom...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full ${className}`} style={{
      background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 50%, #0a0a0a 100%)'
    }}>
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
