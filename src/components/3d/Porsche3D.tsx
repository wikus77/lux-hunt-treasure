
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// M1SSION Logo background - exact positioning as in the image
const LogoBackground = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
      {/* Wall-mounted M1SSION logo - exact positioning from image */}
      <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 text-4xl md:text-6xl font-orbitron font-bold select-none">
        <span 
          className="text-[#00BFFF]" 
          style={{ 
            textShadow: "0 0 30px rgba(0, 191, 255, 0.8), 0 0 60px rgba(0, 191, 255, 0.4)",
            filter: "drop-shadow(0 0 20px rgba(0, 191, 255, 0.6))"
          }}
        >
          M1
        </span>
        <span 
          className="text-white"
          style={{ 
            textShadow: "0 0 20px rgba(255, 255, 255, 0.6)",
            filter: "drop-shadow(0 0 15px rgba(255, 255, 255, 0.4))"
          }}
        >
          SSION
        </span>
      </div>
      
      {/* Vertical M1SSION banner on the right - as in image */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 rotate-90 origin-center">
        <div className="bg-black/80 px-3 py-1 border border-[#00BFFF]/30 backdrop-blur-sm">
          <span className="text-[#00BFFF] text-sm font-orbitron font-bold tracking-wider">M1SSION</span>
        </div>
      </div>
    </div>
  );
};

