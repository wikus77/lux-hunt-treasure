// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';

const SimpleShape = ({ color }: { color: string }) => {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

const Feature3D = ({ title, description, color }: {
  title: string;
  description: string;
  color: string;
}) => {
  return (
    <div className="group relative h-96 bg-card/50 backdrop-blur-sm rounded-3xl border border-border/50 hover:border-primary/30 transition-all duration-500 overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <SimpleShape color={color} />
          </Suspense>
        </Canvas>
      </div>

      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent group-hover:from-background/95 transition-all duration-500"></div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end p-8 z-10">
        <h3 className="text-2xl font-medium mb-4 text-foreground group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-muted-foreground leading-relaxed">
          {description}
        </p>
        
        {/* Hover indicator */}
        <div className="mt-6 w-8 h-8 rounded-full border-2 border-primary/30 flex items-center justify-center group-hover:border-primary group-hover:bg-primary/10 transition-all duration-300">
          <span className="text-primary text-sm">→</span>
        </div>
      </div>

      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
    </div>
  );
};

const FeaturesSection = () => {
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
    <section className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-light mb-8 text-foreground">
            Powerful
            <span className="block text-muted-foreground">Features</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
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
          <button className="group relative px-12 py-4 bg-primary text-primary-foreground rounded-full text-lg font-medium overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl">
            <span className="relative z-10">Explore All Features</span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-cyan-500 to-primary bg-size-200 bg-pos-0 group-hover:bg-pos-100 transition-all duration-500"></div>
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;