
import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { AnimatedSection } from "@/components/ui/animated-section";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

const VideoExplainer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

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

  // For a placeholder, we'll use a mockup. In production, replace with actual video URL
  const videoUrl = "https://www.youtube.com/watch?v=example";

  return (
    <section className="py-24 relative bg-black" data-scroll-section>
      <div className="max-w-6xl mx-auto px-4">
        <AnimatedSection className="text-center mb-12" delay={0.1} once>
          <span className="inline-block py-2 px-4 bg-cyan-400/10 text-cyan-400 rounded-full text-sm font-medium mb-4">
            COME FUNZIONA
          </span>
          <h2 className="text-4xl md:text-5xl font-orbitron font-light mb-6">
            Scopri <span className="text-cyan-400">M1SSION</span> in azione
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Guarda il video e scopri come partecipare alle sfide mensili per vincere auto di lusso
          </p>
        </AnimatedSection>
        
        <div className="relative rounded-2xl overflow-hidden aspect-video shadow-[0_0_40px_rgba(0,229,255,0.15)]">
          {/* Video mockup - in production replace with actual video element */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 h-full w-full flex items-center justify-center">
            {/* Poster image as a placeholder */}
            <img 
              src="/lovable-uploads/ba75c83e-5527-461d-a4c4-c0e0fbce55ae.png"
              alt="M1SSION Video Thumbnail" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            
            {/* Actual video - comment out for now */}
            {/* <video 
              ref={videoRef} 
              className="w-full h-full object-cover"
              poster="/path-to-poster.jpg"
              muted
              playsInline
              onEnded={() => setIsPlaying(false)}
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video> */}
            
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            
            {/* Play button */}
            <MagneticButton
              className="w-20 h-20 rounded-full bg-cyan-400 text-black flex items-center justify-center z-10 hover:scale-110 transition-transform duration-300 hover:shadow-[0_0_30px_rgba(0,229,255,0.6)]"
              onClick={handlePlayPause}
              strength={40}
            >
              {isPlaying ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8 ml-1" />
              )}
            </MagneticButton>
            
            {/* Video controls */}
            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center z-10">
              <div className="text-white font-medium">
                Come vincere un'auto di lusso con M1SSION
              </div>
              <button
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                onClick={handleMute}
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 text-white" />
                ) : (
                  <Volume2 className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <AnimatedSection delay={0.3} once>
            <MagneticButton
              className="bg-gradient-to-r from-cyan-400 to-blue-600 text-black px-8 py-4 rounded-full font-semibold text-lg hover:shadow-[0_0_20px_rgba(0,229,255,0.5)] transition-all duration-300"
              strength={30}
            >
              Partecipa alla sfida
            </MagneticButton>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

export default VideoExplainer;
