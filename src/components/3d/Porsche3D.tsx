
import React, { useRef, useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';

// Dynamic imports for 3D libraries to handle potential loading issues
const Canvas = React.lazy(() => import('@react-three/fiber').then(module => ({ default: module.Canvas })));
const useFrame = React.lazy(() => import('@react-three/fiber').then(module => ({ default: module.useFrame })));

// Simple 3D car component that will be dynamically loaded
const PorscheModel = () => {
  const groupRef = useRef<any>(null);
  const [hovered, setHovered] = useState(false);

  // This will be handled by the Canvas wrapper
  return (
    <group 
      ref={groupRef}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      scale={hovered ? 1.1 : 1}
    >
      {/* Car body - main chassis */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[4, 1, 1.8]} />
        <meshPhysicalMaterial 
          color={0x0a0a0a}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      
      {/* Car hood */}
      <mesh position={[1.5, 0.5, 0]}>
        <boxGeometry args={[1, 0.4, 1.6]} />
        <meshPhysicalMaterial 
          color={0x0a0a0a}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      
      {/* Car roof/cabin */}
      <mesh position={[-0.5, 1, 0]}>
        <boxGeometry args={[2, 0.8, 1.4]} />
        <meshPhysicalMaterial 
          color={0x0a0a0a}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      
      {/* Wheels */}
      <mesh position={[1.2, -0.3, 0.9]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.3]} />
        <meshPhysicalMaterial color={0x333333} metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[1.2, -0.3, -0.9]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.3]} />
        <meshPhysicalMaterial color={0x333333} metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[-1.2, -0.3, 0.9]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.3]} />
        <meshPhysicalMaterial color={0x333333} metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[-1.2, -0.3, -0.9]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.3]} />
        <meshPhysicalMaterial color={0x333333} metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Headlights */}
      <mesh position={[2.1, 0.4, 0.6]}>
        <sphereGeometry args={[0.15]} />
        <meshBasicMaterial color={0xffffff} />
      </mesh>
      <mesh position={[2.1, 0.4, -0.6]}>
        <sphereGeometry args={[0.15]} />
        <meshBasicMaterial color={0xffffff} />
      </mesh>
      
      {/* Taillights */}
      <mesh position={[-2.1, 0.4, 0.6]}>
        <sphereGeometry args={[0.1]} />
        <meshBasicMaterial color={0xff0000} />
      </mesh>
      <mesh position={[-2.1, 0.4, -0.6]}>
        <sphereGeometry args={[0.1]} />
        <meshBasicMaterial color={0xff0000} />
      </mesh>
    </group>
  );
};

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

// Simple 3D Scene component
const Simple3DScene = () => {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => prev + 0.01);
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div 
        className="transform-gpu transition-transform duration-100"
        style={{ 
          transform: `perspective(800px) rotateY(${rotation}rad) rotateX(0.1rad)`,
          width: '200px',
          height: '100px'
        }}
      >
        {/* Simplified car silhouette */}
        <div className="relative w-full h-full">
          {/* Car body */}
          <div 
            className="absolute bg-black rounded-lg shadow-2xl"
            style={{
              width: '100%',
              height: '40%',
              top: '30%',
              background: 'linear-gradient(145deg, #0a0a0a, #1a1a1a)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)'
            }}
          />
          {/* Car roof */}
          <div 
            className="absolute bg-black rounded-lg"
            style={{
              width: '60%',
              height: '25%',
              top: '15%',
              left: '20%',
              background: 'linear-gradient(145deg, #0a0a0a, #2a2a2a)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)'
            }}
          />
          {/* Wheels */}
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
          {/* Headlights */}
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
    </div>
  );
};

interface Porsche3DProps {
  className?: string;
}

const Porsche3D: React.FC<Porsche3DProps> = ({ className = "" }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [use3D, setUse3D] = useState(false);

  useEffect(() => {
    // Check if 3D libraries are available
    const check3DSupport = async () => {
      try {
        await import('@react-three/fiber');
        await import('@react-three/drei');
        setUse3D(true);
      } catch (err) {
        console.log('3D libraries not available, using fallback');
        setUse3D(false);
      }
      
      // Simulate loading time
      setTimeout(() => {
        setIsLoaded(true);
      }, 500);
    };

    check3DSupport();
  }, []);

  if (error || !use3D) {
    // Fallback - Enhanced 2D representation
    return (
      <div className={`relative w-full h-full bg-black/30 ${className}`}>
        <LogoBackground />
        <Simple3DScene />
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      <LogoBackground />
      
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-white/70 text-sm">Caricamento 3D...</div>
        </div>
      )}
      
      <motion.div 
        className="w-full h-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      >
        <Suspense fallback={<Simple3DScene />}>
          <Canvas
            className="w-full h-full cursor-grab active:cursor-grabbing"
            onCreated={() => setIsLoaded(true)}
            onError={() => setError(true)}
            camera={{ position: [8, 4, 8], fov: 50 }}
          >
            {/* Lighting setup */}
            <ambientLight intensity={0.3} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <directionalLight position={[-10, 10, -5]} intensity={0.5} />
            <pointLight position={[0, 10, 0]} intensity={0.5} />
            
            {/* 3D Porsche Model */}
            <PorscheModel />
            
            {/* Basic controls */}
            <orbitControls
              enablePan={false}
              enableZoom={true}
              maxDistance={15}
              minDistance={5}
              maxPolarAngle={Math.PI / 2}
              autoRotate={false}
              enableDamping
              dampingFactor={0.05}
            />
          </Canvas>
        </Suspense>
      </motion.div>
    </div>
  );
};

export default Porsche3D;
