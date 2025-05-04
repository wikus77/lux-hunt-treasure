
import React from "react";
import { motion } from "framer-motion";

interface PresentationSectionProps {
  visible: boolean;
}

const PresentationSection = ({ visible }: PresentationSectionProps) => {
  // Ensure component is always visible regardless of props
  return (
    <section className="relative py-20 px-4 bg-black" style={{ opacity: 1, visibility: "visible" }}>
      <div className="max-w-6xl mx-auto">
        <div 
          className="glass-card p-8 md:p-12 text-center relative overflow-hidden"
          // Remove animations that might cause issues
        >
          <h2 className="text-3xl md:text-4xl font-orbitron mb-8">
            WELCOME TO{" "}
            <span>
              <span style={{ color: '#00E5FF' }} className="text-[#00E5FF]">M1</span>
              <span style={{ color: '#FFFFFF' }} className="text-white">SSION</span>
            </span>
          </h2>
          
          <p className="text-lg mb-6 max-w-3xl mx-auto text-gray-200">
            In the future, treasure hunting isn't just a game... it's a global challenge. Every month, 
            a luxury car vanishes. Only the most intuitive, strategic, and quick-minded will decipher 
            the clues and find where the prize is hidden.
          </p>
          
          <p className="text-lg mb-6 max-w-3xl mx-auto text-gray-200">
            Join <span className="text-[#00E5FF] font-bold">M1</span><span className="text-white font-bold">SSION</span>. Live the adventure. 
            Find the prize. Change your destiny.
          </p>

          {/* Simple static accent line instead of animated one */}
          <div 
            className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent"
          />
        </div>
      </div>
    </section>
  );
};

export default PresentationSection;
