
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
        >
          <h2 className="text-3xl md:text-4xl font-orbitron mb-8">
            WELCOME TO{" "}
            <span>
              <span className="text-[#00E5FF]">M1</span>
              <span className="text-white">SSION<span className="text-xs align-top">™</span></span>
            </span>
          </h2>
          
          {/* Rimosso il blocco del codice agente come richiesto */}
          
          <p className="text-lg mb-6 max-w-3xl mx-auto text-gray-200">
            In the near future...
            The world becomes a gameboard.
            The clues are encrypted. The stakes are real.
          </p>
          
          <p className="text-lg mb-6 max-w-3xl mx-auto text-gray-200">
            Thousands will try. Only a few will see the pattern.
            You're not just chasing a prize—you're chasing the proof that you can outthink them all.
          </p>

          <p className="text-lg mb-6 max-w-3xl mx-auto text-gray-200">
            This is <span className="text-[#00E5FF]">M1</span><span className="text-white">SSION<span className="text-xs align-top">™</span></span>. The countdown has begun. Are you ready?
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
