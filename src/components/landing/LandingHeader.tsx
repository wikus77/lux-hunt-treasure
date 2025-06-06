import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AnimatedCountdown } from "@/components/ui/animated-countdown";
import { getMissionDeadline } from "@/utils/countdownDate";

interface LandingHeaderProps {
  countdownCompleted?: boolean;
}

const LandingHeader = ({ countdownCompleted = false }: LandingHeaderProps) => {
  const navigate = useNavigate();

  const handleJoinHunt = () => {
    // Reindirizza sempre alla registrazione, indipendentemente dal countdown
    const preRegistrationSection = document.getElementById('pre-registration-form');
    if (preRegistrationSection) {
      preRegistrationSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLearnMore = () => {
    if (countdownCompleted) {
      navigate("/how-it-works");
    } else {
      console.log("Learn More button disabled until countdown completes");
      // Scroll to game explanation section instead
      const gameExplanationSection = document.getElementById('game-explanation');
      if (gameExplanationSection) {
        gameExplanationSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Target date from utility
  const targetDate = getMissionDeadline();

  return (
    <section className="relative min-h-screen w-full flex flex-col items-center justify-center text-center px-4 py-16">
      {/* Static background instead of animated particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden bg-gradient-to-b from-black to-[#111]">
        {/* Static dots instead of animated particles */}
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              background: i % 2 === 0 ? "#00E5FF" : "#8A2BE2",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.4,
              filter: "blur(1px)"
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
            <span className="text-[#00E5FF]">M1</span>
            <span className="text-white">SSION<span className="text-xs align-top">™</span></span>
          </span>
        </h1>
        
        {/* New Animated Countdown Timer */}
        <div className="mb-8">
          <AnimatedCountdown targetDate={targetDate} />
        </div>
        
        <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Un premio attende chi sa vedere oltre.
          Gli indizi non sono nascosti: sono camuffati.
          Serve logica, freddezza e visione.
          La sfida è iniziata. Questa è <span className="text-[#00E5FF]">M1</span><span className="text-white">SSION<span className="text-xs align-top">™</span></span>.
        </p>
        
        <p className="text-yellow-300 text-sm md:text-base font-orbitron tracking-widest mb-10">
          IT IS POSSIBLE
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button 
            className="neon-button px-8 py-3 rounded-full text-black font-bold bg-gradient-to-r from-cyan-400 to-blue-600 hover:shadow-[0_0_15px_rgba(0,229,255,0.5)]"
            onClick={handleJoinHunt}
          >
            JOIN THE HUNT
          </button>
          <button 
            className={`px-8 py-3 rounded-full text-white font-bold bg-black/30 border border-white/10 ${countdownCompleted ? 'hover:bg-black/50 hover:border-white/20' : 'opacity-70 cursor-not-allowed'}`}
            onClick={handleLearnMore}
            disabled={!countdownCompleted}
          >
            LEARN MORE
          </button>
        </div>
      </div>
      
      {/* Static decorative element instead of animated glow */}
      <div
        className="absolute bottom-40 w-3/4 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent"
      />
    </section>
  );
};

export default LandingHeader;
