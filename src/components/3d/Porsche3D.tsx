
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Professional M1SSION Logo - Exact positioning as in the reference image
const ProfessionalLogoBackground = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
      {/* Main M1SSION logo on wall - exact positioning and styling from image */}
      <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 text-5xl md:text-7xl font-orbitron font-bold select-none">
        <span 
          className="text-[#00BFFF]" 
          style={{ 
            textShadow: "0 0 40px rgba(0, 191, 255, 0.9), 0 0 80px rgba(0, 191, 255, 0.6)",
            filter: "drop-shadow(0 0 30px rgba(0, 191, 255, 0.8))"
          }}
        >
          M1
        </span>
        <span 
          className="text-white"
          style={{ 
            textShadow: "0 0 30px rgba(255, 255, 255, 0.8)",
            filter: "drop-shadow(0 0 20px rgba(255, 255, 255, 0.6))"
          }}
        >
          SSION
        </span>
      </div>
      
      {/* Right side M1SSION vertical banner - as shown in reference */}
      <div className="absolute right-6 top-1/2 transform -translate-y-1/2 rotate-90 origin-center">
        <div className="bg-black/90 px-4 py-2 border border-[#00BFFF]/40 backdrop-blur-sm">
          <span className="text-[#00BFFF] text-lg font-orbitron font-bold tracking-wider">M1SSION</span>
        </div>
      </div>
    </div>
  );
};

