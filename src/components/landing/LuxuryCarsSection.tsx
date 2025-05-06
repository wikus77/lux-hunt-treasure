
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ParallaxImage } from '@/components/ui/parallax-image';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import DetailsModal from './DetailsModal';

const LuxuryCarsSection = () => {
  const [showDetails, setShowDetails] = useState(false);
  
  return (
    <section className="py-16 px-4 bg-gradient-to-b from-black to-blue-950/20 relative">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute inset-0 bg-[url('/grid-pattern.png')] opacity-5"
          data-parallax="background"
          data-parallax-speed="-0.15"
        ></div>
        
        {/* Circles for background decoration */}
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-cyan-500/10 blur-3xl"
            style={{
              width: `${Math.random() * 400 + 100}px`,
              height: `${Math.random() * 400 + 100}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.1 + (i % 3) * 0.03
            }}
            data-parallax="background"
            data-parallax-speed={`-${0.2 + (i % 3) * 0.05}`}
          ></div>
        ))}
      </div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
          data-parallax="scroll"
          data-parallax-speed="0.1"
        >
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-6"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            Fallo ora, Fallo meglio di tutti
          </motion.h2>
          
          <motion.p 
            className="text-lg max-w-2xl mx-auto text-white/80"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            Questa è <span className="text-[#00E5FF]">M1</span><span className="text-white">SSION</span>, dove ogni decisione conta e ogni soluzione ti avvicina alla vittoria.
          </motion.p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <motion.div
            className="relative overflow-hidden rounded-lg bg-white/5"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            data-parallax="card"
            data-parallax-speed="0.05"
          >
            <ParallaxImage
              src="/events/ferrari-sf90.jpg"
              alt="Ferrari SF90"
              className="aspect-video md:aspect-[4/3] object-cover"
              speed={0.15}
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <h3 className="font-bold text-xl">Supercar di Lusso</h3>
              <p className="text-sm text-white/80">Vincile completando le missioni</p>
            </div>
          </motion.div>
          
          <motion.div
            className="relative overflow-hidden rounded-lg bg-white/5"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            data-parallax="card"
            data-parallax-speed="0.1"
          >
            <ParallaxImage
              src="/events/tesla-model-s.jpg"
              alt="Tesla Model S"
              className="aspect-video md:aspect-[4/3] object-cover"
              speed={0.2}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <h3 className="font-bold text-xl">Auto Elettriche</h3>
              <p className="text-sm text-white/80">Premi esclusivi per i finalisti</p>
            </div>
          </motion.div>
          
          <motion.div
            className="relative overflow-hidden rounded-lg bg-white/5"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            data-parallax="card"
            data-parallax-speed="0.15"
          >
            <ParallaxImage
              src="/events/porsche-911.jpg"
              alt="Porsche 911"
              className="aspect-video md:aspect-[4/3] object-cover"
              speed={0.25}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <h3 className="font-bold text-xl">Premi Aggiuntivi</h3>
              <p className="text-sm text-white/80">Orologi, viaggi e molto altro</p>
            </div>
          </motion.div>
        </div>
        
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          data-parallax="scroll"
          data-parallax-speed="0.2"
        >
          <Button 
            onClick={() => setShowDetails(true)}
            className="bg-gradient-to-r from-[#00E5FF] to-[#00BFFF] text-black hover:shadow-[0_0_15px_rgba(0,229,255,0.5)] rounded-full"
          >
            <Info className="mr-2 h-4 w-4" />
            Scopri di più
          </Button>
        </motion.div>
      </div>
      
      <DetailsModal
        open={showDetails}
        onClose={() => setShowDetails(false)}
        type="prizes"
        title="Auto di Lusso in Palio"
      />
    </section>
  );
};

export default LuxuryCarsSection;