// Professional Showroom Scene - Exact replica of the uploaded image
const ProfessionalShowroomScene = () => {
  const [rotation, setRotation] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    if (!isHovered && !isZoomed) {
      const interval = setInterval(() => {
        setRotation(prev => prev + 0.15);
      }, 16); // Smooth 60fps rotation

      return () => clearInterval(interval);
    }
  }, [isHovered, isZoomed]);

  const handleClick = () => {
    setIsZoomed(!isZoomed);
    // Optional: Add engine sound trigger here
    console.log("🔊 Engine sound trigger");
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Luxury showroom floor - metallic panels as in image */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%, #2a2a2a 100%)',
          backgroundSize: '100px 100px'
        }}
      />
      
      {/* Showroom ambient lighting - warm golden tones */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: 'radial-gradient(ellipse at top, rgba(255,204,102,0.3), transparent 70%)'
        }}
      />
      
      {/* Red carpet base - exact position and proportions from image */}
      <div 
        className="absolute bottom-0 w-[85%] h-12 mx-auto left-1/2 transform -translate-x-1/2"
        style={{
          background: 'linear-gradient(90deg, #8B0000 0%, #DC143C 20%, #B22222 50%, #DC143C 80%, #8B0000 100%)',
          borderRadius: '4px',
          transform: 'translateX(-50%) perspective(1000px) rotateX(88deg)',
          transformOrigin: 'bottom',
          boxShadow: '0 -4px 20px rgba(220, 20, 60, 0.4), 0 0 40px rgba(178, 34, 34, 0.2)'
        }}
      />
      
      <div 
        className="transform-gpu transition-all duration-500 cursor-pointer"
        style={{ 
          transform: `perspective(1400px) rotateY(${rotation}deg) rotateX(-3deg) ${isZoomed ? 'scale(1.15)' : 'scale(1)'}`,
          transformStyle: 'preserve-3d'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
      >
        {/* Porsche 992.1 Turbo 2025 Black - Professional Grade Rendering */}
        <div className="relative" style={{ width: '380px', height: '190px' }}>
          
          {/* Main Body - 992.1 Turbo proportions with aggressive stance */}
          <div 
            className="absolute rounded-lg shadow-2xl"
            style={{
              width: '100%',
              height: '52%',
              top: '26%',
              background: 'linear-gradient(145deg, #000000 0%, #1a1a1a 15%, #000000 30%, #2a2a2a 45%, #000000 60%, #1a1a1a 75%, #000000 100%)',
              boxShadow: '0 25px 80px rgba(0,0,0,0.9), inset 0 6px 12px rgba(255,255,255,0.18), 0 0 50px rgba(255,255,255,0.08)',
              transform: 'translateZ(30px)',
              borderRadius: '12px 12px 16px 16px',
              border: '1px solid rgba(255,255,255,0.12)'
            }}
          />
          
          {/* Front section - 992.1 distinctive nose with Turbo air intakes */}
          <div 
            className="absolute rounded-lg"
            style={{
              width: '45%',
              height: '36%',
              top: '16%',
              right: '1%',
              background: 'linear-gradient(145deg, #000000 0%, #2a2a2a 20%, #000000 40%, #1a1a1a 60%, #000000 100%)',
              boxShadow: 'inset 0 4px 8px rgba(255,255,255,0.15), 0 12px 35px rgba(0,0,0,0.8)',
              transform: 'translateZ(35px)',
              borderRadius: '10px 8px 12px 12px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          />
          
          {/* Cabin with 992.1 characteristic roofline */}
          <div 
            className="absolute rounded-lg"
            style={{
              width: '50%',
              height: '28%',
              top: '6%',
              left: '25%',
              background: 'linear-gradient(145deg, #000000 0%, #2a2a2a 30%, #000000 100%)',
              boxShadow: 'inset 0 4px 8px rgba(255,255,255,0.12), 0 8px 25px rgba(0,0,0,0.7)',
              transform: 'translateZ(40px)',
              borderRadius: '10px 10px 8px 8px',
              border: '1px solid rgba(255,255,255,0.08)'
            }}
          />
          
          {/* Windshield with realistic reflection */}
          <div 
            className="absolute rounded"
            style={{
              width: '40%',
              height: '24%',
              top: '8%',
              left: '30%',
              background: 'linear-gradient(145deg, rgba(120,120,120,0.7), rgba(180,180,180,0.5), rgba(100,100,100,0.6))',
              backdropFilter: 'blur(1px)',
              transform: 'translateZ(42px)',
              borderRadius: '8px 8px 4px 4px',
              boxShadow: '0 0 25px rgba(255,255,255,0.25), inset 0 2px 4px rgba(255,255,255,0.3)'
            }}
          />
          
          {/* Professional Turbo wheels - Black with sport details */}
          <div 
            className="absolute rounded-full border-2 border-gray-600"
            style={{
              width: '36px',
              height: '36px',
              bottom: '6%',
              right: '8%',
              background: 'radial-gradient(circle, #1a1a1a 0%, #000000 30%, #2a2a2a 60%, #000000 100%)',
              boxShadow: '0 12px 24px rgba(0,0,0,0.9), inset 0 4px 8px rgba(255,255,255,0.25)',
              transform: 'translateZ(22px)'
            }}
          >
            {/* Turbo rim details */}
            <div className="absolute inset-1 rounded-full border border-gray-500 bg-gradient-to-br from-gray-600 to-gray-900"></div>
            <div className="absolute inset-2 rounded-full bg-black border border-gray-400"></div>
            <div className="absolute inset-3 rounded-full bg-gradient-to-r from-gray-800 to-black"></div>
          </div>
          <div 
            className="absolute rounded-full border-2 border-gray-600"
            style={{
              width: '36px',
              height: '36px',
              bottom: '6%',
              left: '8%',
              background: 'radial-gradient(circle, #1a1a1a 0%, #000000 30%, #2a2a2a 60%, #000000 100%)',
              boxShadow: '0 12px 24px rgba(0,0,0,0.9), inset 0 4px 8px rgba(255,255,255,0.25)',
              transform: 'translateZ(22px)'
            }}
          >
            {/* Turbo rim details */}
            <div className="absolute inset-1 rounded-full border border-gray-500 bg-gradient-to-br from-gray-600 to-gray-900"></div>
            <div className="absolute inset-2 rounded-full bg-black border border-gray-400"></div>
            <div className="absolute inset-3 rounded-full bg-gradient-to-r from-gray-800 to-black"></div>
          </div>
          
          {/* Modern LED headlights - Crystal clear with realistic beam */}
          <div 
            className="absolute rounded-full"
            style={{
              width: '22px',
              height: '16px',
              top: '30%',
              right: '2%',
              background: 'radial-gradient(ellipse, #ffffff 0%, #f8f8f8 40%, #e0e0e0 100%)',
              boxShadow: '0 0 30px rgba(255,255,255,0.95), 0 0 18px rgba(200,220,255,0.8), 0 0 8px rgba(255,255,255,1)',
              transform: 'translateZ(38px)',
              borderRadius: '65% 35%',
              border: '1px solid rgba(255,255,255,0.4)'
            }}
          />
          <div 
            className="absolute rounded-full"
            style={{
              width: '22px',
              height: '16px',
              bottom: '30%',
              right: '2%',
              background: 'radial-gradient(ellipse, #ffffff 0%, #f8f8f8 40%, #e0e0e0 100%)',
              boxShadow: '0 0 30px rgba(255,255,255,0.95), 0 0 18px rgba(200,220,255,0.8), 0 0 8px rgba(255,255,255,1)',
              transform: 'translateZ(38px)',
              borderRadius: '65% 35%',
              border: '1px solid rgba(255,255,255,0.4)'
            }}
          />
          
          {/* Distinctive Porsche taillights - LED strip technology */}
          <div 
            className="absolute rounded"
            style={{
              width: '16px',
              height: '14px',
              top: '33%',
              left: '1%',
              background: 'linear-gradient(90deg, #ff4444 0%, #cc0000 50%, #ff4444 100%)',
              boxShadow: '0 0 20px rgba(255,68,68,0.8), 0 0 8px rgba(204,0,0,0.9)',
              transform: 'translateZ(32px)',
              borderRadius: '60%'
            }}
          />
          <div 
            className="absolute rounded"
            style={{
              width: '16px',
              height: '14px',
              bottom: '33%',
              left: '1%',
              background: 'linear-gradient(90deg, #ff4444 0%, #cc0000 50%, #ff4444 100%)',
              boxShadow: '0 0 20px rgba(255,68,68,0.8), 0 0 8px rgba(204,0,0,0.9)',
              transform: 'translateZ(32px)',
              borderRadius: '60%'
            }}
          />
          
          {/* Professional side mirrors */}
          <div 
            className="absolute rounded"
            style={{
              width: '12px',
              height: '8px',
              top: '16%',
              right: '18%',
              background: 'linear-gradient(145deg, #000000, #1a1a1a)',
              transform: 'translateZ(45px)',
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.8)'
            }}
          />
          <div 
            className="absolute rounded"
            style={{
              width: '12px',
              height: '8px',
              bottom: '16%',
              right: '18%',
              background: 'linear-gradient(145deg, #000000, #1a1a1a)',
              transform: 'translateZ(45px)',
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.8)'
            }}
          />
          
          {/* Turbo air intakes - More pronounced */}
          <div 
            className="absolute rounded"
            style={{
              width: '10px',
              height: '14px',
              top: '40%',
              right: '20%',
              background: 'linear-gradient(90deg, #000000, #1a1a1a, #000000)',
              transform: 'translateZ(33px)',
              borderRadius: '4px',
              border: '1px solid rgba(255,255,255,0.06)',
              boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.9)'
            }}
          />
          <div 
            className="absolute rounded"
            style={{
              width: '10px',
              height: '14px',
              bottom: '40%',
              right: '20%',
              background: 'linear-gradient(90deg, #000000, #1a1a1a, #000000)',
              transform: 'translateZ(33px)',
              borderRadius: '4px',
              border: '1px solid rgba(255,255,255,0.06)',
              boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.9)'
            }}
          />
          
          {/* Professional ground shadow with showroom lighting */}
          <div 
            className="absolute rounded-full opacity-60"
            style={{
              width: '160%',
              height: '35px',
              bottom: '-25px',
              left: '-30%',
              background: 'radial-gradient(ellipse, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.2) 70%, transparent 100%)',
              transform: 'translateZ(-20px)',
              filter: 'blur(12px)'
            }}
          />
          
          {/* Showroom floor reflection on red carpet */}
          <div 
            className="absolute rounded-full opacity-40"
            style={{
              width: '140%',
              height: '25px',
              bottom: '-15px',
              left: '-20%',
              background: 'linear-gradient(90deg, transparent 0%, rgba(220,20,60,0.3) 20%, rgba(178,34,34,0.4) 50%, rgba(220,20,60,0.3) 80%, transparent 100%)',
              transform: 'translateZ(-10px)',
              filter: 'blur(6px)'
            }}
          />
          
          {/* Luxury showroom ambient lighting effects */}
          <div 
            className="absolute rounded-full opacity-25"
            style={{
              width: '220%',
              height: '50px',
              top: '-25px',
              left: '-60%',
              background: 'radial-gradient(ellipse, rgba(255,204,102,0.4) 0%, rgba(255,255,255,0.2) 30%, transparent 70%)',
              transform: 'translateZ(-15px)',
              filter: 'blur(20px)'
            }}
          />
        </div>
      </div>
    </div>
  );
};

