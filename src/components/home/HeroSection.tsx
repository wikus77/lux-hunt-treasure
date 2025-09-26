
import React from "react";
import { motion } from "framer-motion";
import { ParallaxImage } from "@/components/ui/parallax-image";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { ArrowRight } from "lucide-react";
// Import M1SSION PRIZE hero images - Real luxury assets
const heroImages = [
  "/assets/m1ssion-prize/hero-forest-watch.png",
  "/assets/m1ssion-prize/hero-forest-lambo.png", 
  "/assets/m1ssion-prize/hero-forest-lambo-porsche.png",
  "/assets/m1ssion-prize/treasure-forest-car.png"
];

const stagger = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.25,
      delayChildren: 0.1,
    },
  },
};

const fadeSlideUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const HeroSection = () => {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

  // Auto-rotate hero images every 8 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % heroImages.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section 
      className="min-h-screen w-full relative flex items-center justify-center overflow-hidden py-24 px-4"
      data-scroll-section
    >
      {/* M1SSION PRIZE Hero Background with Rotator */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <img 
          src={heroImages[currentImageIndex]}
          alt="M1SSION PRIZE luxury assets - Image for illustrative purposes only"
          className="w-full h-full object-cover transition-opacity duration-1000"
        />
        {/* Dark overlay to maintain text readability */}
        <div className="absolute inset-0 bg-black/40 bg-gradient-to-b from-black/30 via-black/40 to-black/60" />
        
        {/* Image disclaimer overlay */}
        <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded text-xs text-white/80">
          Image for illustrative purposes only
        </div>
        
        {/* Static dots for atmosphere */}
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
              opacity: 0.3,
              filter: "blur(1px)"
            }}
          />
        ))}
      </div>
      
      <motion.div 
        className="relative z-20 max-w-4xl mx-auto text-center" 
        data-scroll 
        data-scroll-speed="0.1"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {/* Main Title with the styled M1SSION text */}
        <motion.div
          variants={fadeSlideUp}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-6xl xl:text-7xl font-orbitron font-light">
            WELCOME TO{" "}
            <span>
              <span className="text-[#00E5FF]">M1</span>
              <span className="text-white">SSION<span className="text-xs align-top">™</span></span>
            </span>
          </h1>
        </motion.div>
        
        <motion.div
          variants={fadeSlideUp}
          className="mb-8"
        >
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            Un premio attende chi sa vedere oltre.
            Gli indizi non sono nascosti: sono camuffati.
            Serve logica, freddezza e visione.
            La sfida è iniziata. Questa è <span className="text-[#00E5FF]">M1</span><span className="text-white">SSION<span className="text-xs align-top">™</span></span>.
          </p>
        </motion.div>
        
        <motion.div
          variants={fadeSlideUp}
          className="mb-10"
        >
          <p className="text-yellow-300 text-sm md:text-base font-orbitron tracking-widest">
            IT IS POSSIBLE
          </p>
        </motion.div>
        
        <motion.div
          variants={fadeSlideUp}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MagneticButton
              className="neon-button px-8 py-3 rounded-full text-black font-bold bg-gradient-to-r from-cyan-400 to-blue-600 hover:shadow-[0_0_15px_rgba(0,229,255,0.5)]"
              strength={30}
            >
              JOIN THE HUNT
            </MagneticButton>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MagneticButton
              className="px-8 py-3 rounded-full text-white font-bold bg-black/30 border border-white/10 hover:bg-black/50 hover:border-white/20"
              strength={20}
            >
              LEARN MORE
            </MagneticButton>
          </motion.div>
        </motion.div>
        
        {/* Static decorative element instead of animated glow */}
        <motion.div
          className="absolute bottom-40 w-3/4 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent"
          variants={fadeSlideUp}
        />
      </motion.div>
    </section>
  );
};

export default HeroSection;
