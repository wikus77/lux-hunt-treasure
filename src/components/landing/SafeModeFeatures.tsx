// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// SAFE MODE FEATURES - Static Version Without Canvas/3D

import React from 'react';

const SafeModeFeatures = () => {
  console.log("🛡️ SafeModeFeatures - Static version active");
  
  const features = [
    {
      title: "Advanced AI",
      description: "Intelligent systems that learn and adapt to provide personalized experiences for every user interaction.",
      color: "#00FFFF",
      icon: "🤖"
    },
    {
      title: "Real-time Sync",
      description: "Seamless synchronization across all devices with instant updates and collaborative features.",
      color: "#FF6B6B",
      icon: "⚡"
    },
    {
      title: "Immersive UI",
      description: "Next-generation interfaces that blur the line between digital and physical experiences.",
      color: "#4ECDC4",
      icon: "🎨"
    },
    {
      title: "Cloud Native",
      description: "Built for the cloud with scalable architecture and global content delivery networks.",
      color: "#45B7D1",
      icon: "☁️"
    },
    {
      title: "Security First",
      description: "End-to-end encryption and privacy-focused design that keeps your data protected always.",
      color: "#96CEB4",
      icon: "🔒"
    },
    {
      title: "Open Platform",
      description: "Extensible ecosystem with powerful APIs and developer tools for unlimited possibilities.",
      color: "#FFEAA7",
      icon: "🔧"
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
            <div key={index} className="relative h-96 bg-gray-800/30 backdrop-blur-sm rounded-3xl border border-gray-700 overflow-hidden">
              {/* Static icon background */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-6xl opacity-30" style={{ color: feature.color }}>
                  {feature.icon}
                </div>
              </div>

              {/* Static overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/95 via-gray-800/60 to-transparent"></div>

              {/* Content */}
              <div className="relative h-full flex flex-col justify-end p-8 z-10">
                <h3 className="text-2xl font-medium mb-4 text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
                
                {/* Static indicator */}
                <div className="mt-6 w-8 h-8 rounded-full border-2 border-cyan-500/50 flex items-center justify-center">
                  <span className="text-cyan-400 text-sm">→</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to action */}
        <div className="text-center mt-16">
          <button className="px-12 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full text-lg font-medium transition-colors duration-300">
            <span>Explore All Features</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default SafeModeFeatures;