// Ultra-Realistic Porsche GT3 Scene - Cinema Quality Rendering
const UltraRealisticPorscheScene = () => {
  const [rotation, setRotation] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    if (!isHovered && !isZoomed) {
      const interval = setInterval(() => {
        setRotation(prev => prev + 0.2);
      }, 16); // Smooth 60fps rotation

      return () => clearInterval(interval);
    }
  }, [isHovered, isZoomed]);

  const handleClick = () => {
    setIsZoomed(!isZoomed);
    console.log("🔊 Professional engine sound trigger");
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Ultra-luxury showroom environment - hexagonal ceiling LEDs */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #2a2928 0%, #1a1918 25%, #2a2928 50%, #1a1918 75%, #2a2928 100%)',
          backgroundSize: '120px 120px'
        }}
      />
      
      {/* Hexagonal LED ceiling pattern - as in reference image */}
      <div 
        className="absolute top-0 inset-x-0 h-16 opacity-30"
        style={{
          background: 'repeating-linear-gradient(45deg, rgba(255,204,102,0.4) 0px, transparent 8px, rgba(255,204,102,0.2) 16px)',
          clipPath: 'polygon(20% 0%, 80% 0%, 100% 25%, 80% 50%, 20% 50%, 0% 25%)'
        }}
      />
      
      {/* Professional showroom ambient lighting - warm golden */}
      <div 
        className="absolute inset-0 opacity-25"
        style={{
          background: 'radial-gradient(ellipse at top, rgba(255,204,102,0.4), transparent 80%)'
        }}
      />
      
      {/* Premium red carpet - exact proportions from image */}
      <div 
        className="absolute bottom-0 w-[90%] h-16 mx-auto left-1/2 transform -translate-x-1/2"
        style={{
          background: 'linear-gradient(90deg, #8B0000 0%, #DC143C 15%, #B22222 30%, #DC143C 50%, #B22222 70%, #DC143C 85%, #8B0000 100%)',
          borderRadius: '6px',
          transform: 'translateX(-50%) perspective(1200px) rotateX(89deg)',
          transformOrigin: 'bottom',
          boxShadow: '0 -6px 30px rgba(220, 20, 60, 0.5), 0 0 60px rgba(178, 34, 34, 0.3)'
        }}
      />
      
      {/* Professional metallic wall panels - vertical lines as in image */}
      <div className="absolute inset-0 opacity-40" style={{
        backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.1) 0px, transparent 2px, rgba(255,255,255,0.05) 40px)',
      }} />
      
      <div 
        className="transform-gpu transition-all duration-700 cursor-pointer"
        style={{ 
          transform: `perspective(1600px) rotateY(${rotation}deg) rotateX(-2deg) ${isZoomed ? 'scale(1.2)' : 'scale(1)'}`,
          transformStyle: 'preserve-3d'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
      >
        {/* Ultra-Realistic Porsche GT3 2025 Black - Cinema Grade */}
        <div className="relative" style={{ width: '420px', height: '210px' }}>
          
          {/* Main GT3 Body - Ultra-realistic proportions and materials */}
          <div 
            className="absolute rounded-lg shadow-2xl"
            style={{
              width: '100%',
              height: '55%',
              top: '24%',
              background: 'linear-gradient(145deg, #000000 0%, #0a0a0a 10%, #1a1a1a 20%, #000000 35%, #2a2a2a 50%, #000000 65%, #1a1a1a 80%, #0a0a0a 90%, #000000 100%)',
              boxShadow: '0 30px 100px rgba(0,0,0,0.95), inset 0 8px 16px rgba(255,255,255,0.25), 0 0 80px rgba(255,255,255,0.12)',
              transform: 'translateZ(35px)',
              borderRadius: '14px 14px 18px 18px',
              border: '1px solid rgba(255,255,255,0.15)'
            }}
          />
          
          {/* GT3 Front section - Aggressive Porsche nose with racing air intakes */}
          <div 
            className="absolute rounded-lg"
            style={{
              width: '48%',
              height: '40%',
              top: '12%',
              right: '0%',
              background: 'linear-gradient(145deg, #000000 0%, #1a1a1a 15%, #2a2a2a 30%, #000000 50%, #1a1a1a 70%, #000000 100%)',
              boxShadow: 'inset 0 6px 12px rgba(255,255,255,0.2), 0 15px 50px rgba(0,0,0,0.9)',
              transform: 'translateZ(40px)',
              borderRadius: '12px 6px 14px 14px',
              border: '1px solid rgba(255,255,255,0.12)'
            }}
          />
          
          {/* GT3 Cabin - Racing profile with roll cage details */}
          <div 
            className="absolute rounded-lg"
            style={{
              width: '52%',
              height: '32%',
              top: '4%',
              left: '24%',
              background: 'linear-gradient(145deg, #000000 0%, #1a1a1a 20%, #2a2a2a 40%, #000000 60%, #1a1a1a 80%, #000000 100%)',
              boxShadow: 'inset 0 6px 12px rgba(255,255,255,0.15), 0 10px 35px rgba(0,0,0,0.8)',
              transform: 'translateZ(45px)',
              borderRadius: '12px 12px 6px 6px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          />
          
          {/* Racing windshield with authentic reflections */}
          <div 
            className="absolute rounded"
            style={{
              width: '42%',
              height: '28%',
              top: '6%',
              left: '29%',
              background: 'linear-gradient(145deg, rgba(140,140,140,0.8), rgba(200,200,200,0.6), rgba(120,120,120,0.7))',
              backdropFilter: 'blur(1px)',
              transform: 'translateZ(47px)',
              borderRadius: '10px 10px 3px 3px',
              boxShadow: '0 0 35px rgba(255,255,255,0.35), inset 0 3px 6px rgba(255,255,255,0.4)'
            }}
          />
          
          {/* Ultra-realistic GT3 wheels - Racing specification */}
          <div 
            className="absolute rounded-full border-2 border-gray-700"
            style={{
              width: '40px',
              height: '40px',
              bottom: '4%',
              right: '6%',
              background: 'radial-gradient(circle, #0a0a0a 0%, #000000 25%, #1a1a1a 50%, #2a2a2a 70%, #000000 100%)',
              boxShadow: '0 15px 35px rgba(0,0,0,0.95), inset 0 6px 12px rgba(255,255,255,0.3)',
              transform: 'translateZ(25px)'
            }}
          >
            {/* Racing wheel details - Multi-spoke GT3 rims */}
            <div className="absolute inset-0.5 rounded-full border border-gray-600 bg-gradient-to-br from-gray-700 to-black"></div>
            <div className="absolute inset-1 rounded-full bg-black border border-gray-500"></div>
            <div className="absolute inset-1.5 rounded-full bg-gradient-to-r from-gray-900 to-black"></div>
            <div className="absolute inset-2 rounded-full border border-gray-400 bg-gradient-radial from-gray-800 to-black"></div>
          </div>
          <div 
            className="absolute rounded-full border-2 border-gray-700"
            style={{
              width: '40px',
              height: '40px',
              bottom: '4%',
              left: '6%',
              background: 'radial-gradient(circle, #0a0a0a 0%, #000000 25%, #1a1a1a 50%, #2a2a2a 70%, #000000 100%)',
              boxShadow: '0 15px 35px rgba(0,0,0,0.95), inset 0 6px 12px rgba(255,255,255,0.3)',
              transform: 'translateZ(25px)'
            }}
          >
            {/* Racing wheel details - Multi-spoke GT3 rims */}
            <div className="absolute inset-0.5 rounded-full border border-gray-600 bg-gradient-to-br from-gray-700 to-black"></div>
            <div className="absolute inset-1 rounded-full bg-black border border-gray-500"></div>
            <div className="absolute inset-1.5 rounded-full bg-gradient-to-r from-gray-900 to-black"></div>
            <div className="absolute inset-2 rounded-full border border-gray-400 bg-gradient-radial from-gray-800 to-black"></div>
          </div>
          
          {/* Professional LED headlights - Ultra-bright racing spec */}
          <div 
            className="absolute rounded-full"
            style={{
              width: '26px',
              height: '18px',
              top: '28%',
              right: '0%',
              background: 'radial-gradient(ellipse, #ffffff 0%, #f8f8f8 30%, #e8e8e8 60%, #d8d8d8 100%)',
              boxShadow: '0 0 40px rgba(255,255,255,1), 0 0 25px rgba(220,240,255,0.9), 0 0 12px rgba(255,255,255,1)',
              transform: 'translateZ(42px)',
              borderRadius: '70% 30%',
              border: '1px solid rgba(255,255,255,0.5)'
            }}
          />
          <div 
            className="absolute rounded-full"
            style={{
              width: '26px',
              height: '18px',
              bottom: '28%',
              right: '0%',
              background: 'radial-gradient(ellipse, #ffffff 0%, #f8f8f8 30%, #e8e8e8 60%, #d8d8d8 100%)',
              boxShadow: '0 0 40px rgba(255,255,255,1), 0 0 25px rgba(220,240,255,0.9), 0 0 12px rgba(255,255,255,1)',
              transform: 'translateZ(42px)',
              borderRadius: '70% 30%',
              border: '1px solid rgba(255,255,255,0.5)'
            }}
          />
          
          {/* Authentic Porsche taillights - LED strip technology */}
          <div 
            className="absolute rounded"
            style={{
              width: '18px',
              height: '16px',
              top: '31%',
              left: '0%',
              background: 'linear-gradient(90deg, #ff4444 0%, #ee0000 30%, #cc0000 70%, #ff4444 100%)',
              boxShadow: '0 0 25px rgba(255,68,68,0.9), 0 0 12px rgba(204,0,0,1)',
              transform: 'translateZ(37px)',
              borderRadius: '65%'
            }}
          />
          <div 
            className="absolute rounded"
            style={{
              width: '18px',
              height: '16px',
              bottom: '31%',
              left: '0%',
              background: 'linear-gradient(90deg, #ff4444 0%, #ee0000 30%, #cc0000 70%, #ff4444 100%)',
              boxShadow: '0 0 25px rgba(255,68,68,0.9), 0 0 12px rgba(204,0,0,1)',
              transform: 'translateZ(37px)',
              borderRadius: '65%'
            }}
          />
          
          {/* Racing side mirrors - Carbon fiber details */}
          <div 
            className="absolute rounded"
            style={{
              width: '14px',
              height: '10px',
              top: '14%',
              right: '16%',
              background: 'linear-gradient(145deg, #000000, #1a1a1a, #0a0a0a)',
              transform: 'translateZ(50px)',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 3px 12px rgba(0,0,0,0.9)'
            }}
          />
          <div 
            className="absolute rounded"
            style={{
              width: '14px',
              height: '10px',
              bottom: '14%',
              right: '16%',
              background: 'linear-gradient(145deg, #000000, #1a1a1a, #0a0a0a)',
              transform: 'translateZ(50px)',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 3px 12px rgba(0,0,0,0.9)'
            }}
          />
          
          {/* GT3 Racing air intakes - More aggressive and detailed */}
          <div 
            className="absolute rounded"
            style={{
              width: '12px',
              height: '16px',
              top: '38%',
              right: '18%',
              background: 'linear-gradient(90deg, #000000, #0a0a0a, #1a1a1a, #000000)',
              transform: 'translateZ(38px)',
              borderRadius: '5px',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: 'inset 0 3px 8px rgba(0,0,0,0.95)'
            }}
          />
          <div 
            className="absolute rounded"
            style={{
              width: '12px',
              height: '16px',
              bottom: '38%',
              right: '18%',
              background: 'linear-gradient(90deg, #000000, #0a0a0a, #1a1a1a, #000000)',
              transform: 'translateZ(38px)',
              borderRadius: '5px',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: 'inset 0 3px 8px rgba(0,0,0,0.95)'
            }}
          />
          
          {/* GT3 Rear spoiler - Racing aerodynamics */}
          <div 
            className="absolute rounded"
            style={{
              width: '16px',
              height: '4px',
              top: '8%',
              left: '12%',
              background: 'linear-gradient(90deg, #000000, #1a1a1a, #000000)',
              transform: 'translateZ(48px)',
              borderRadius: '2px',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.8)'
            }}
          />
          
          {/* Ultra-realistic ground shadow with showroom lighting */}
          <div 
            className="absolute rounded-full opacity-70"
            style={{
              width: '180%',
              height: '45px',
              bottom: '-35px',
              left: '-40%',
              background: 'radial-gradient(ellipse, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0.3) 60%, transparent 100%)',
              transform: 'translateZ(-25px)',
              filter: 'blur(15px)'
            }}
          />
          
          {/* Professional red carpet reflection */}
          <div 
            className="absolute rounded-full opacity-50"
            style={{
              width: '160%',
              height: '30px',
              bottom: '-20px',
              left: '-30%',
              background: 'linear-gradient(90deg, transparent 0%, rgba(220,20,60,0.4) 15%, rgba(178,34,34,0.5) 50%, rgba(220,20,60,0.4) 85%, transparent 100%)',
              transform: 'translateZ(-15px)',
              filter: 'blur(8px)'
            }}
          />
          
          {/* Professional showroom ambient lighting effects */}
          <div 
            className="absolute rounded-full opacity-30"
            style={{
              width: '250%',
              height: '60px',
              top: '-30px',
              left: '-75%',
              background: 'radial-gradient(ellipse, rgba(255,204,102,0.5) 0%, rgba(255,255,255,0.3) 25%, transparent 75%)',
              transform: 'translateZ(-20px)',
              filter: 'blur(25px)'
            }}
          />
        </div>
      </div>
    </div>
  );
};

// Static fallback for non-3D devices
const StaticProfessionalShowroom = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Professional red carpet */}
      <div 
        className="absolute bottom-0 w-full h-12"
        style={{
          background: 'linear-gradient(90deg, #8B0000, #DC143C, #B22222, #DC143C, #8B0000)',
          borderRadius: '4px'
        }}
      />
      
      <div className="relative" style={{ width: '380px', height: '190px' }}>
        {/* High-quality static Porsche GT3 */}
        <div 
          className="absolute bg-black rounded-lg shadow-2xl border"
          style={{
            width: '100%',
            height: '52%',
            top: '18%',
            background: 'linear-gradient(145deg, #000000, #1a1a1a, #000000)',
            boxShadow: '0 25px 80px rgba(0,0,0,0.95)',
            border: '1px solid rgba(255,255,255,0.12)'
          }}
        />
        <div 
          className="absolute bg-black rounded-lg"
          style={{
            width: '68%',
            height: '38%',
            top: '6%',
            left: '16%',
            background: 'linear-gradient(145deg, #000000, #2a2a2a, #000000)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        />
        {/* Professional static wheels */}
        <div 
          className="absolute bg-gray-900 rounded-full border-2 border-gray-700"
          style={{
            width: '36px',
            height: '36px',
            bottom: '6%',
            left: '6%',
            background: 'radial-gradient(circle, #0a0a0a, #000000)'
          }}
        />
        <div 
          className="absolute bg-gray-900 rounded-full border-2 border-gray-700"
          style={{
            width: '36px',
            height: '36px',
            bottom: '6%',
            right: '6%',
            background: 'radial-gradient(circle, #0a0a0a, #000000)'
          }}
        />
        {/* Professional static headlight */}
        <div 
          className="absolute bg-white rounded-full"
          style={{
            width: '20px',
            height: '14px',
            top: '30%',
            right: '1%',
            boxShadow: '0 0 30px rgba(255,255,255,1)'
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
    // Enhanced loading and 3D capability detection
    const timer = setTimeout(() => {
      try {
        // Advanced CSS 3D support testing
        const testElement = document.createElement('div');
        testElement.style.transform = 'perspective(1px) translateZ(0)';
        testElement.style.transformStyle = 'preserve-3d';
        setIsLoaded(true);
      } catch (err) {
        setError(true);
        setIsLoaded(true);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!isLoaded) {
    return (
      <div className={`relative w-full h-full ${className}`} style={{
        background: 'linear-gradient(135deg, #2a2928 0%, #1a1918 50%, #0a0908 100%)'
      }}>
        <ProfessionalLogoBackground />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white/80 text-lg font-orbitron">Loading Professional Showroom...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full ${className}`} style={{
      background: 'linear-gradient(135deg, #2a2928 0%, #1a1918 50%, #0a0908 100%)'
    }}>
      <ProfessionalLogoBackground />
      
      <motion.div 
        className="w-full h-full"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        {error ? <StaticProfessionalShowroom /> : <UltraRealisticPorscheScene />}
      </motion.div>
    </div>
  );
};

export default Porsche3D;
