
import React from "react";
import { motion } from "framer-motion";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { AnimatedSection } from "@/components/ui/animated-section";
import { ArrowRight } from "lucide-react";

const CallToAction = () => {
  return (
    <section className="py-24 relative overflow-hidden" data-scroll-section>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#06071b] to-black"></div>
      
      {/* Glowing circle */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] rounded-full bg-cyan-400/5 filter blur-[100px]"></div>
      
      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <AnimatedSection delay={0.1} once>
          <motion.span 
            className="inline-block py-2 px-4 bg-yellow-400/10 text-yellow-400 rounded-full text-sm font-medium mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            PRONTO PER LA SFIDA?
          </motion.span>
        </AnimatedSection>
        
        <AnimatedSection delay={0.2} once>
          <motion.h2
            className="text-5xl md:text-6xl lg:text-7xl font-orbitron font-bold mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <span className="bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">IT IS</span>{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">POSSIBLE</span>
          </motion.h2>
        </AnimatedSection>
        
        <AnimatedSection delay={0.3} once>
          <motion.p
            className="text-xl text-white/70 max-w-2xl mx-auto mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            Non è solo un sogno. Ogni mese qualcuno vince davvero un'auto di lusso. Potrebbe essere il tuo turno questa volta.
          </motion.p>
        </AnimatedSection>
        
        <AnimatedSection delay={0.4} once>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <MagneticButton
              className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black px-10 py-5 rounded-full font-bold text-xl flex items-center gap-3 mx-auto hover:shadow-[0_0_30px_rgba(250,204,21,0.4)] transition-all duration-300"
              strength={50}
            >
              Partecipa alla missione <ArrowRight className="w-6 h-6" />
            </MagneticButton>
          </motion.div>
        </AnimatedSection>
        
        <AnimatedSection delay={0.5} once>
          <motion.p
            className="text-white/50 mt-8 text-sm"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            viewport={{ once: true }}
          >
            Ogni 30 giorni, un nuovo vincitore. Un nuovo sogno che si avvera.
          </motion.p>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default CallToAction;
