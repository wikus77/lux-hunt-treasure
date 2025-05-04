
import React from "react";
import { motion } from "framer-motion";

const LandingHeader = () => {
  return (
    <section className="relative min-h-screen w-full flex flex-col items-center justify-center text-center px-4 py-16">
      {/* Animated background particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              background: i % 2 === 0 ? "#00E5FF" : "#8A2BE2",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              filter: "blur(1px)"
            }}
            animate={{
              y: [0, -30, 0, 30, 0],
              x: [0, 15, 0, -15, 0],
              opacity: [0.2, 0.7, 0.4, 0.7, 0.2]
            }}
            transition={{
              duration: Math.random() * 10 + 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="z-10 max-w-5xl">
        {/* Main Title with the styled M1SSION text */}
        <h1 className="text-4xl md:text-6xl xl:text-7xl font-orbitron font-light mb-6">
          WELCOME TO{" "}
          <span>
            <span style={{ color: '#00E5FF' }} className="text-[#00E5FF]">M1</span>
            <span style={{ color: '#FFFFFF' }} className="text-white">SSION</span>
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Every month, a new luxury car disappears. Only the most intuitive, 
          strategic, and fastest will interpret the clues and discover where 
          the prize is hidden.
        </p>
        
        <p className="text-yellow-300 text-sm md:text-base font-orbitron tracking-widest mb-10">
          IT IS POSSIBLE
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button className="neon-button px-8 py-3 rounded-full text-black font-bold bg-gradient-to-r from-cyan-400 to-blue-600 hover:shadow-[0_0_15px_rgba(0,229,255,0.5)]">
            JOIN THE HUNT
          </button>
          <button className="px-8 py-3 rounded-full text-white font-bold bg-black/30 border border-white/10 hover:bg-black/50 hover:border-white/20 transition-all">
            LEARN MORE
          </button>
        </div>
      </div>
      
      {/* Decorative elements - animated glow */}
      <motion.div
        className="absolute bottom-40 w-3/4 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent"
        animate={{
          opacity: [0.3, 0.8, 0.3],
          filter: ["blur(1px)", "blur(3px)", "blur(1px)"]
        }}
        transition={{ duration: 5, repeat: Infinity }}
      />
    </section>
  );
};

export default LandingHeader;
