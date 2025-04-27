
import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { ParallaxImage } from "@/components/ui/parallax-image";

const CallToAction = () => {
  // Countdown variables - replace with actual event date
  const eventDate = new Date("2025-05-30T00:00:00");
  const now = new Date();
  const timeRemaining = eventDate.getTime() - now.getTime();
  
  // Calculate days, hours, minutes
  const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
  
  return (
    <section className="min-h-[80vh] relative flex items-center py-20" data-scroll-section>
      {/* Background image with parallax effect */}
      <div className="absolute inset-0 z-0">
        <ParallaxImage
          src="/public/events/ferrari-sf90.jpg"
          alt="Luxury car"
          className="w-full h-full"
          imageClassName="w-full h-full object-cover"
          speed={0.2}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/60"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4" data-scroll data-scroll-speed="0.1">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left column: Main CTA */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-6xl font-orbitron font-bold mb-6 gradient-text-multi">
                Partecipa alla missione
              </h2>
              
              <p className="text-xl text-white/80 mb-8 max-w-lg">
                La prossima supercar potrebbe essere tua. Iscriviti ora e inizia la tua avventura con M1SSION, dove ogni indizio ti avvicina al premio dei tuoi sogni.
              </p>
              
              <div className="space-y-4">
                <MagneticButton
                  className="bg-gradient-to-r from-cyan-400 to-blue-600 text-black px-8 py-4 rounded-full font-semibold text-lg inline-flex items-center gap-2 hover:shadow-[0_0_20px_rgba(0,229,255,0.5)] transition-all duration-300 w-full md:w-auto justify-center"
                  strength={30}
                >
                  Iscriviti ora <ArrowRight className="w-5 h-5 ml-1" />
                </MagneticButton>
                
                <MagneticButton
                  className="px-8 py-4 rounded-full bg-transparent border border-white/20 text-white font-medium hover:bg-white/10 transition-all duration-300 w-full md:w-auto justify-center inline-flex"
                  strength={20}
                >
                  Scopri i piani premium
                </MagneticButton>
              </div>
            </motion.div>
          </div>
          
          {/* Right column: Countdown timer */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="glass-card border border-white/10 p-8 rounded-2xl backdrop-blur-xl"
          >
            <h3 className="text-2xl md:text-3xl font-orbitron mb-6 text-white">
              Prossima missione inizia tra:
            </h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-black/40 border border-white/10 rounded-xl p-4 text-center">
                <div className="text-4xl md:text-5xl font-mono text-cyan-400 mb-2">{days}</div>
                <div className="text-sm text-white/70 uppercase tracking-wider">giorni</div>
              </div>
              
              <div className="bg-black/40 border border-white/10 rounded-xl p-4 text-center">
                <div className="text-4xl md:text-5xl font-mono text-cyan-400 mb-2">{hours}</div>
                <div className="text-sm text-white/70 uppercase tracking-wider">ore</div>
              </div>
              
              <div className="bg-black/40 border border-white/10 rounded-xl p-4 text-center">
                <div className="text-4xl md:text-5xl font-mono text-cyan-400 mb-2">{minutes}</div>
                <div className="text-sm text-white/70 uppercase tracking-wider">minuti</div>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <motion.div 
                className="text-xl text-white"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                <span className="font-orbitron text-yellow-400">IT IS POSSIBLE</span>
              </motion.div>
              
              <p className="mt-4 text-white/70">
                La Ferrari SF90 Stradale sarà il premio della prossima missione.
                Preparati a vincere un'auto da sogno.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
