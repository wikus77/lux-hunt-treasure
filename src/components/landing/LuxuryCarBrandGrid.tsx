
import React, { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  Environment, 
  OrbitControls, 
  useTexture, 
  Html, 
  Float, 
  PerspectiveCamera 
} from '@react-three/drei';
import { motion } from 'framer-motion';
import { luxuryCarsData } from '@/data/luxuryCarsData';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface BrandLogoProps {
  position: [number, number, number];
  logo: string;
  color: string;
  brand: string;
  onClick: () => void;
  isSelected: boolean;
}

function BrandLogo({ position, logo, color, brand, onClick, isSelected }: BrandLogoProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture(logo);
  
  // Simple hover animation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      
      // Add floating effect
      const t = state.clock.elapsedTime;
      meshRef.current.position.y = position[1] + Math.sin(t) * 0.05;
    }
  });
  
  return (
    <group>
      {/* Glow effect */}
      {isSelected && (
        <mesh position={position}>
          <sphereGeometry args={[1.2, 32, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.2} />
        </mesh>
      )}
      
      <Float 
        speed={2}
        rotationIntensity={0.5} 
        floatIntensity={0.5}
        position={position}
      >
        <mesh 
          ref={meshRef} 
          position={position}
          onClick={onClick}
          scale={isSelected ? 1.3 : 1}
        >
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial 
            map={texture} 
            transparent 
            opacity={1}
          />
        </mesh>
        
        {/* Brand name */}
        <Html position={[position[0], position[1] - 0.8, position[2]]}>
          <div className="text-center">
            <p 
              className={`text-xs font-medium transition-all duration-300 ${isSelected ? 'text-cyan-400 scale-125' : 'text-white/70'}`}
            >
              {brand}
            </p>
          </div>
        </Html>
      </Float>
    </group>
  );
}

interface CarDisplayProps {
  car: any;
}

function CarDisplay({ car }: CarDisplayProps) {
  return (
    <div className="car-preview-container absolute inset-x-0 bottom-0 h-80 w-full bg-gradient-to-t from-black to-transparent z-10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center h-full"
      >
        <div className="mb-2">
          <h3 className="text-cyan-400 text-xl font-orbitron text-center">
            {car.name}
          </h3>
          <p className="text-white/80 text-center text-sm">
            {car.shortDescription}
          </p>
        </div>

        <motion.div 
          className="car-image-container relative w-full h-48 mb-4"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <img 
            src={car.imageUrl || `/lovable-uploads/fef309b6-b056-46ef-bb7f-b2ccacdb5ce3.png`}
            alt={car.name}
            className="w-full h-full object-contain"
          />
          
          {/* Glow effect under car */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-4 bg-cyan-400/30 blur-xl rounded-full"></div>
        </motion.div>

        <div className="car-specs text-center">
          <p className="text-cyan-400 font-medium">
            {car.engine}
          </p>
          <p className="text-white/70 text-sm">
            {car.acceleration}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function Scene() {
  const [selectedCarIndex, setSelectedCarIndex] = useState<number>(0);
  const orbitControlsRef = useRef<any>(null);
  
  const handleSelectBrand = (index: number) => {
    setSelectedCarIndex(index);
  };
  
  // Calculate positions for logos in a grid
  const getLogoPositions = () => {
    const columns = 3;
    const spacing = 2.5;
    const startX = -spacing * (columns - 1) / 2;
    const startY = 1;
    
    return luxuryCarsData.map((_, index) => {
      const row = Math.floor(index / columns);
      const col = index % columns;
      return [startX + col * spacing, startY - row * spacing, 0] as [number, number, number];
    });
  };
  
  const positions = getLogoPositions();
  
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1, 6]} />
      <OrbitControls 
        ref={orbitControlsRef} 
        enableZoom={false} 
        enablePan={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 2}
      />
      
      <Environment preset="city" />
      
      {/* Background grid */}
      <gridHelper args={[50, 50, "#004d66", "#004d66"]} position={[0, -2, 0]} rotation={[Math.PI / 2, 0, 0]} />
      
      {/* Logos */}
      {luxuryCarsData.map((car, index) => (
        <BrandLogo
          key={car.id} 
          position={positions[index]}
          logo={car.logo}
          color={car.color}
          brand={car.brand}
          onClick={() => handleSelectBrand(index)}
          isSelected={selectedCarIndex === index}
        />
      ))}
    </>
  );
}

export default function LuxuryCarBrandGrid() {
  const [selectedCarIndex, setSelectedCarIndex] = useState<number>(0);
  
  const nextCar = () => {
    setSelectedCarIndex((prev) => (prev + 1) % luxuryCarsData.length);
  };
  
  const prevCar = () => {
    setSelectedCarIndex((prev) => (prev - 1 + luxuryCarsData.length) % luxuryCarsData.length);
  };

  return (
    <section className="py-16 relative overflow-hidden bg-black">
      <div className="max-w-6xl mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl text-center font-orbitron font-bold mb-12 text-white"
        >
          Vuoi provarci? <span className="text-cyan-400">Fallo.</span> Ma fallo per <span className="text-cyan-400">vincere.</span>
        </motion.h2>
        
        {/* 3D Scene */}
        <div className="relative h-[500px]">
          <Suspense fallback={
            <div className="w-full h-full flex items-center justify-center">
              <div className="loading-spinner">
                <div className="w-12 h-12 border-4 border-t-cyan-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                <p className="text-cyan-400 mt-4">Caricamento...</p>
              </div>
            </div>
          }>
            <Canvas>
              <Scene />
            </Canvas>
          </Suspense>
          
          {/* Car display */}
          <CarDisplay car={luxuryCarsData[selectedCarIndex]} />
          
          {/* Navigation arrows */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-8 z-20">
            <button
              onClick={prevCar}
              className="w-12 h-12 rounded-full bg-black/50 border border-cyan-400/50 flex items-center justify-center text-cyan-400 hover:bg-cyan-900/20 transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextCar}
              className="w-12 h-12 rounded-full bg-black/50 border border-cyan-400/50 flex items-center justify-center text-cyan-400 hover:bg-cyan-900/20 transition-colors"
            >
              <ChevronRight size={24} />
            </button>
          </div>
          
          {/* Grid lines for futuristic effect */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgwLDIwOSwyNTUsMC4xKSIgb3BhY2l0eT0iMC44IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiIC8+PC9zdmc+')]
            pointer-events-none opacity-10 z-0"></div>
        </div>
      </div>
    </section>
  );
}
