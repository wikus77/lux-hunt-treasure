
import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { AnimatedSection } from "@/components/ui/animated-section";
import { MagneticButton } from "@/components/ui/magnetic-button";

const VideoSection = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Placeholder video URL (replace with your actual video)
  const videoUrl = "https://assets.mixkit.co/videos/preview/mixkit-driving-a-black-sports-car-fast-in-a-tunnel-with-light-reflections-41665-large.mp4";
  
  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  const handleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };
  
  return (
    <section className="py-20 md:py-32 relative" data-scroll-section>
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#06071b] via-black to-[#06071b]"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-4">
        <AnimatedSection className="text-center mb-16" delay={0.2} once>
          <h2 className="text-4xl md:text-5xl font-orbitron font-light mb-6">
            <span className="gradient-text-cyan">Come funziona</span> <span className="text-white">M1SSION</span>
          </h2>
          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto">
            Un'esperienza immersiva che combina tecnologia, strategia e adrenalina. Scopri come partecipare alla sfida.
          </p>
        </AnimatedSection>
        
        <div className="relative rounded-xl overflow-hidden shadow-[0_20px_60px_-20px_rgba(0,229,255,0.3)]" data-scroll data-scroll-speed="0.1">
          {/* Video Player */}
          <div className="aspect-video relative overflow-hidden">
            <video 
              ref={videoRef}
              className="w-full h-full object-cover"
              poster="/lovable-uploads/ee63e6a9-208d-43f5-8bad-4c94f9c066cd.png"
              muted
              loop
              playsInline
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            
            {/* Video Overlay */}
            <div className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500 flex items-center justify-center ${isPlaying ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <MagneticButton
                  className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center hover:bg-white/20 transition-all duration-300 group"
                  strength={40}
                  onClick={handlePlayPause}
                >
                  <Play className="w-8 h-8 text-white fill-white" />
                </MagneticButton>
              </motion.div>
              
              <div className="absolute bottom-8 left-0 right-0 text-center">
                <h3 className="text-2xl md:text-3xl font-orbitron font-medium text-white">
                  Guarda il video esplicativo
                </h3>
                <p className="text-white/70 mt-2">
                  Durata: 1:30 min
                </p>
              </div>
            </div>
            
            {/* Video Controls */}
            <div className={`absolute bottom-6 left-6 right-6 flex justify-between items-center transition-opacity duration-300 ${isPlaying ? 'opacity-100 hover:opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <MagneticButton
                className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/20 hover:bg-white/20 transition-all duration-300"
                strength={15}
                onClick={handlePlayPause}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-white" />
                ) : (
                  <Play className="w-5 h-5 text-white" />
                )}
              </MagneticButton>
              
              <MagneticButton
                className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/20 hover:bg-white/20 transition-all duration-300"
                strength={15}
                onClick={handleMute}
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 text-white" />
                ) : (
                  <Volume2 className="w-5 h-5 text-white" />
                )}
              </MagneticButton>
            </div>
          </div>
          
          {/* Video Info */}
          <div className="bg-black/80 backdrop-blur-md p-6 md:p-8 border-t border-white/10">
            <h3 className="text-xl md:text-2xl font-orbitron font-medium text-white mb-3">
              Il percorso della missione
            </h3>
            <p className="text-white/70">
              Ogni mese, una nuova missione inizia. Ricevi indizi, risolvi enigmi, esplora la mappa e scopri dove si nasconde il premio. Segui le notifiche, interpreta i dati e raggiungi per primo la destinazione finale per vincere l'auto in palio.
            </p>
            
            <div className="mt-6 flex flex-wrap gap-4">
              <div className="flex-1 min-w-[150px] bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="text-cyan-400 text-2xl font-orbitron mb-2">01</div>
                <h4 className="font-medium text-white mb-1">Iscriviti</h4>
                <p className="text-sm text-white/70">Crea un account e unisciti alla community di cacciatori</p>
              </div>
              
              <div className="flex-1 min-w-[150px] bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="text-cyan-400 text-2xl font-orbitron mb-2">02</div>
                <h4 className="font-medium text-white mb-1">Ricevi indizi</h4>
                <p className="text-sm text-white/70">Interpreta notifiche e informazioni strategiche</p>
              </div>
              
              <div className="flex-1 min-w-[150px] bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="text-cyan-400 text-2xl font-orbitron mb-2">03</div>
                <h4 className="font-medium text-white mb-1">Trova il premio</h4>
                <p className="text-sm text-white/70">Raggiungi per primo la destinazione finale</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoSection;
