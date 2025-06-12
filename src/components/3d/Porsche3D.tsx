
import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

// Simple 3D car geometry using basic Three.js shapes
const PorscheModel = () => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Auto rotation
  useFrame((state) => {
    if (groupRef.current && !hovered) {
      groupRef.current.rotation.y += 0.005;
    }
  });

  // Car body materials
  const bodyMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x0a0a0a,
    metalness: 0.9,
    roughness: 0.1,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1
  });

  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x222222,
    metalness: 0.1,
    roughness: 0.1,
    transmission: 0.9,
    transparent: true,
    opacity: 0.3
  });

  const wheelMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x333333,
    metalness: 0.8,
    roughness: 0.2
  });

  return (
    <group 
      ref={groupRef}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      scale={hovered ? 1.1 : 1}
    >
      {/* Car body - main chassis */}
      <mesh position={[0, 0.3, 0]} material={bodyMaterial}>
        <boxGeometry args={[4, 1, 1.8]} />
      </mesh>
      
      {/* Car hood */}
      <mesh position={[1.5, 0.5, 0]} material={bodyMaterial}>
        <boxGeometry args={[1, 0.4, 1.6]} />
      </mesh>
      
      {/* Car roof/cabin */}
      <mesh position={[-0.5, 1, 0]} material={bodyMaterial}>
        <boxGeometry args={[2, 0.8, 1.4]} />
      </mesh>
      
      {/* Windshield */}
      <mesh position={[0.3, 1.2, 0]} rotation={[0.1, 0, 0]} material={glassMaterial}>
        <planeGeometry args={[1.4, 0.8]} />
      </mesh>
      
      {/* Side windows */}
      <mesh position={[-0.5, 1, 0.75]} material={glassMaterial}>
        <planeGeometry args={[1.8, 0.6]} />
      </mesh>
      <mesh position={[-0.5, 1, -0.75]} rotation={[0, Math.PI, 0]} material={glassMaterial}>
        <planeGeometry args={[1.8, 0.6]} />
      </mesh>
      
      {/* Wheels */}
      <mesh position={[1.2, -0.3, 0.9]} rotation={[Math.PI / 2, 0, 0]} material={wheelMaterial}>
        <cylinderGeometry args={[0.35, 0.35, 0.3]} />
      </mesh>
      <mesh position={[1.2, -0.3, -0.9]} rotation={[Math.PI / 2, 0, 0]} material={wheelMaterial}>
        <cylinderGeometry args={[0.35, 0.35, 0.3]} />
      </mesh>
      <mesh position={[-1.2, -0.3, 0.9]} rotation={[Math.PI / 2, 0, 0]} material={wheelMaterial}>
        <cylinderGeometry args={[0.35, 0.35, 0.3]} />
      </mesh>
      <mesh position={[-1.2, -0.3, -0.9]} rotation={[Math.PI / 2, 0, 0]} material={wheelMaterial}>
        <cylinderGeometry args={[0.35, 0.35, 0.3]} />
      </mesh>
      
      {/* Headlights */}
      <mesh position={[2.1, 0.4, 0.6]} material={new THREE.MeshBasicMaterial({ color: 0xffffff })}>
        <sphereGeometry args={[0.15]} />
      </mesh>
      <mesh position={[2.1, 0.4, -0.6]} material={new THREE.MeshBasicMaterial({ color: 0xffffff })}>
        <sphereGeometry args={[0.15]} />
      </mesh>
      
      {/* Taillights */}
      <mesh position={[-2.1, 0.4, 0.6]} material={new THREE.MeshBasicMaterial({ color: 0xff0000 })}>
        <sphereGeometry args={[0.1]} />
      </mesh>
      <mesh position={[-2.1, 0.4, -0.6]} material={new THREE.MeshBasicMaterial({ color: 0xff0000 })}>
        <sphereGeometry args={[0.1]} />
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

interface Porsche3DProps {
  className?: string;
}

const Porsche3D: React.FC<Porsche3DProps> = ({ className = "" }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  if (error) {
    // Fallback static image
    return (
      <div className={`relative w-full h-full bg-black/30 ${className}`}>
        <LogoBackground />
        <div 
          className="w-full h-full bg-center bg-contain bg-no-repeat"
          style={{ 
            backgroundImage: "url('/lovable-uploads/4c6e1a87-13cd-49d8-89dc-83704f46ebd5.png')",
            backgroundPosition: "center",
          }}
        />
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
        <Canvas
          className="w-full h-full cursor-grab active:cursor-grabbing"
          onCreated={() => setIsLoaded(true)}
          onError={() => setError(true)}
        >
          <PerspectiveCamera makeDefault position={[8, 4, 8]} fov={50} />
          
          {/* Lighting setup */}
          <ambientLight intensity={0.3} />
          <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
          <directionalLight position={[-10, 10, -5]} intensity={0.5} />
          <pointLight position={[0, 10, 0]} intensity={0.5} />
          
          {/* Environment for reflections */}
          <Environment preset="studio" />
          
          {/* 3D Porsche Model */}
          <PorscheModel />
          
          {/* Controls */}
          <OrbitControls
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
      </motion.div>
    </div>
  );
};

export default Porsche3D;
