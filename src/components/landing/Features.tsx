// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';

const SafeSimpleShape = ({ color }: { color: string }) => {
  try {
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={color} />
      </mesh>
    );
  } catch (error) {
    console.error("❌ SafeSimpleShape error:", error);
    // Ultra-safe fallback
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#00FFFF" />
      </mesh>
    );
  }
};

const SafeCanvas = ({ color, children }: { color: string; children?: React.ReactNode }) => {
  const [hasError, setHasError] = React.useState(false);

  if (hasError) {
    // Static fallback if Canvas fails
    return (
      <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-6xl opacity-50" style={{ color }}>
          ✦
        </div>
      </div>
    );
  }

  try {
    return (
      <Canvas 
        camera={{ position: [0, 0, 3], fov: 50 }}
        onError={() => setHasError(true)}
        fallback={
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <div className="text-4xl opacity-30" style={{ color }}>⟳</div>
          </div>
        }
      >
        <Suspense fallback={
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color={color} />
          </mesh>
        }>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <SafeSimpleShape color={color} />
        </Suspense>
      </Canvas>
    );
  } catch (error) {
    console.error("❌ SafeCanvas error:", error);
    setHasError(true);
    return null;
  }
};

const Feature3D = ({ title, description, color }: {
  title: string;
  description: string;
  color: string;
}) => {
  return (
    <div className="group relative h-96 bg-gray-800/30 backdrop-blur-sm rounded-3xl border border-gray-700 hover:border-cyan-500/50 transition-all duration-500 overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0">
        <SafeCanvas color={color} />
      </div>

      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/95 via-gray-800/60 to-transparent group-hover:from-gray-900/98 transition-all duration-500"></div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end p-8 z-10">
        <h3 className="text-2xl font-medium mb-4 text-white group-hover:text-cyan-400 transition-colors">
          {title}
        </h3>
        <p className="text-gray-300 leading-relaxed">
          {description}
        </p>
        
        {/* Hover indicator */}
        <div className="mt-6 w-8 h-8 rounded-full border-2 border-cyan-500/50 flex items-center justify-center group-hover:border-cyan-400 group-hover:bg-cyan-400/10 transition-all duration-300">
          <span className="text-cyan-400 text-sm">→</span>
        </div>
      </div>

      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/0 via-cyan-500/0 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
    </div>
  );
};

const FeaturesSection = () => {
  console.log("🎯 FeaturesSection component mounting");
  
  const features = [
    {
      title: "Advanced AI",
      description: "Intelligent systems that learn and adapt to provide personalized experiences for every user interaction.",
      color: "#00FFFF"
    },
    {
      title: "Real-time Sync",
      description: "Seamless synchronization across all devices with instant updates and collaborative features.",
      color: "#FF6B6B"
    },
    {
      title: "Immersive UI",
      description: "Next-generation interfaces that blur the line between digital and physical experiences.",
      color: "#4ECDC4"
    },
    {
      title: "Cloud Native",
      description: "Built for the cloud with scalable architecture and global content delivery networks.",
      color: "#45B7D1"
    },
    {
      title: "Security First",
      description: "End-to-end encryption and privacy-focused design that keeps your data protected always.",
      color: "#96CEB4"
    },
    {
      title: "Open Platform",
      description: "Extensible ecosystem with powerful APIs and developer tools for unlimited possibilities.",
      color: "#FFEAA7"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-light mb-8 text-white">
            Powerful
            <span className="block text-cyan-400">Features</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Discover the capabilities that make M1SSION™ the platform of choice for next-generation applications.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Feature3D
              key={index}
              title={feature.title}
              description={feature.description}
              color={feature.color}
            />
          ))}
        </div>

        {/* Call to action */}
        <div className="text-center mt-16">
          <button className="group relative px-12 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full text-lg font-medium overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/25">
            <span className="relative z-10">Explore All Features</span>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;