// Fallback static version
const StaticPorscheShowroom = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Red carpet */}
      <div 
        className="absolute bottom-0 w-full h-8"
        style={{
          background: 'linear-gradient(90deg, #8B0000, #DC143C, #8B0000)',
          borderRadius: '2px'
        }}
      />
      
      <div className="relative" style={{ width: '320px', height: '160px' }}>
        {/* Simplified static car - professional black */}
        <div 
          className="absolute bg-black rounded-lg shadow-2xl border"
          style={{
            width: '100%',
            height: '50%',
            top: '20%',
            background: 'linear-gradient(145deg, #000000, #1a1a1a)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.9)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        />
        <div 
          className="absolute bg-black rounded-lg"
          style={{
            width: '65%',
            height: '35%',
            top: '8%',
            left: '18%',
            background: 'linear-gradient(145deg, #000000, #2a2a2a)',
            border: '1px solid rgba(255,255,255,0.08)'
          }}
        />
        {/* Professional wheels */}
        <div 
          className="absolute bg-gray-900 rounded-full border-2 border-gray-600"
          style={{
            width: '32px',
            height: '32px',
            bottom: '8%',
            left: '8%',
            background: 'radial-gradient(circle, #1a1a1a, #000000)'
          }}
        />
        <div 
          className="absolute bg-gray-900 rounded-full border-2 border-gray-600"
          style={{
            width: '32px',
            height: '32px',
            bottom: '8%',
            right: '8%',
            background: 'radial-gradient(circle, #1a1a1a, #000000)'
          }}
        />
        {/* Professional headlight */}
        <div 
          className="absolute bg-white rounded-full"
          style={{
            width: '16px',
            height: '12px',
            top: '32%',
            right: '2%',
            boxShadow: '0 0 20px rgba(255,255,255,0.9)'
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
    // Simulate loading and check 3D support
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
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  if (!isLoaded) {
    return (
      <div className={`relative w-full h-full ${className}`} style={{
        background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 50%, #0a0a0a 100%)'
      }}>
        <LogoBackground />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white/70 text-sm font-orbitron">Loading Showroom...</div>
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
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.0, ease: "easeOut" }}
      >
        {error ? <StaticPorscheShowroom /> : <ProfessionalShowroomScene />}
      </motion.div>
    </div>
  );
};

export default Porsche3D;
